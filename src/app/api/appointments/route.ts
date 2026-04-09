import { NextResponse } from 'next/server';
import { authorizeInternalApiRequest, isAllowedForPatientMutation } from '@/lib/auth';
import { upsertAppointment } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        if (!isAllowedForPatientMutation(authResult.role, 'appointments')) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }
        const body = await req.json();
        const id = await upsertAppointment(body);
        return NextResponse.json({ id, ...body });
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
        await upsertAppointment(body);
        return NextResponse.json(body);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
