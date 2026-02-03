import { NextResponse } from 'next/server';
import { goals } from '@/lib/mock-data';
import type { Goal } from '@/lib/types';

let mockGoals: Goal[] = [...goals];

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline } = body;

    if (!patient_id || !clinical_parameter_id || !target_value || !target_operator || !status || !deadline) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const newGoal: Goal = {
        id: Math.max(0, ...mockGoals.map(g => g.id)) + 1,
        patient_id,
        clinical_parameter_id,
        target_value,
        target_operator,
        status,
        notes,
        deadline,
        created_at: new Date().toISOString()
    };

    mockGoals.push(newGoal);

    return NextResponse.json({ message: 'Goal added successfully', goal: newGoal }, { status: 201 });

  } catch (error) {
    console.error('Error adding goal:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
