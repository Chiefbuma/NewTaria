import { db } from './db';
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
    Payer,
    Message
} from './types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Robust serialization helper to handle BigInt, Date, and other non-POJO types
 * returned by the MySQL driver, preventing "Internal Server Error" in Next.js 15.
 */
function serialize(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    
    // Handle BigInt
    if (typeof obj === 'bigint') return obj.toString();
    
    // Handle Date
    if (obj instanceof Date) return obj.toISOString();

    // Handle Buffers (sometimes returned by MySQL)
    if (typeof obj === 'object' && obj.type === 'Buffer' && Array.isArray(obj.data)) {
        return Buffer.from(obj.data).toString('utf-8');
    }
    
    // Handle Arrays recursively
    if (Array.isArray(obj)) return obj.map(serialize);
    
    // Handle Objects recursively
    if (typeof obj === 'object') {
        // If it has a custom toJSON (like some Decimal types), use it
        if (typeof obj.toJSON === 'function') return serialize(obj.toJSON());

        const result: any = {};
        for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
                result[key] = serialize(obj[key]);
            }
        }
        return result;
    }
    
    return obj;
}

function calculatePatientStats(patient: Partial<Patient>) {
    const goals = patient.goals || [];
    const assessments = patient.assessments || [];
    const totalGoals = goals.length;
    const activeGoals = goals.filter(g => g.status === 'active').length;
    const totalAssessments = assessments.length;
    const isOverdue = (goal: Goal) => {
        if (!goal.deadline || goal.status !== 'active') return false;
        return new Date(goal.deadline) < new Date();
    };
    const needsAttention = (patient.status as string) === 'Critical' || goals.some(isOverdue);
    return {
        totalGoals,
        activeGoals,
        totalAssessments,
        assessmentCoverage: totalGoals > 0 ? Math.round((totalAssessments / totalGoals) * 100) : 0,
        needsAttention
    };
}

// --- READ OPERATIONS (Filtering out Soft-Deleted Records) ---

export async function fetchPatients(requestingUser?: User): Promise<Patient[]> {
    noStore();
    try {
        let query = `
            SELECT p.*, 
                   u.name as navigator_name, 
                   c.name as corporate_name, 
                   pay.name as payer_name
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN corporates c ON p.corporate_id = c.id
            LEFT JOIN payers pay ON p.payer_id = pay.id
            WHERE p.deleted_at IS NULL
        `;
        let params: any[] = [];

        if (requestingUser?.role === 'payer' && requestingUser.payer_id) {
            query += ` AND p.payer_id = ? `;
            params.push(requestingUser.payer_id);
        }

        query += ` ORDER BY p.created_at DESC `;
        
        const [rows] = await db.query(query, params);
        const patients = rows as any[];
        
        const enhancedPatients = patients.map(p => ({
            ...p,
            assessments: [], 
            goals: [],
            prescriptions: [],
            appointments: [],
            reviews: [],
            stats: calculatePatientStats(p)
        }));

        return serialize(enhancedPatients);
    } catch (error) {
        console.error('Database Error [fetchPatients]:', error);
        throw new Error('Failed to fetch patients.');
    }
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
    noStore();
    if (!id) return null;
    try {
        const [patientRows] = await db.query(`
            SELECT p.*, 
                   u.name as navigator_name, 
                   c.name as corporate_name, 
                   pay.name as payer_name
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN corporates c ON p.corporate_id = c.id
            LEFT JOIN payers pay ON p.payer_id = pay.id
            WHERE p.id = ? AND p.deleted_at IS NULL
        `, [id]);
        
        const patient = (patientRows as any[])[0];
        if (!patient) return null;

        const [assessments] = await db.query('SELECT * FROM assessments WHERE patient_id = ? AND deleted_at IS NULL ORDER BY measured_at DESC', [id]);
        const [goals] = await db.query('SELECT * FROM goals WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [id]);
        const [prescriptions] = await db.query(`
            SELECT pr.*, m.name as medication_name, m.dosage as med_dosage
            FROM prescriptions pr
            LEFT JOIN medications m ON pr.medication_id = m.id
            WHERE pr.patient_id = ? AND pr.deleted_at IS NULL
        `, [id]);
        const [appointments] = await db.query(`
            SELECT a.*, u.name as clinician_name
            FROM appointments a
            LEFT JOIN users u ON a.clinician_id = u.id
            WHERE a.patient_id = ? AND a.deleted_at IS NULL
            ORDER BY a.appointment_date ASC
        `, [id]);
        const [reviews] = await db.query(`
            SELECT r.*, u.name as reviewed_by
            FROM reviews r
            LEFT JOIN users u ON r.reviewed_by_id = u.id
            WHERE r.patient_id = ? AND r.deleted_at IS NULL
            ORDER BY r.review_date DESC
        `, [id]);

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
            reviews: reviews as Review[],
        };

        return serialize({ ...basePatient, stats: calculatePatientStats(basePatient) });
    } catch (error) {
        console.error('Database Error [fetchPatientById]:', error);
        throw new Error('Failed to fetch patient details.');
    }
}

