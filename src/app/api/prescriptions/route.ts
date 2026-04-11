import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { upsertPrescription, deletePrescription, fetchPrescriptionById } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'prescriptions')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (!body?.patient_id) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        const scoped = await ensurePatientInScope(body.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        const id = await upsertPrescription(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'prescriptions')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (body?.patient_id) {
            const scoped = await ensurePatientInScope(body.patient_id, authResult);
            if (scoped instanceof NextResponse) return scoped;
        } else if (body?.id) {
            const existing = await fetchPrescriptionById(Number(body.id));
            if (!existing) return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
            const scoped = await ensurePatientInScope(existing.patient_id, authResult);
            if (scoped instanceof NextResponse) return scoped;
        } else {
            return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        }
        const id = await upsertPrescription(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'prescriptions')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const existing = await fetchPrescriptionById(Number(id));
        if (!existing) return NextResponse.json({ error: 'Prescription not found' }, { status: 404 });
        const scoped = await ensurePatientInScope(existing.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await deletePrescription(Number(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
