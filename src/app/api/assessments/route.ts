import { NextResponse } from 'next/server';
import { assessments } from '@/lib/mock-data';
import type { Assessment } from '@/lib/types';
import { formatISO } from 'date-fns';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, clinical_parameter_id, value, notes, measured_at } = body;

    if (!patient_id || !clinical_parameter_id || !value || !measured_at) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }
    
    const newAssessment: Assessment = {
      id: Math.max(0, ...assessments.map(a => a.id)) + 1,
      patient_id,
      clinical_parameter_id,
      value,
      notes,
      measured_at: formatISO(new Date(measured_at)),
      created_at: formatISO(new Date()),
      is_normal: null,
    };

    assessments.push(newAssessment);

    return NextResponse.json({ message: 'Assessment recorded successfully', assessment: newAssessment }, { status: 201 });

  } catch (error) {
    console.error('Error adding assessment:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
