import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { upsertAppointment, fetchAppointmentById, deleteAppointment } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (!body?.patient_id) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        const scoped = await ensurePatientInScope(body.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        const id = await upsertAppointment({ ...body, description: body.description ?? body.notes ?? null, status: body.status ?? 'scheduled' });
        const saved = await fetchAppointmentById(id);
        return NextResponse.json(saved ?? { id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (body?.patient_id) {
            const scoped = await ensurePatientInScope(body.patient_id, authResult);
            if (scoped instanceof NextResponse) return scoped;
        } else if (body?.id) {
            const existing = await fetchAppointmentById(Number(body.id));
            if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
            const scoped = await ensurePatientInScope(existing.patient_id, authResult);
            if (scoped instanceof NextResponse) return scoped;
            body.patient_id = existing.patient_id;
            body.description = body.description ?? body.notes ?? existing.description ?? null;
            body.end_date = body.end_date ?? existing.end_date ?? null;
            body.status = body.status ?? existing.status;
        } else {
            return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        }
        const id = await upsertAppointment(body);
        const saved = await fetchAppointmentById(id);
        return NextResponse.json(saved ?? body);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { id } = await req.json();
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const existing = await fetchAppointmentById(Number(id));
        if (!existing) return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
        const scoped = await ensurePatientInScope(existing.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await deleteAppointment(Number(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