export async function fetchPatientByUserId(userId: number): Promise<Patient | null> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id FROM patients WHERE user_id = ? AND deleted_at IS NULL', [userId]);
        const patient = (rows as any[])[0];
        if (!patient) return null;
        return fetchPatientById(patient.id);
    } catch (error) {
        console.error('Database Error [fetchPatientByUserId]:', error);
        return null;
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl, payer_id FROM users WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as User[]);
    } catch (error) {
        console.error('Database Error [fetchUsers]:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchMessages(userId: number, otherId?: number): Promise<Message[]> {
    noStore();
    try {
        let query = `
            SELECT m.*, u.name as sender_name
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = ? OR m.receiver_id = ?) AND m.deleted_at IS NULL
        `;
        let params = [userId, userId];
        if (otherId) {
            query += ` AND (m.sender_id = ? OR m.receiver_id = ?) `;
            params.push(otherId, otherId);
        }
        query += ` ORDER BY m.created_at ASC `;
        const [rows] = await db.query(query, params);
        return serialize(rows as Message[]);
    } catch (error) {
        console.error('Database Error [fetchMessages]:', error);
        return [];
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as ClinicalParameter[]);
    } catch (error) {
        console.error('Database Error [fetchClinicalParameters]:', error);
        throw new Error('Failed to fetch clinical parameters.');
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM corporates WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Corporate[]);
    } catch (error) {
        console.error('Database Error [fetchCorporates]:', error);
        throw new Error('Failed to fetch corporates.');
    }
}

export async function fetchPayers(): Promise<Payer[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM payers WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Payer[]);
    } catch (error) {
        console.error('Database Error [fetchPayers]:', error);
        throw new Error('Failed to fetch payers.');
    }
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM medications WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Medication[]);
    } catch (error) {
        console.error('Database Error [fetchMedications]:', error);
        throw new Error('Failed to fetch medications.');
    }
}

export async function getUserByEmail(email: string) {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
        const users = rows as any[];
        return serialize(users[0] || null);
    } catch (error) {
        console.error('Database Error [getUserByEmail]:', error);
        return null;
    }
}

// --- WRITE OPERATIONS (Soft Delete Transformations) ---

export async function sendMessage(senderId: number, receiverId: number, content: string): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)',
        [senderId, receiverId, content]
    );
    return Number((result as any).insertId);
}

export async function createUser(userData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, avatarUrl, payer_id) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.role || 'user', userData.avatarUrl || null, userData.payer_id || null]
    );
    return Number((result as any).insertId);
}

export async function deleteUser(id: number): Promise<void> {
    await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]);
}

export async function createPatient(patientData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO patients (user_id, first_name, surname, email, age, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.age, patientData.gender, patientData.status || 'Pending']
    );
    return Number((result as any).insertId);
}

export async function bulkDeletePatients(ids: number[]): Promise<void> {
    if (ids.length === 0) return;
    await db.query('UPDATE patients SET deleted_at = NOW() WHERE id IN (?)', [ids]);
}

export async function createAssessment(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO assessments (patient_id, clinical_parameter_id, value, notes, is_normal, measured_at) VALUES (?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.clinical_parameter_id, data.value, data.notes, data.is_normal, data.measured_at]
    );
    return Number((result as any).insertId);
}

