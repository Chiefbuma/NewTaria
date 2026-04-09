import { db } from './db';
import crypto from 'crypto';
import type { 
    Patient, 
    User, 
    Corporate, 
    ClinicalParameter, 
    Assessment, 
    Goal, 
    Medication, 
    Prescription, 
    Appointment, 
    Review, 
    Partner,
    Clinic,
    Diagnosis,
    PatientOnboardingPayload,
    PasswordResetToken
} from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { isPartnerRole, isPatientRole } from '@/lib/role-utils';

/**
 * Aggressive serialization helper for Next.js 15.
 * Recursively converts non-serializable MySQL types (BigInt, Date) into plain JSON-safe types.
 */
function serialize<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') return Number(value);
        if (value instanceof Date) return value.toISOString();
        return value;
    }));
}

function toSqlDateTime(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toSqlDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function calculatePatientStats(patient: any) {
    const totalGoals = Number(patient.total_goals || 0);
    const activeGoals = Number(patient.active_goals || 0);
    const totalAssessments = Number(patient.total_assessments || 0);
    return {
        totalGoals,
        activeGoals,
        totalAssessments,
        assessmentCoverage: totalGoals > 0 ? Math.round((totalAssessments / totalGoals) * 100) : 0,
        needsAttention: patient.status === 'Critical' || (totalGoals > 0 && totalAssessments === 0)
    };
}

function buildPatientScopeClause(requestingUser?: User, alias = '') {
    const prefix = alias ? `${alias}.` : '';

    if (!requestingUser) {
        return { clause: '', params: [] as any[] };
    }

    if (isPatientRole(requestingUser.role)) {
        return {
            clause: ` AND ${prefix}user_id = ? `,
            params: [requestingUser.id],
        };
    }

    if (!isPartnerRole(requestingUser.role)) {
        return { clause: '', params: [] as any[] };
    }

    if (requestingUser.partner_type === 'clinic' && requestingUser.partner_clinic_id) {
        return {
            clause: ` AND ${prefix}clinic_id = ? `,
            params: [requestingUser.partner_clinic_id],
        };
    }

    if (requestingUser.partner_id) {
        return {
            clause: ` AND ${prefix}partner_id = ? `,
            params: [requestingUser.partner_id],
        };
    }

    return { clause: '', params: [] as any[] };
}

export async function fetchPatients(requestingUser?: User): Promise<Patient[]> {
    noStore();
    try {
        const scope = buildPatientScopeClause(requestingUser, 'p');
        let query = `
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   pay.partner_type as partner_type,
                   cl.name as clinic_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE p.deleted_at IS NULL
        `;
        const params: any[] = [...scope.params];
        query += scope.clause;
        query += ` ORDER BY p.created_at DESC `;
        const [rows] = await db.query(query, params);
        const mapped = (rows as any[]).map(p => ({ 
            ...p, 
            assessments: [], 
            goals: [], 
            prescriptions: [], 
            appointments: [], 
            reviews: [], 
            stats: calculatePatientStats(p) 
        }));
        return serialize(mapped);
    } catch (error) {
        console.error('fetchPatients Error:', error);
        throw new Error('Failed to fetch patients.');
    }
}

export async function fetchPatientById(id: string, requestingUser?: User): Promise<Patient | null> {
    noStore();
    if (!id) return null;
    try {
        const scope = buildPatientScopeClause(requestingUser, 'p');
        const [patientRows] = await db.query(`
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   pay.partner_type as partner_type,
                   cl.name as clinic_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE p.id = ? AND p.deleted_at IS NULL
            ${scope.clause}
        `, [id, ...scope.params]);
        
        const patient = (patientRows as any[])[0];
        if (!patient) return null;
        
        const [assessments] = await db.query('SELECT * FROM assessments WHERE patient_id = ? AND deleted_at IS NULL ORDER BY measured_at DESC', [id]);
        const [goals] = await db.query('SELECT * FROM goals WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [id]);
        const [prescriptions] = await db.query('SELECT pr.*, m.name as medication_name, m.dosage as med_dosage FROM prescriptions pr LEFT JOIN medications m ON pr.medication_id = m.id WHERE pr.patient_id = ? AND pr.deleted_at IS NULL', [id]);
        const [appointments] = await db.query('SELECT a.*, u.name as clinician_name FROM appointments a LEFT JOIN users u ON a.clinician_id = u.id WHERE a.patient_id = ? AND a.deleted_at IS NULL ORDER BY a.appointment_date ASC', [id]);
        const [reviews] = await db.query('SELECT r.*, u.name as reviewed_by FROM reviews r LEFT JOIN users u ON r.reviewed_by_id = u.id WHERE r.patient_id = ? AND r.deleted_at IS NULL ORDER BY r.review_date DESC', [id]);
        
        const basePatient = {
            ...patient,
            assessments: assessments as Assessment[],
            goals: goals as Goal[],
            prescriptions: (prescriptions as any[]).map(p => ({ 
                ...p, 
                medication: { id: p.medication_id, name: p.medication_name, dosage: p.med_dosage } 
            })),
            appointments: (appointments as any[]).map(a => ({ 
                ...a, 
                clinician: { id: a.clinician_id, name: a.clinician_name } 
            })),
            reviews: (reviews as any[]).map(r => ({ 
                ...r, 
                reviewed_by: r.reviewed_by 
            })),
        };
        
        return serialize({ ...basePatient, stats: calculatePatientStats(basePatient) });
    } catch (error) {
        console.error('fetchPatientById Error:', error);
        throw new Error('Failed to fetch patient details.');
    }
}

export async function fetchPatientByUserId(userId: number): Promise<Patient | null> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM patients WHERE user_id = ? AND deleted_at IS NULL', [userId]);
        const patient = (rows as any[])[0];
        if (!patient) return null;
        return serialize(patient as Patient);
    } catch (error) {
        console.error('fetchPatientByUserId Error:', error);
        return null;
    }
}

