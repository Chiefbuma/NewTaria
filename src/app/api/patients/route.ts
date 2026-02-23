import { NextResponse } from 'next/server';
import { updatePatientDetails } from '@/lib/data';

export async function PUT(req: Request) {
    try {
        const { id, ...data } = await req.json();
        await updatePatientDetails(id, data);
        return NextResponse.json({ id, ...data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
