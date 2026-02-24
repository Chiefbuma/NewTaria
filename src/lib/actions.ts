'use server';

import bcrypt from 'bcryptjs';
import { getUserByEmail, createUser, createPatient, fetchPatientByUserId } from './data';
import type { User } from './types';

/**
 * Server Action to authenticate a user against the MySQL database.
 * If user is a patient, includes their patientId for redirection.
 */
export async function authenticateUser(email: string, password: string): Promise<{ success: boolean; user?: User & { patientId?: number }; error?: string }> {
    try {
        const userFromDb = await getUserByEmail(email);

        if (!userFromDb) {
            return { success: false, error: 'Invalid email or password.' };
        }

        const passwordsMatch = await bcrypt.compare(password, userFromDb.password);

        if (!passwordsMatch) {
            return { success: false, error: 'Invalid email or password.' };
        }

        const { password: _, ...userWithoutPassword } = userFromDb;
        const user: User & { patientId?: number } = { ...userWithoutPassword };

        if (user.role === 'user') {
            const patient = await fetchPatientByUserId(user.id);
            if (patient) {
                user.patientId = patient.id;
            }
        }

        return { 
            success: true, 
            user
        };
    } catch (error) {
        console.error('Auth Error:', error);
        return { success: false, error: 'An unexpected error occurred during login.' };
    }
}

/**
 * Server Action to register a new user/patient from the signup page.
 */
export async function registerUser(formData: any): Promise<{ success: boolean; error?: string }> {
    try {
        const { first_name, surname, email, password, age, gender } = formData;
        
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await createUser({
            name: `${first_name} ${surname}`,
            email,
            password: hashedPassword,
            role: 'user', // Public signup is always 'patient' role
        });

        await createPatient({
            user_id: userId,
            first_name,
            surname,
            email,
            age: parseInt(age),
            gender,
            status: 'Pending'
        });

        return { success: true };
    } catch (error) {
        console.error('Registration Error:', error);
        return { success: false, error: 'An unexpected error occurred during registration.' };
    }
}

/**
 * Server Action for staff to register a patient.
 */
export async function registerPatientByStaff(formData: any): Promise<{ success: boolean; error?: string }> {
    try {
        const { first_name, surname, email, password, age, gender } = formData;
        
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return { success: false, error: 'A user with this email already exists.' };
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const userId = await createUser({
            name: `${first_name} ${surname}`,
            email,
            password: hashedPassword,
            role: 'user',
        });

        await createPatient({
            user_id: userId,
            first_name,
            surname,
            email,
            age: parseInt(age),
            gender,
            status: 'Pending'
        });

        return { success: true };
    } catch (error) {
        console.error('Staff Registration Error:', error);
        return { success: false, error: 'An unexpected error occurred while saving the patient.' };
    }
}
