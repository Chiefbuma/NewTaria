import { db } from '@/lib/db';
import type { Patient, Corporate, User, ClinicalParameter, Assessment, Goal } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

// Helper to safely parse JSON
const safeJsonParse = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
        return JSON.parse(jsonString);
    } catch (e) {
        return null;
    }
};


export async function fetchPatients() {
  noStore();
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query(`
        SELECT p.*, u.name as navigator_name
        FROM patients p
        LEFT JOIN users u ON p.navigator_id = u.id
        ORDER BY p.created_at DESC
    `);
    connection.release();
    return rows as Patient[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch patients.');
  }
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
  noStore();
  try {
    const connection = await db.getConnection();
    
    // 1. Fetch patient with corporate and navigator info
    const [patientRows] = await connection.query(`
      SELECT p.*, c.name as corporate_name, u.name as navigator_name
      FROM patients p
      LEFT JOIN corporates c ON p.corporate_id = c.id
      LEFT JOIN users u ON p.navigator_id = u.id
      WHERE p.id = ?
    `, [id]);

    if ((patientRows as any).length === 0) {
      connection.release();
      return null;
    }
    const patient = (patientRows as any)[0] as Patient;

    // 2. Fetch assessments with parameter details
    const [assessments] = await connection.query(`
        SELECT a.*, cp.name as parameter_name, cp.type as parameter_type, cp.unit as parameter_unit
        FROM assessments a
        JOIN clinical_parameters cp ON a.clinical_parameter_id = cp.id
        WHERE a.patient_id = ?
        ORDER BY a.measured_at DESC, a.created_at DESC
    `, [id]);

    // 3. Fetch active goals with parameter details
    const [goals] = await connection.query(`
        SELECT g.*, cp.name as parameter_name, cp.type as parameter_type, cp.unit as parameter_unit
        FROM goals g
        JOIN clinical_parameters cp ON g.clinical_parameter_id = cp.id
        WHERE g.patient_id = ? AND g.status = 'active'
        ORDER BY g.deadline ASC, g.created_at DESC
    `, [id]);

    connection.release();

    patient.assessments = (assessments as any[]).map(a => ({
        ...a,
        parameter: {
            name: a.parameter_name,
            type: a.parameter_type,
            unit: a.parameter_unit,
        }
    }));
    patient.goals = (goals as any[]).map(g => ({
        ...g,
        parameter: {
            name: g.parameter_name,
            type: g.parameter_type,
            unit: g.parameter_unit,
        }
    }));

    return patient;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch patient data.');
  }
}

export async function fetchClinicalParameters() {
  noStore();
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM clinical_parameters ORDER BY name ASC');
    connection.release();
    return (rows as any[]).map(p => ({
        ...p,
        options: safeJsonParse(p.options)
    })) as ClinicalParameter[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch clinical parameters.');
  }
}

export async function fetchUsers() {
  noStore();
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT id, name, email, role, avatarUrl FROM users ORDER BY name ASC');
    connection.release();
    return rows as User[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch users.');
  }
}
