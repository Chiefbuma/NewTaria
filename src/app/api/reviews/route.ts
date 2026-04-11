import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { createReview } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'reviews')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        if (!body?.patient_id) return NextResponse.json({ error: 'Missing patient_id' }, { status: 400 });
        const scoped = await ensurePatientInScope(body.patient_id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        const id = await createReview(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
