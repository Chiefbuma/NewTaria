import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM corporates ORDER BY name ASC');
    connection.release();
    return NextResponse.json(rows);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching corporates' }, { status: 500 });
  }
}