export async function fetchUserById(id: number): Promise<User | null> {
    noStore();
    try {
        const [rows] = await db.query(
            `
            SELECT
                u.id,
                u.name,
                u.phone,
                u.email,
                u.role,
                u.avatarUrl,
                u.partner_id,
                u.must_change_password,
                u.password_changed_at,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.id = ? AND u.deleted_at IS NULL
            LIMIT 1
            `,
            [id]
        );

        const user = (rows as User[])[0];
        return user ? serialize(user) : null;
    } catch (error) {
        console.error('fetchUserById Error:', error);
        return null;
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.id,
                u.name,
                u.phone,
                u.email,
                u.role,
                u.avatarUrl,
                u.partner_id,
                u.must_change_password,
                u.password_changed_at,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.deleted_at IS NULL
            ORDER BY u.name ASC
        `);
        return serialize(rows as User[]);
    } catch (error) {
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchPartners(partnerType?: Partner['partner_type']): Promise<Partner[]> {
    noStore();
    try {
        const params: any[] = [];
        let query = `
            SELECT
                p.*,
                c.name as clinic_name
            FROM partners p
            LEFT JOIN clinics c ON p.clinic_id = c.id
            WHERE p.deleted_at IS NULL
        `;

        if (partnerType) {
            query += ' AND p.partner_type = ?';
            params.push(partnerType);
        }

        query += ' ORDER BY p.name ASC';
        const [rows] = await db.query(query, params);
        return serialize(rows as Partner[]);
    } catch (error) {
        throw new Error('Failed to fetch partners.');
    }
}

export async function fetchClinics(): Promise<Clinic[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinics WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Clinic[]);
    } catch (error) {
        console.error('fetchClinics Error:', error);
        return [];
    }
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM diagnoses WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Diagnosis[]);
    } catch (error) {
        console.error('fetchDiagnoses Error:', error);
        return [];
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, created_at as wellness_date FROM partners WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Corporate[]);
    } catch (error) {
        throw new Error('Failed to fetch corporates.');
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters WHERE deleted_at IS NULL ORDER BY name ASC');
        const parameters = (rows as any[]).map(p => ({
            ...p,
            options: typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || [])
        }));
        return serialize(parameters as ClinicalParameter[]);
    } catch (error) {
        throw new Error('Failed to fetch parameters.');
    }
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM medications WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Medication[]);
    } catch (error) {
        throw new Error('Failed to fetch medications.');
    }
}

export async function getUserByEmail(email: string) {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.*,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.email = ? AND u.deleted_at IS NULL
        `, [email]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function getUserByPhone(phone: string) {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.*,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.phone = ? AND u.deleted_at IS NULL
            LIMIT 1
        `, [phone]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function createUser(userData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO users (name, phone, email, password, role, avatarUrl, partner_id, must_change_password, password_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            userData.name,
            userData.phone ?? null,
            userData.email,
            userData.password,
            userData.role || 'user',
            userData.avatarUrl || null,
            userData.partner_id || null,
            userData.must_change_password ?? true,
            userData.password_changed_at ?? null
        ]
    );
    return Number((result as any).insertId);
}

export async function updateUser(id: number, userData: Partial<User> & { password?: string }): Promise<void> {
    if (userData.password) {
        await db.query(
            'UPDATE users SET name = ?, phone = ?, email = ?, role = ?, avatarUrl = ?, partner_id = ?, password = ?, must_change_password = ?, password_changed_at = ? WHERE id = ?',
            [
                userData.name,
                userData.phone ?? null,
                userData.email,
                userData.role,
                userData.avatarUrl || null,
                userData.partner_id || null,
                userData.password,
                userData.must_change_password ?? true,
                userData.password_changed_at ?? null,
                id
            ]
        );
        return;
    }

    await db.query(
        'UPDATE users SET name = ?, phone = ?, email = ?, role = ?, avatarUrl = ?, partner_id = ? WHERE id = ?',
        [userData.name, userData.phone ?? null, userData.email, userData.role, userData.avatarUrl || null, userData.partner_id || null, id]
    );
}

export async function fetchUserAuthById(id: number) {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.query(
        'UPDATE users SET password = ?, must_change_password = 0, password_changed_at = NOW() WHERE id = ?',
        [hashedPassword, id]
    );
}

export async function clearPasswordResetTokensForUser(userId: number): Promise<void> {
    await db.query(
        'UPDATE password_reset_tokens SET used_at = COALESCE(used_at, NOW()) WHERE user_id = ? AND used_at IS NULL',
        [userId]
    );
}

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await clearPasswordResetTokensForUser(userId);
    await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, tokenHash, toSqlDateTime(expiresAt)]
    );
}

export async function fetchPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await db.query(
        `SELECT *
         FROM password_reset_tokens
         WHERE token_hash = ?
           AND used_at IS NULL
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [tokenHash]
    );
    const record = (rows as PasswordResetToken[])[0];
    return record ? serialize(record) : null;
}

export async function consumePasswordResetToken(id: number): Promise<void> {
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL', [id]);
}

export async function createPatient(patientData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO patients (user_id, first_name, surname, email, status, partner_id) VALUES (?, ?, ?, ?, ?, ?)',
        [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.status || 'Pending', patientData.partner_id || null]
    );
    return Number((result as any).insertId);
}

