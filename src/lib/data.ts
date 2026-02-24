import { db } from './db';
import type { 
    Patient, 
    User, 
    Corporate, 
    ClinicalParameter, 
    Assessment, 
    Goal, 
    Diagnosis, 
    Medication, 
    Prescription, 
    Appointment, 
    Review, 
    Payer 
} from './types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Helper to ensure database values are safe for Next.js serialization.
 * Handles Dates by converting to ISO strings and BigInt by converting to numbers.
 */
function serialize<T>(data: T): T {
    if (data === null || data === undefined) return data;
    
    return JSON.parse(JSON.stringify(data, (key, value) => {
        if (typeof value === 'bigint') {
            return value.toString();
        }
        return value;
    }));
}

/**
 * Helper to calculate patient stats from their related data.
 */
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

// --- READ OPERATIONS ---

export async function fetchPatients(): Promise<Patient[]> {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT p.*, 
                   u.name as navigator_name, 
                   c.name as corporate_name, 
                   pay.name as payer_name
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN corporates c ON p.corporate_id = c.id
            LEFT JOIN payers pay ON p.payer_id = pay.id
            ORDER BY p.created_at DESC
        `);
        
        const patients = rows as any[];
        return serialize(patients.map(p => ({
            ...p,
            assessments: [], 
            goals: [],
            prescriptions: [],
            appointments: [],
            reviews: [],
            stats: calculatePatientStats(p)
        })));
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
            WHERE p.id = ?
        `, [id]);

        const patient = (patientRows as any[])[0];
        if (!patient) return null;

        const [assessments] = await db.query('SELECT * FROM assessments WHERE patient_id = ? ORDER BY measured_at DESC', [id]);
        const [goals] = await db.query('SELECT * FROM goals WHERE patient_id = ? ORDER BY created_at DESC', [id]);
        const [prescriptions] = await db.query(`
            SELECT pr.*, m.name as medication_name, m.dosage as med_dosage
            FROM prescriptions pr
            LEFT JOIN medications m ON pr.medication_id = m.id
            WHERE pr.patient_id = ?
        `, [id]);
        const [appointments] = await db.query(`
            SELECT a.*, u.name as clinician_name
            FROM appointments a
            LEFT JOIN users u ON a.clinician_id = u.id
            WHERE a.patient_id = ?
            ORDER BY a.appointment_date ASC
        `, [id]);
        const [reviews] = await db.query(`
            SELECT r.*, u.name as reviewed_by
            FROM reviews r
            LEFT JOIN users u ON r.reviewed_by_id = u.id
            WHERE r.patient_id = ?
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

        return serialize({
            ...basePatient,
            stats: calculatePatientStats(basePatient)
        });
    } catch (error) {
        console.error('Database Error [fetchPatientById]:', error);
        throw new Error('Failed to fetch patient details.');
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
        return serialize(rows as User[]);
    } catch (error) {
        console.error('Database Error [fetchUsers]:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters ORDER BY name ASC');
        return serialize(rows as ClinicalParameter[]);
    } catch (error) {
        console.error('Database Error [fetchClinicalParameters]:', error);
        throw new Error('Failed to fetch clinical parameters.');
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM corporates ORDER BY name ASC');
        return serialize(rows as Corporate[]);
    } catch (error) {
        console.error('Database Error [fetchCorporates]:', error);
        throw new Error('Failed to fetch corporates.');
    }
}

export async function fetchPayers(): Promise<Payer[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM payers ORDER BY name ASC');
        return serialize(rows as Payer[]);
    } catch (error) {
        console.error('Database Error [fetchPayers]:', error);
        throw new Error('Failed to fetch payers.');
    }
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM medications ORDER BY name ASC');
        return serialize(rows as Medication[]);
    } catch (error) {
        console.error('Database Error [fetchMedications]:', error);
        throw new Error('Failed to fetch medications.');
    }
}

export async function getUserByEmail(email: string) {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as any[];
        return serialize(users[0] || null);
    } catch (error) {
        console.error('Database Error [getUserByEmail]:', error);
        return null;
    }
}

// --- WRITE OPERATIONS ---

export async function createUser(userData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, avatarUrl) VALUES (?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.role || 'patient', userData.avatarUrl || null]
    );
    return Number((result as any).insertId);
}

export async function createPatient(patientData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO patients (user_id, first_name, surname, email, age, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.age, patientData.gender, patientData.status || 'Pending']
    );
    return Number((result as any).insertId);
}

export async function createAssessment(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO assessments (patient_id, clinical_parameter_id, value, notes, is_normal, measured_at) VALUES (?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.clinical_parameter_id, data.value, data.notes, data.is_normal, data.measured_at]
    );
    return Number((result as any).insertId);
}

export async function deleteAssessment(id: number): Promise<void> {
    await db.query('DELETE FROM assessments WHERE id = ?', [id]);
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
    await db.query('DELETE FROM goals WHERE id = ?', [id]);
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
    await db.query('DELETE FROM prescriptions WHERE id = ?', [id]);
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