export async function deleteAssessment(id: number): Promise<void> {
    await db.query('UPDATE assessments SET deleted_at = NOW() WHERE id = ?', [id]);
}

export async function createGoal(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO goals (patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.clinical_parameter_id, data.target_value, data.target_operator, data.status, data.notes, data.deadline]
    );
    return Number((result as any).insertId);
}

export async function updateGoal(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE goals SET target_value = ?, target_operator = ?, status = ?, notes = ?, deadline = ? WHERE id = ?',
        [data.target_value, data.target_operator, data.status, data.notes, data.deadline, id]
    );
}

export async function deleteGoal(id: number): Promise<void> {
    await db.query('UPDATE goals SET deleted_at = NOW() WHERE id = ?', [id]);
}

export async function createReview(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO reviews (patient_id, reviewed_by_id, review_date, subjective_findings, objective_findings, assessment, plan, recommendations, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.reviewed_by_id, data.review_date, data.subjective_findings, data.objective_findings, data.assessment, data.plan, data.recommendations, data.follow_up_date]
    );
    return Number((result as any).insertId);
}

export async function upsertAppointment(data: any): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE appointments SET clinician_id = ?, title = ?, appointment_date = ?, end_date = ?, description = ?, status = ? WHERE id = ?',
            [data.clinician_id, data.title, data.appointment_date, data.end_date, data.description, data.status, data.id]
        );
        return Number(data.id);
    } else {
        const [result] = await db.query(
            'INSERT INTO appointments (patient_id, clinician_id, title, appointment_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [data.patient_id, data.clinician_id, data.title, data.appointment_date, data.end_date, data.description, data.status]
        );
        return Number((result as any).insertId);
    }
}

export async function updateAppointmentStatus(id: number, status: string): Promise<void> {
    await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]);
}

export async function upsertPrescription(data: any): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE prescriptions SET medication_id = ?, dosage = ?, frequency = ?, start_date = ?, expiry_date = ?, notes = ?, status = ? WHERE id = ?',
            [data.medication_id, data.dosage, data.frequency, data.start_date, data.expiry_date, data.notes, data.status, data.id]
        );
        return Number(data.id);
    } else {
        const [result] = await db.query(
            'INSERT INTO prescriptions (patient_id, medication_id, dosage, frequency, start_date, expiry_date, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
            [data.patient_id, data.medication_id, data.dosage, data.frequency, data.start_date, data.expiry_date, data.notes, data.status]
        );
        return Number((result as any).insertId);
    }
}

export async function deletePrescription(id: number): Promise<void> {
    await db.query('UPDATE prescriptions SET deleted_at = NOW() WHERE id = ?', [id]);
}

export async function updatePatientDetails(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET first_name = ?, middle_name = ?, surname = ?, dob = ?, age = ?, gender = ?, email = ?, phone = ?, wellness_date = ?, corporate_id = ? WHERE id = ?',
        [data.first_name, data.middle_name, data.surname, data.dob, data.age, data.gender, data.email, data.phone, data.wellness_date, data.corporate_id, id]
    );
}

export async function activatePatient(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET status = "Active", date_of_onboarding = ?, emr_number = ?, navigator_id = ?, payer_id = ?, brief_medical_history = ?, years_since_diagnosis = ?, past_medical_interventions = ?, relevant_family_history = ?, dietary_restrictions = ?, allergies_intolerances = ?, lifestyle_factors = ?, physical_limitations = ?, psychosocial_factors = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?, has_weighing_scale = ?, has_glucometer = ?, has_bp_machine = ?, has_tape_measure = ? WHERE id = ?',
        [
            data.date_of_onboarding, data.emr_number, data.navigator_id, data.payer_id, data.brief_medical_history, data.years_since_diagnosis, data.past_medical_interventions, data.relevant_family_history, data.dietary_restrictions, data.allergies_intolerances, data.lifestyle_factors, data.physical_limitations, data.psychosocial_factors, data.emergency_contact_name, data.emergency_contact_phone, data.emergency_contact_relation, 
            data.has_weighing_scale, data.has_glucometer, data.has_bp_machine, data.has_tape_measure, id
        ]
    );
}