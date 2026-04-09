import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, isAllowedForPatientMutation } from '@/lib/auth';
import { updatePatientDetails } from '@/lib/data';

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'onboarding')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { id, ...data } = await req.json();
        await updatePatientDetails(id, data);
        return NextResponse.json({ id, ...data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
