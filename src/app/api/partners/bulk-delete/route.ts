import { NextResponse } from 'next/server';
import { bulkDeletePartners } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const { ids } = await req.json();
        if (!Array.isArray(ids)) {
            return NextResponse.json({ error: 'IDs must be an array' }, { status: 400 });
        }
        await bulkDeletePartners(ids);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
