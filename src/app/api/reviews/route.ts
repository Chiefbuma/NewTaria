import { NextResponse } from 'next/server';
import { createReview } from '@/lib/data';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const id = await createReview(body);
        return NextResponse.json({ id, ...body });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