export async function createAssessment(data: any): Promise<number> {
    const measuredAt = toSqlDateTime(data.measured_at);
    if (!measuredAt) throw new Error('Invalid date format for assessment.');
    const [result] = await db.query(
        'INSERT INTO assessments (patient_id, clinical_parameter_id, value, notes, is_normal, measured_at) VALUES (?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.clinical_parameter_id, data.value, data.notes, data.is_normal, measuredAt]
    );
    return Number((result as any).insertId);
}

export async function createReview(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO reviews (patient_id, reviewed_by_id, review_date, subjective_findings, objective_findings, assessment, plan, recommendations, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.reviewed_by_id, toSqlDate(data.review_date), data.subjective_findings, data.objective_findings, data.assessment, data.plan, data.recommendations, toSqlDate(data.follow_up_date)]
    );
    return Number((result as any).insertId);
}

export async function upsertPartner(data: any): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE partners SET name = ?, partner_type = ?, clinic_id = ? WHERE id = ?',
            [data.name, data.partner_type || 'insurance', data.partner_type === 'clinic' ? data.clinic_id ?? null : null, data.id]
        );
        return Number(data.id);
    } else {
        const [existingRows] = await db.query(
            'SELECT id FROM partners WHERE name = ? AND partner_type = ? LIMIT 1',
            [data.name, data.partner_type || 'insurance']
        );
        const existingPartner = (existingRows as any[])[0];

        if (existingPartner) {
            await db.query(
                'UPDATE partners SET clinic_id = ?, deleted_at = NULL WHERE id = ?',
                [data.partner_type === 'clinic' ? data.clinic_id ?? null : null, existingPartner.id]
            );
            return Number(existingPartner.id);
        }

        const [result] = await db.query(
            'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
            [data.name, data.partner_type || 'insurance', data.partner_type === 'clinic' ? data.clinic_id ?? null : null]
        );
        return Number((result as any).insertId);
    }
}

