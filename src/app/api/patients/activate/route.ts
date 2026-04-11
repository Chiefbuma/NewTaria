import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, ensurePatientInScope, isAllowedForPatientMutation } from '@/lib/auth';
import { activatePatient } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'onboarding')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { id, ...data } = await req.json();
        const scoped = await ensurePatientInScope(id, authResult);
        if (scoped instanceof NextResponse) return scoped;
        await activatePatient(id, data);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
