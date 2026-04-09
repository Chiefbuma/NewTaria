
import { NextResponse } from 'next/server';
import { authorizeAdminApiRequest, authorizeInternalApiRequest } from '@/lib/auth';
import { fetchPartners, upsertPartner, deletePartner } from '@/lib/data';

export async function GET(req: Request) {
    try {
        const authResult = await authorizeInternalApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const { searchParams } = new URL(req.url);
        const type = searchParams.get('type');
        const partners = await fetchPartners(
            type === 'insurance' || type === 'clinic' || type === 'hospital' || type === 'specialist' || type === 'corporate'
                ? type
                : undefined
        );
        return NextResponse.json(partners);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const body = await req.json();
        const id = await upsertPartner(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        const body = await req.json();
        await upsertPartner(body);
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
        const authResult = await authorizeAdminApiRequest();
        if (authResult instanceof NextResponse) return authResult;
        await deletePartner(Number(id));
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