export async function upsertClinic(data: Partial<Clinic>): Promise<number> {
    if (data.id) {
        await db.query('UPDATE clinics SET name = ?, location = ? WHERE id = ?', [data.name, data.location ?? null, data.id]);
        const [partnerRows] = await db.query(
            "SELECT id FROM partners WHERE clinic_id = ? AND partner_type = 'clinic' LIMIT 1",
            [data.id]
        );
        const existingPartner = (partnerRows as any[])[0];

        if (existingPartner) {
            await db.query(
                "UPDATE partners SET name = ?, deleted_at = NULL WHERE id = ?",
                [data.name, existingPartner.id]
            );
        } else {
            await db.query(
                'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
                [data.name, 'clinic', data.id]
            );
        }
        return Number(data.id);
    }

    const [result] = await db.query('INSERT INTO clinics (name, location) VALUES (?, ?)', [data.name, data.location ?? null]);
    const clinicId = Number((result as any).insertId);
    const [existingPartnerRows] = await db.query(
        "SELECT id FROM partners WHERE name = ? AND partner_type = 'clinic' LIMIT 1",
        [data.name]
    );
    const existingPartner = (existingPartnerRows as any[])[0];

    if (existingPartner) {
        await db.query(
            'UPDATE partners SET clinic_id = ?, deleted_at = NULL WHERE id = ?',
            [clinicId, existingPartner.id]
        );
    } else {
        await db.query(
            'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
            [data.name, 'clinic', clinicId]
        );
    }
    return clinicId;
}

export async function upsertDiagnosis(data: Partial<Diagnosis>): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE diagnoses SET name = ?, code = ?, description = ? WHERE id = ?',
            [data.name, data.code ?? null, data.description ?? null, data.id]
        );
        return Number(data.id);
    }

    const [result] = await db.query(
        'INSERT INTO diagnoses (name, code, description) VALUES (?, ?, ?)',
        [data.name, data.code ?? null, data.description ?? null]
    );
    return Number((result as any).insertId);
}

export async function upsertMedication(data: any): Promise<number> {
    if (data.id) {
        await db.query('UPDATE medications SET name = ?, dosage = ? WHERE id = ?', [data.name, data.dosage, data.id]);
        return Number(data.id);
    } else {
        const [result] = await db.query('INSERT INTO medications (name, dosage) VALUES (?, ?)', [data.name, data.dosage]);
        return Number((result as any).insertId);
    }
}

