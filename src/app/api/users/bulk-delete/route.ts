import { NextResponse } from 'next/server';
import { authorizeAdminApiRequest } from '@/lib/auth';
import { bulkDeleteUsers } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const { ids } = await req.json();
        await bulkDeleteUsers(ids || []);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
