import { NextResponse } from 'next/server';
import { goals } from '@/lib/mock-data';
import type { Goal } from '@/lib/types';
import { formatISO } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient_id = parseInt(params.id);
    const body = await request.json();

    // Remove existing goal for the patient
    const index = goals.findIndex(g => g.patient_id === patient_id);
    if (index !== -1) {
        goals.splice(index, 1);
    }
    
    const newGoal: Goal = {
      id: Math.max(0, ...goals.map(g => g.id)) + 1,
      patient_id,
      ...body,
      created_at: formatISO(new Date()),
    };
    
    goals.push(newGoal);

    return NextResponse.json({ message: 'Goal added successfully', goal: newGoal }, { status: 201 });

  } catch (error) {
    console.error('Error adding goal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
