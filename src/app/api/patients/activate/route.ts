import { NextResponse } from 'next/server';
import { activatePatient } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const { id, ...data } = await req.json();
        await activatePatient(id, data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
