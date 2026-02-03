import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { fetchPatientById } from '@/lib/data';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = await fetchPatientById(params.id);
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    return NextResponse.json(patient);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching patient' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const patientId = params.id;
        const body = await request.json();
        
        // This endpoint handles both partial updates and the full onboarding
        const connection = await db.getConnection();

        // Dynamically build query to only update provided fields
        const fields = Object.keys(body);
        const values = Object.values(body);

        if (fields.length === 0) {
            return NextResponse.json({ message: 'No fields to update' }, { status: 400 });
        }

        const fieldPlaceholders = fields.map(field => `\`${field}\` = ?`).join(', ');

        await connection.query(
            `UPDATE patients SET ${fieldPlaceholders} WHERE id = ?`,
            [...values, patientId]
        );
        
        connection.release();

        const updatedPatient = await fetchPatientById(patientId);

        return NextResponse.json({ message: 'Patient updated successfully', patient: updatedPatient });

    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const connection = await db.getConnection();
        // Setup cascade deletes in MySQL or delete related records manually
        await connection.query('DELETE FROM assessments WHERE patient_id = ?', [params.id]);
        await connection.query('DELETE FROM goals WHERE patient_id = ?', [params.id]);
        await connection.query('DELETE FROM patients WHERE id = ?', [params.id]);
        connection.release();
        return NextResponse.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
    }
}
