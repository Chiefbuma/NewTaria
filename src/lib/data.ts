import { db } from './db';
import type { Patient, User, Corporate, ClinicalParameter, Assessment, Goal, Diagnosis, Medication, Prescription, Appointment, Review, Payer } from './types';
import { unstable_noStore as noStore } from 'next/cache';

/**
 * Helper to ensure database values are safe for Next.js serialization.
 * Converts Dates to strings and handles potential nulls by deep cloning via JSON.
 */
function serialize<T>(data: T): T {
    if (!data) return data;
    return JSON.parse(JSON.stringify(data));
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
    const needsAttention = patient.status === 'Critical' || goals.some(isOverdue);

    return {
        totalGoals,
        activeGoals,
        totalAssessments,
        assessmentCoverage: totalGoals > 0 ? Math.round((totalAssessments / totalGoals) * 100) : 0,
        needsAttention
    };
}

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
        return patients.map(p => {
            const basePatient = {
                ...p,
                assessments: [], 
                goals: [],
                prescriptions: [],
                appointments: [],
                reviews: []
            };
            return serialize({
                ...basePatient,
                stats: calculatePatientStats(basePatient)
            });
        });
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch patients.');
    }
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
    noStore();
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
        console.error('Database Error:', error);
        throw new Error('Failed to fetch patient details.');
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
        return serialize(rows as User[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch users.');
    }
}

export async function getUserByEmail(email: string) {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        const users = rows as any[];
        return serialize(users[0] || null);
    } catch (error) {
        console.error('Database Error:', error);
        return null;
    }
}

export async function createUser(userData: any): Promise<number> {
    try {
        const [result] = await db.query(
            'INSERT INTO users (name, email, password, role, avatarUrl) VALUES (?, ?, ?, ?, ?)',
            [userData.name, userData.email, userData.password, userData.role || 'patient', userData.avatarUrl || null]
        );
        return (result as any).insertId;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create user.');
    }
}

export async function createPatient(patientData: any): Promise<number> {
    try {
        const [result] = await db.query(
            'INSERT INTO patients (user_id, first_name, surname, email, age, gender, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
            [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.age, patientData.gender, patientData.status || 'Pending']
        );
        return (result as any).insertId;
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to create patient.');
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters ORDER BY name ASC');
        return serialize(rows as ClinicalParameter[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch clinical parameters.');
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM corporates ORDER BY name ASC');
        return serialize(rows as Corporate[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch corporates.');
    }
}

export async function fetchPayers(): Promise<Payer[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM payers ORDER BY name ASC');
        return serialize(rows as Payer[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch payers.');
    }
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM diagnoses ORDER BY name ASC');
        return serialize(rows as Diagnosis[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch diagnoses.');
    }
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM medications ORDER BY name ASC');
        return serialize(rows as Medication[]);
    } catch (error) {
        console.error('Database Error:', error);
        throw new Error('Failed to fetch medications.');
    }
}
