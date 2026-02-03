import { NextResponse } from 'next/server';
import { clinicals } from '@/lib/mock-data';
import type { Clinical } from '@/lib/types';
import { formatISO } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient_id = parseInt(params.id);
    const body = await request.json();

    // Remove existing clinical record for the patient
    const index = clinicals.findIndex(c => c.patient_id === patient_id);
    if (index !== -1) {
        clinicals.splice(index, 1);
    }

    const newClinical: Clinical = {
      id: Math.max(0, ...clinicals.map(c => c.id)) + 1,
      patient_id,
      ...body,
      created_at: formatISO(new Date()),
    };
    
    clinicals.push(newClinical);

    return NextResponse.json({ message: 'Clinical record added successfully', clinical: newClinical }, { status: 201 });

  } catch (error) {
    console.error('Error adding clinical record:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
