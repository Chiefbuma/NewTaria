import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { fetchAppointmentById, updateAppointmentStatus } from '@/lib/data';

export async function PATCH(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { id, status } = await req.json();
        const existing = await fetchAppointmentById(Number(id));
        if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        const scoped = await ensurePatientInScope(existing.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await updateAppointmentStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
