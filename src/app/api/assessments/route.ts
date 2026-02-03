import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, clinical_parameter_id, value, notes, measured_at } = body;

    if (!patient_id || !clinical_parameter_id || !value || !measured_at) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO assessments (patient_id, clinical_parameter_id, value, notes, measured_at) VALUES (?, ?, ?, ?, ?)',
      [patient_id, clinical_parameter_id, value, notes, measured_at]
    );
    
    const insertId = (result as any).insertId;
    const [rows] = await connection.query('SELECT * FROM assessments WHERE id = ?', [insertId]);
    connection.release();

    return NextResponse.json({ message: 'Assessment added successfully', assessment: (rows as any)[0] }, { status: 201 });

  } catch (error) {
    console.error('Error adding assessment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
