
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
    Partner,
    Message
} from './types';
import { unstable_noStore as noStore } from 'next/cache';

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
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${d.getHours()}:${d.getMinutes()}:${d.getSeconds()}`;
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

export async function fetchPatients(requestingUser?: User): Promise<Patient[]> {
    noStore();
    try {
        let query = `
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            WHERE p.deleted_at IS NULL
        `;
        let params: any[] = [];
        if (requestingUser && requestingUser.role === 'partner' && requestingUser.partner_id) {
            query += ` AND p.partner_id = ? `;
            params.push(requestingUser.partner_id);
        }
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

export async function fetchPatientById(id: string): Promise<Patient | null> {
    noStore();
    if (!id) return null;
    try {
        const [patientRows] = await db.query(`
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            WHERE p.id = ? AND p.deleted_at IS NULL
        `, [id]);
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
            prescriptions: (prescriptions as any[]).map(p => ({ ...p, medication: { id: p.medication_id, name: p.medication_name, dosage: p.med_dosage } })),
            appointments: (appointments as any[]).map(a => ({ ...a, clinician: { id: a.clinician_id, name: a.clinician_name } })),
            reviews: (reviews as any[]).map(r => ({ ...r, reviewed_by: r.reviewed_by })),
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

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl, partner_id FROM users WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as User[]);
    } catch (error) {
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchPartners(): Promise<Partner[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM partners WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Partner[]);
    } catch (error) {
        throw new Error('Failed to fetch partners.');
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
        const [rows] = await db.query('SELECT * FROM users WHERE email = ? AND deleted_at IS NULL', [email]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function createUser(userData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO users (name, email, password, role, avatarUrl, partner_id) VALUES (?, ?, ?, ?, ?, ?)',
        [userData.name, userData.email, userData.password, userData.role || 'user', userData.avatarUrl || null, userData.partner_id || null]
    );
    return Number((result as any).insertId);
}

export async function createPatient(patientData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO patients (user_id, first_name, surname, email, age, gender, status, partner_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.age, patientData.gender, patientData.status || 'Pending', patientData.partner_id || null]
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
        await db.query('UPDATE partners SET name = ? WHERE id = ?', [data.name, data.id]);
        return Number(data.id);
    } else {
        const [result] = await db.query('INSERT INTO partners (name) VALUES (?)', [data.name]);
        return Number((result as any).insertId);
    }
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
        'UPDATE patients SET status = "Active", date_of_onboarding = ?, emr_number = ?, navigator_id = ?, partner_id = ?, brief_medical_history = ?, years_since_diagnosis = ?, past_medical_interventions = ?, relevant_family_history = ?, dietary_restrictions = ?, allergies_intolerances = ?, lifestyle_factors = ?, physical_limitations = ?, psychosocial_factors = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?, has_weighing_scale = ?, has_glucometer = ?, has_bp_machine = ?, has_tape_measure = ? WHERE id = ?',
        [toSqlDate(data.date_of_onboarding), data.emr_number, data.navigator_id, data.partner_id, data.brief_medical_history, data.years_since_diagnosis, data.past_medical_interventions, data.relevant_family_history, data.dietary_restrictions, data.allergies_intolerances, data.lifestyle_factors, data.physical_limitations, data.psychosocial_factors, data.emergency_contact_name, data.emergency_contact_phone, data.emergency_contact_relation, data.has_weighing_scale, data.has_glucometer, data.has_bp_machine, data.has_tape_measure, id]
    );
}

export async function updatePatientDetails(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET first_name = ?, middle_name = ?, surname = ?, dob = ?, age = ?, gender = ?, email = ?, phone = ?, wellness_date = ?, partner_id = ? WHERE id = ?',
        [data.first_name, data.middle_name, data.surname, toSqlDate(data.dob), data.age, data.gender, data.email, data.phone, toSqlDate(data.wellness_date), data.partner_id, id]
    );
}

export async function fetchMessages(userId: number, otherId?: number): Promise<Message[]> {
    noStore();
    let query = 'SELECT m.*, u.name as sender_name, u.avatarUrl as sender_avatar FROM messages m JOIN users u ON m.sender_id = u.id WHERE (m.sender_id = ? OR m.receiver_id = ?) AND m.deleted_at IS NULL';
    let params = [userId, userId];
    if (otherId) { 
        query += ' AND (m.sender_id = ? OR m.receiver_id = ?) '; 
        params.push(otherId, otherId); 
    }
    query += ' ORDER BY m.created_at DESC ';
    const [rows] = await db.query(query, params);
    return serialize(rows as Message[]);
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
export async function bulkDeleteParameters(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function updateAppointmentStatus(id: number, status: string): Promise<void> { await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]); }
export async function deletePartner(id: number): Promise<void> { await db.query('UPDATE partners SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteMedication(id: number): Promise<void> { await db.query('UPDATE medications SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteClinicalParameter(id: number): Promise<void> { await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function sendMessage(senderId: number, receiverId: number, content: string): Promise<number> { const [result] = await db.query('INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)', [senderId, receiverId, content]); return Number((result as any).insertId); }

export async function fetchDashboardStats(requestingUser?: User) {
    noStore();
    try {
        const isPartner = requestingUser?.role === 'partner' && requestingUser.partner_id;
        const partnerParam = isPartner ? [requestingUser.partner_id] : [];
        const partnerFilter = isPartner ? 'AND partner_id = ?' : '';

        // Simplified aggregate queries for robust data fetching
        const [totalRows] = await db.query(`SELECT COUNT(*) as count FROM patients WHERE deleted_at IS NULL ${partnerFilter}`, partnerParam);
        const [genderRows] = await db.query(`SELECT gender, COUNT(*) as count FROM patients WHERE deleted_at IS NULL ${partnerFilter} GROUP BY gender`, partnerParam);

        return serialize({
            totalPatients: (totalRows as any)[0]?.count || 0,
            genderDistribution: (genderRows as any[]).map(row => ({
                gender: row.gender || 'Other',
                count: Number(row.count)
            }))
        });
    } catch (error) {
        console.error('fetchDashboardStats Error:', error);
        return null;
    }
}
