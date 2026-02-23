import { NextResponse } from 'next/server';
import { updateAppointmentStatus } from '@/lib/data';

export async function PATCH(req: Request) {
    try {
        const { id, status } = await req.json();
        await updateAppointmentStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
