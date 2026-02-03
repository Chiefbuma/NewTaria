import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const connection = await db.getConnection();
    const [rows] = await connection.query('SELECT * FROM clinical_parameters ORDER BY name ASC');
    connection.release();
    // Parse JSON options string
    const parameters = (rows as any[]).map(p => ({
        ...p,
        options: p.options ? JSON.parse(p.options) : null
    }));
    return NextResponse.json(parameters);
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

    const connection = await db.getConnection();
    const [result] = await connection.query(
      'INSERT INTO clinical_parameters (name, type, unit, `options`) VALUES (?, ?, ?, ?)',
      [name, type, unit || null, options ? JSON.stringify(options) : null]
    );
    
    const insertId = (result as any).insertId;
    const [rows] = await connection.query('SELECT * FROM clinical_parameters WHERE id = ?', [insertId]);
    connection.release();

    const newParam = (rows as any)[0];
    newParam.options = newParam.options ? JSON.parse(newParam.options) : null;

    return NextResponse.json({ message: 'Parameter created successfully', parameter: newParam }, { status: 201 });

  } catch (error) {
    console.error('Error adding parameter:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
