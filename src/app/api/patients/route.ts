import { NextResponse } from 'next/server';
import { patients } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';

// In-memory store for demo purposes
let mockPatients: Patient[] = [...patients];

export async function GET() {
  try {
    // In a real app, you'd fetch from a database.
    return NextResponse.json(mockPatients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
  } catch (error) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { first_name, surname, phone, wellness_date } = body;

        if (!first_name || !surname || !wellness_date) {
            return NextResponse.json({ message: 'First name, surname, and wellness date are required.' }, { status: 400 });
        }

        const newPatient: Patient = {
            id: Math.max(0, ...mockPatients.map(p => p.id)) + 1,
            first_name,
            surname,
            phone,
            wellness_date,
            status: 'Pending',
            created_at: new Date().toISOString(),
            middle_name: null,
            dob: null,
            age: null,
            sex: null,
            email: null,
            corporate_id: null,
            date_of_onboarding: null,
            has_glucometer: false,
            has_bp_machine: false,
            has_tape_measure: false,
            brief_medical_history: null,
            years_since_diagnosis: null,
            emergency_contact_name: null,
            emergency_contact_phone: null,
            emergency_contact_relation: null,
            consent_date: null,
            navigator_id: null,
        };
        
        mockPatients.push(newPatient);

        return NextResponse.json({ message: 'Patient registered successfully', patientId: newPatient.id }, { status: 201 });
    } catch (error) {
        console.error('Error creating patient:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}
