import { NextResponse } from 'next/server';
import { upsertAppointment } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = await upsertAppointment(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const body = await req.json();
        await upsertAppointment(body);
        return NextResponse.json(body);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
