import { NextResponse } from 'next/server';
import { corporates } from '@/lib/mock-data';

export async function GET() {
  try {
    return NextResponse.json(corporates.sort((a, b) => a.name.localeCompare(b.name)));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching corporates' }, { status: 500 });
  }
}
