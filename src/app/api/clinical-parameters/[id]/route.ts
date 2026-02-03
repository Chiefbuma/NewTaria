import { NextResponse } from 'next/server';
import { clinicalParameters } from '@/lib/mock-data';
import type { ClinicalParameter } from '@/lib/types';

let mockParams: ClinicalParameter[] = [...clinicalParameters];

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const { name, type, unit, options } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ message: 'Name and type are required' }, { status: 400 });
    }

    const paramIndex = mockParams.findIndex(p => p.id === id);

    if (paramIndex === -1) {
        return NextResponse.json({ message: 'Parameter not found' }, { status: 404 });
    }
    
    mockParams[paramIndex] = { ...mockParams[paramIndex], name, type, unit, options };
    
    return NextResponse.json({ message: 'Parameter updated successfully', parameter: mockParams[paramIndex] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating parameter' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = parseInt(params.id);
    const initialLength = mockParams.length;
    mockParams = mockParams.filter(p => p.id !== id);

    if (mockParams.length === initialLength) {
        return NextResponse.json({ message: 'Parameter not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Parameter deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting parameter' }, { status: 500 });
  }
}
