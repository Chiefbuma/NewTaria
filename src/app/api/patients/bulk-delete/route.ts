import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, isAllowedForPatientMutation } from '@/lib/auth';
import { bulkDeletePatients } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'onboarding')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const { ids } = await req.json();
        if (!Array.isArray(ids)) {
            return NextResponse.json({ error: 'IDs must be an array' }, { status: 400 });
        }
        await bulkDeletePatients(ids);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
