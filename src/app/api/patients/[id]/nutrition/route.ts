import { NextResponse } from 'next/server';
import { nutrition } from '@/lib/mock-data';
import type { Nutrition } from '@/lib/types';
import { formatISO } from 'date-fns';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient_id = parseInt(params.id);
    const body = await request.json();
    
    const { weight, height } = body;
    let bmi;
    if (weight && height) {
        const heightInMeters = Number(height) / 100;
        bmi = (Number(weight) / (heightInMeters * heightInMeters)).toFixed(1);
    }

    // Remove existing record for the patient
    const index = nutrition.findIndex(n => n.patient_id === patient_id);
    if (index !== -1) {
        nutrition.splice(index, 1);
    }
    
    const newNutrition: Nutrition = {
      id: Math.max(0, ...nutrition.map(n => n.id)) + 1,
      patient_id,
      ...body,
      bmi,
      created_at: formatISO(new Date()),
    };
    
    nutrition.push(newNutrition);

    return NextResponse.json({ message: 'Nutrition record added successfully', nutrition: newNutrition }, { status: 201 });

  } catch (error) {
    console.error('Error adding nutrition record:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
