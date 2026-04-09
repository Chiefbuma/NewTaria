import { NextResponse } from 'next/server';
import { authorizeAdminApiRequest } from '@/lib/auth';
import { bulkDeleteMedications } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const { ids } = await req.json();
        if (!Array.isArray(ids)) {
            return NextResponse.json({ error: 'IDs must be an array' }, { status: 400 });
        }
        await bulkDeleteMedications(ids);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
