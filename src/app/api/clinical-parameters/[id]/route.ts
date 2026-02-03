import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const { name, type, unit, options } = await request.json();
    if (!name || !type) {
      return NextResponse.json({ message: 'Name and type are required' }, { status: 400 });
    }

    const connection = await db.getConnection();
    await connection.query(
      'UPDATE clinical_parameters SET name = ?, type = ?, unit = ?, `options` = ? WHERE id = ?',
      [name, type, unit, options ? JSON.stringify(options) : null, params.id]
    );
    
    const [rows] = await connection.query('SELECT * FROM clinical_parameters WHERE id = ?', [params.id]);
    connection.release();

    if ((rows as any).length === 0) {
      return NextResponse.json({ message: 'Parameter not found after update' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Parameter updated successfully', parameter: (rows as any)[0] });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error updating parameter' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const connection = await db.getConnection();
    // Consider constraints: what happens if assessments or goals use this parameter?
    // For now, we assume direct deletion is acceptable for this MVP.
    await connection.query('DELETE FROM clinical_parameters WHERE id = ?', [params.id]);
    connection.release();
    return NextResponse.json({ message: 'Parameter deleted successfully' });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error deleting parameter' }, { status: 500 });
  }
}
