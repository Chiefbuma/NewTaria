import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline } = body;

    if (!patient_id || !clinical_parameter_id || !target_value || !target_operator || !status || !deadline) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO goals (patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline]
    );
    
    const insertId = (result as any).insertId;
    const [rows] = await connection.query('SELECT * FROM goals WHERE id = ?', [insertId]);
    connection.release();

    return NextResponse.json({ message: 'Goal added successfully', goal: (rows as any)[0] }, { status: 201 });

  } catch (error) {
    console.error('Error adding goal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
