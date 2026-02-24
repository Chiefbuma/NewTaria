import { NextResponse } from 'next/server';
import { fetchUsers } from '@/lib/data';

/**
 * API Route to fetch system users for messaging contact lists.
 */
export async function GET() {
    try {
        const users = await fetchUsers();
        return NextResponse.json(users);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