export async function upsertClinicalParameter(data: any): Promise<number> {
    const optionsJson = Array.isArray(data.options) ? JSON.stringify(data.options) : null;
    if (data.id) {
        await db.query(
            'UPDATE clinical_parameters SET name = ?, type = ?, unit = ?, options = ?, category = ? WHERE id = ?',
            [data.name, data.type, data.unit, optionsJson, data.category, data.id]
        );
        return Number(data.id);
    } else {
        const [result] = await db.query(
            'INSERT INTO clinical_parameters (name, type, unit, options, category) VALUES (?, ?, ?, ?, ?)',
            [data.name, data.type, data.unit, optionsJson, data.category]
        );
        return Number((result as any).insertId);
    }
}

export async function activatePatient(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET status = "Active", dob = ?, phone = ?, gender = ?, primary_diagnosis = ?, date_of_onboarding = ?, emr_number = ?, navigator_id = ?, partner_id = ?, brief_medical_history = ?, years_since_diagnosis = ?, past_medical_interventions = ?, relevant_family_history = ?, dietary_restrictions = ?, allergies_intolerances = ?, lifestyle_factors = ?, physical_limitations = ?, psychosocial_factors = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?, has_weighing_scale = ?, has_glucometer = ?, has_bp_machine = ?, has_tape_measure = ? WHERE id = ?',
        [toSqlDate(data.dob), data.phone, data.gender, data.primary_diagnosis, toSqlDate(data.date_of_onboarding), data.emr_number, data.navigator_id, data.partner_id, data.brief_medical_history, data.years_since_diagnosis, data.past_medical_interventions, data.relevant_family_history, data.dietary_restrictions, data.allergies_intolerances, data.lifestyle_factors, data.physical_limitations, data.psychosocial_factors, data.emergency_contact_name, data.emergency_contact_phone, data.emergency_contact_relation, data.has_weighing_scale, data.has_glucometer, data.has_bp_machine, data.has_tape_measure, id]
    );
}

