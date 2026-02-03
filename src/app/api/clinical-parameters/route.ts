import { NextResponse } from 'next/server';
import { clinicalParameters } from '@/lib/mock-data';
import type { ClinicalParameter } from '@/lib/types';

let mockParams: ClinicalParameter[] = [...clinicalParameters];

export async function GET() {
  try {
    return NextResponse.json(mockParams.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching clinical parameters' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, type, unit, options } = await request.json();

    if (!name || !type) {
      return NextResponse.json({ message: 'Name and type are required' }, { status: 400 });
    }

    const newParam: ClinicalParameter = {
      id: Math.max(0, ...mockParams.map(p => p.id)) + 1,
      name,
      type,
      unit: unit || null,
      options: options || null,
    };

    mockParams.push(newParam);

    return NextResponse.json({ message: 'Parameter created successfully', parameter: newParam }, { status: 201 });

  } catch (error) {
    console.error('Error adding parameter:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
