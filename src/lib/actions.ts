'use server';

import bcrypt from 'bcryptjs';
import { createPatientOnboardingRecord, createUser, fetchPatientByUserId, getUserByEmail, getUserByPhone } from './data';
import type { PatientOnboardingPayload, User } from './types';
import { canManageOnboarding, isPatientRole } from './role-utils';
import { createUserSession, getCurrentSessionUser } from './auth';

function generateTemporaryPassword(length = 10) {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
    return Array.from({ length }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join('');
}

function generatePatientIdentifier() {
    const now = new Date();
    const year = now.getFullYear();
    const stamp = `${now.getMonth() + 1}`.padStart(2, '0') + `${now.getDate()}`.padStart(2, '0');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `PT-${year}-${stamp}-${random}`;
}

function buildPortalUsername(firstName: string, surname: string, patientIdentifier: string) {
    const prefix = `${firstName}.${surname}`.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.+|\.+$/g, '');
    const suffix = patientIdentifier.split('-').slice(-1)[0];
    return `${prefix || 'patient'}.${suffix}`;
}

/**
 * Server Action to authenticate a user against the MySQL database.
 */
export async function authenticateUser(phone: string, password: string): Promise<{ success: boolean; user?: User & { patientId?: number }; error?: string }> {
    try {
        const userFromDb = await getUserByPhone(phone);
        if (!userFromDb) return { success: false, error: 'Invalid phone number or password.' };

        const passwordsMatch = await bcrypt.compare(password, userFromDb.password);
        if (!passwordsMatch) return { success: false, error: 'Invalid phone number or password.' };

        const { password: _, ...userWithoutPassword } = userFromDb;
        const user: User & { patientId?: number } = { ...userWithoutPassword };

        if (isPatientRole(user.role)) {
            const patient = await fetchPatientByUserId(user.id);
            if (patient) user.patientId = patient.id;
        }

        await createUserSession(user.id, Boolean(user.must_change_password));

        return { success: true, user };
    } catch (error) {
        console.error('authenticateUser Error:', error);
        return { success: false, error: 'An unexpected error occurred during login.' };
    }
}

/**
 * Server Action to register a new user/patient from the signup page.
 */
export async function registerUser(formData: any): Promise<{ success: boolean; error?: string }> {
    try {
        return { success: false, error: 'Self-service registration is disabled. Contact your administrator.' };
    } catch (error) {
        console.error('registerUser Error:', error);
        return { success: false, error: 'An unexpected error occurred during registration.' };
    }
}

/**
 * Server Action for staff to register a patient.
 */
export async function registerPatientByStaff(
    formData: PatientOnboardingPayload
): Promise<{ success: boolean; patientId?: number; patientIdentifier?: string; portalUsername?: string; temporaryPassword?: string; error?: string }> {
    try {
        const currentUser = await getCurrentSessionUser();
        if (!currentUser || !canManageOnboarding(currentUser.role)) {
            return { success: false, error: 'You do not have permission to onboard patients.' };
        }

        const existingUser = await getUserByEmail(formData.email);
        if (existingUser) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        const temporaryPassword = generateTemporaryPassword();
        const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
        const patientIdentifier = generatePatientIdentifier();
        const portalUsername = buildPortalUsername(formData.first_name, formData.surname, patientIdentifier);

        const userId = await createUser({
            name: `${formData.first_name} ${formData.surname}`.trim(),
            phone: formData.phone,
            email: formData.email,
            password: hashedPassword,
            role: 'user',
            avatarUrl: null,
            partner_id: formData.partner_id ?? formData.payer_id ?? null,
        });

        const patientId = await createPatientOnboardingRecord(userId, patientIdentifier, {
            ...formData,
            portal_username: portalUsername,
        });

        return {
            success: true,
            patientId,
            patientIdentifier,
            portalUsername,
            temporaryPassword,
        };
    } catch (error) {
        console.error('registerPatientByStaff Error:', error);
        return { success: false, error: 'An unexpected error occurred while creating the patient record.' };
    }
}