export async function createPatientOnboardingRecord(
    userId: number,
    patientIdentifier: string,
    data: PatientOnboardingPayload
): Promise<number> {
    const selectedPartnerId = data.partner_id ?? data.payer_id ?? null;
    let resolvedClinicId = data.clinic_id ?? null;

    if (selectedPartnerId) {
        const [partnerRows] = await db.query(
            'SELECT partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [selectedPartnerId]
        );
        const selectedPartner = (partnerRows as any[])[0];

        if (selectedPartner?.partner_type === 'clinic') {
            resolvedClinicId = selectedPartner.clinic_id ?? resolvedClinicId;
        }
    }

    const [result] = await db.query(
        `INSERT INTO patients (
            user_id,
            patient_identifier,
            portal_username,
            first_name,
            middle_name,
            surname,
            dob,
            gender,
            email,
            phone,
            address,
            status,
            date_of_onboarding,
            clinic_id,
            partner_id,
            primary_diagnosis_id,
            comorbid_conditions,
            current_medications_summary,
            allergies_intolerances,
            past_medical_history,
            surgical_history,
            family_history,
            social_history,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relation,
            emergency_contact_email,
            policy_number,
            coverage_limits,
            pre_authorization_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            patientIdentifier,
            data.portal_username ?? data.email,
            data.first_name,
            data.middle_name ?? null,
            data.surname,
            toSqlDate(data.dob),
            data.gender,
            data.email,
            data.phone,
            data.address ?? null,
            resolvedClinicId,
            selectedPartnerId,
            data.primary_diagnosis_id ?? null,
            data.comorbid_conditions ?? null,
            data.current_medications_summary ?? null,
            data.allergies_intolerances ?? null,
            data.past_medical_history ?? null,
            data.surgical_history ?? null,
            data.family_history ?? null,
            data.social_history ?? null,
            data.emergency_contact_name,
            data.emergency_contact_phone,
            data.emergency_contact_relation,
            data.emergency_contact_email ?? null,
            data.policy_number ?? null,
            data.coverage_limits ?? null,
            data.pre_authorization_status ?? 'Not Required',
        ]
    );

    return Number((result as any).insertId);
}

export async function updatePatientDetails(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET first_name = ?, middle_name = ?, surname = ?, dob = ?, age = ?, gender = ?, email = ?, phone = ?, wellness_date = ?, partner_id = ? WHERE id = ?',
        [data.first_name, data.middle_name, data.surname, toSqlDate(data.dob), data.age, data.gender, data.email, data.phone, toSqlDate(data.wellness_date), data.partner_id, id]
    );
}

export async function createGoal(data: any): Promise<number> {
    const [result] = await db.query('INSERT INTO goals (patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.clinical_parameter_id, data.target_value, data.target_operator, data.status, data.notes, toSqlDate(data.deadline)]);
    return Number((result as any).insertId);
}

export async function updateGoal(id: number, data: any): Promise<void> {
    await db.query('UPDATE goals SET target_value = ?, target_operator = ?, status = ?, notes = ?, deadline = ? WHERE id = ?', [data.target_value, data.target_operator, data.status, data.notes, toSqlDate(data.deadline), id]);
}

export async function upsertAppointment(data: any): Promise<number> {
    const apptDate = toSqlDateTime(data.appointment_date);
    const endDate = toSqlDateTime(data.end_date);
    if (data.id) {
        await db.query('UPDATE appointments SET clinician_id = ?, title = ?, appointment_date = ?, end_date = ?, description = ?, status = ? WHERE id = ?', [data.clinician_id, data.title, apptDate, endDate, data.description, data.status, data.id]);
        return Number(data.id);
    }
    const [result] = await db.query('INSERT INTO appointments (patient_id, clinician_id, title, appointment_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.clinician_id, data.title, apptDate, endDate, data.description, data.status]);
    return Number((result as any).insertId);
}

export async function upsertPrescription(data: any): Promise<number> {
    const sDate = toSqlDate(data.start_date);
    const eDate = toSqlDate(data.expiry_date);
    if (data.id) {
        await db.query('UPDATE prescriptions SET medication_id = ?, dosage = ?, frequency = ?, start_date = ?, expiry_date = ?, notes = ?, status = ? WHERE id = ?', [data.medication_id, data.dosage, data.frequency, sDate, eDate, data.notes, data.status, data.id]);
        return Number(data.id);
    }
    const [result] = await db.query('INSERT INTO prescriptions (patient_id, medication_id, dosage, frequency, start_date, expiry_date, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.medication_id, data.dosage, data.frequency, sDate, eDate, data.notes, data.status]);
    return Number((result as any).insertId);
}

export async function deleteAssessment(id: number): Promise<void> { await db.query('UPDATE assessments SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteGoal(id: number): Promise<void> { await db.query('UPDATE goals SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deletePrescription(id: number): Promise<void> { await db.query('UPDATE prescriptions SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function bulkDeletePatients(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE patients SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteMedications(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE medications SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteUsers(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE users SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeletePartners(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE partners SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteClinics(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await db.query('UPDATE clinics SET deleted_at = NOW() WHERE id IN (?)', [ids]);
    await db.query("UPDATE partners SET deleted_at = NOW() WHERE clinic_id IN (?) AND partner_type = 'clinic'", [ids]);
}
export async function bulkDeleteDiagnoses(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE diagnoses SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteParameters(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function updateAppointmentStatus(id: number, status: string): Promise<void> { await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]); }
export async function deletePartner(id: number): Promise<void> { await db.query('UPDATE partners SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteUser(id: number): Promise<void> { await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteClinic(id: number): Promise<void> {
    await db.query('UPDATE clinics SET deleted_at = NOW() WHERE id = ?', [id]);
    await db.query("UPDATE partners SET deleted_at = NOW() WHERE clinic_id = ? AND partner_type = 'clinic'", [id]);
}
export async function deleteDiagnosis(id: number): Promise<void> { await db.query('UPDATE diagnoses SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteMedication(id: number): Promise<void> { await db.query('UPDATE medications SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteClinicalParameter(id: number): Promise<void> { await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id = ?', [id]); }

export async function fetchDashboardStats(requestingUser?: User) {
    noStore();
    try {
        const scope = buildPatientScopeClause(requestingUser);
        const patientFilter = scope.clause;
        const patientParams = [...scope.params];
        const goalPatientScope = scope.clause
            ? `AND patient_id IN (SELECT id FROM patients WHERE deleted_at IS NULL ${scope.clause})`
            : '';

        // Core counts
        const [totalPatientsRows] = await db.query(`SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL ${patientFilter}`, patientParams);
        const [totalPartnersRows] = await db.query(`SELECT COUNT(*) as count FROM partners WHERE deleted_at IS NULL`);
        const [totalOnboardedRows] = await db.query(`SELECT COUNT(*) as count FROM patients WHERE status != 'Pending' AND deleted_at IS NULL ${patientFilter}`, patientParams);
        const [totalInactiveRows] = await db.query(`SELECT COUNT(*) as count FROM patients WHERE status = 'Pending' AND deleted_at IS NULL ${patientFilter}`, patientParams);
        
        // Progress counts
        const [totalCompletedRows] = await db.query(`SELECT COUNT(DISTINCT patient_id) as count FROM goals WHERE status = 'completed' AND deleted_at IS NULL ${goalPatientScope}`, patientParams);
        const [totalCriticalRows] = await db.query(`SELECT COUNT(DISTINCT patient_id) as count FROM goals WHERE status = 'active' AND deadline < NOW() AND deleted_at IS NULL ${goalPatientScope}`, patientParams);
        const [totalInProgressRows] = await db.query(`SELECT COUNT(DISTINCT patient_id) as count FROM goals WHERE status = 'active' AND deadline >= NOW() AND deleted_at IS NULL ${goalPatientScope}`, patientParams);

        // Distributions
        const [genderRows] = await db.query(`SELECT IFNULL(gender, 'Not Specified') as gender, COUNT(*) as count FROM patients WHERE deleted_at IS NULL ${patientFilter} GROUP BY gender`, patientParams);
        const [diagnosisRows] = await db.query(`SELECT IFNULL(primary_diagnosis, 'Not Specified') as diagnosis, COUNT(*) as count FROM patients WHERE deleted_at IS NULL ${patientFilter} GROUP BY primary_diagnosis`, patientParams);
        
        // Age Distribution
        const [ageRows] = await db.query(`
            SELECT 
                CASE 
                    WHEN dob IS NULL THEN 'Not Specified'
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 18 AND 35 THEN '18-35'
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
                    WHEN TIMESTAMPDIFF(YEAR, dob, CURDATE()) > 50 THEN 'Above 50'
                    ELSE 'Below 18'
                END as age_group,
                COUNT(*) as count
            FROM patients 
            WHERE deleted_at IS NULL ${patientFilter}
            GROUP BY age_group
        `, patientParams);

        return serialize({
            totalPatients: (totalPatientsRows as any)[0]?.count || 0,
            totalPartners: (totalPartnersRows as any)[0]?.count || 0,
            totalOnboarded: (totalOnboardedRows as any)[0]?.count || 0,
            totalInactive: (totalInactiveRows as any)[0]?.count || 0,
            totalCompleted: (totalCompletedRows as any)[0]?.count || 0,
            totalCritical: (totalCriticalRows as any)[0]?.count || 0,
            totalInProgress: (totalInProgressRows as any)[0]?.count || 0,
            genderDistribution: (genderRows as any[]).map(row => ({
                gender: row.gender,
                count: Number(row.count)
            })),
            diagnosisDistribution: (diagnosisRows as any[]).map(row => ({
                diagnosis: row.diagnosis,
                count: Number(row.count)
            })),
            ageDistribution: (ageRows as any[]).map(row => ({
                age_group: row.age_group,
                count: Number(row.count)
            }))
        });
    } catch (error) {
        console.error('fetchDashboardStats Error:', error);
        return null;
    }
}
