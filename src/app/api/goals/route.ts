import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { createGoal, updateGoal, deleteGoal, fetchGoalById } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'goals')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (!body?.patient_id) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        const scoped = await ensurePatientInScope(body.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        const id = await createGoal(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'goals')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        const { id, ...data } = body;
        if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });
        const existing = await fetchGoalById(Number(id));
        if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        const scoped = await ensurePatientInScope(existing.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await updateGoal(id, data);
        return NextResponse.json(body);
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
        if (!isAllowedForPatientMutation(authResult.role, 'goals')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const existing = await fetchGoalById(Number(id));
        if (!existing) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
        const scoped = await ensurePatientInScope(existing.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await deleteGoal(Number(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
