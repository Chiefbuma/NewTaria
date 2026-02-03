import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchPatients } from '@/lib/data';

export async function GET() {
  try {
    const patients = await fetchPatients();
    return NextResponse.json(patients);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching patients' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { first_name, surname, phone, wellness_date } = body;

        if (!first_name || !surname || !wellness_date) {
            return NextResponse.json({ message: 'First name, surname, and wellness date are required.' }, { status: 400 });
        }

        const connection = await db.getConnection();
        const [result] = await connection.query(
            'INSERT INTO patients (first_name, surname, phone, wellness_date, status) VALUES (?, ?, ?, ?, ?)',
            [first_name, surname, phone, wellness_date, 'Pending']
        );
        connection.release();

        const insertId = (result as any).insertId;

        return NextResponse.json({ message: 'Patient registered successfully', patientId: insertId }, { status: 201 });
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
