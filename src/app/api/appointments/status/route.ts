import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, isAllowedForPatientMutation } from '@/lib/auth';
import { updateAppointmentStatus } from '@/lib/data';

export async function PATCH(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { id, status } = await req.json();
        await updateAppointmentStatus(id, status);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
