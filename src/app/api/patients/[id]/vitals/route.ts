import { NextResponse } from 'next/server';
import { vitals } from '@/lib/mock-data';
import type { Vitals } from '@/lib/types';
import { formatISO } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient_id = parseInt(params.id);
    const body = await request.json();

    // Remove existing vitals for the patient to ensure only one record
    const index = vitals.findIndex(v => v.patient_id === patient_id);
    if (index !== -1) {
        vitals.splice(index, 1);
    }
    
    const newVitals: Vitals = {
      id: Math.max(0, ...vitals.map(v => v.id)) + 1,
      patient_id,
      ...body,
      created_at: formatISO(new Date()),
    };
    
    vitals.push(newVitals);

    return NextResponse.json({ message: 'Vitals added successfully', vitals: newVitals }, { status: 201 });

  } catch (error) {
    console.error('Error adding vitals:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
