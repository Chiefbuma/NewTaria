import { NextResponse } from 'next/server';
import { fetchMessages, sendMessage } from '@/lib/data';

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const otherId = searchParams.get('otherId');
        
        // In a real production app, we'd get the userId from a secure session cookie
        // For this prototype, we rely on the client-side session logic for simple routing
        // This is where a JWT/NextAuth check would verify the current user ID
        const userId = 1; // Placeholder for session user ID

        const messages = await fetchMessages(userId, otherId ? Number(otherId) : undefined);
        return NextResponse.json(messages);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { receiverId, content } = await req.json();
        const userId = 1; // Placeholder for session user ID
        const id = await sendMessage(userId, Number(receiverId), content);
        return NextResponse.json({ id, sender_id: userId, receiver_id: receiverId, content, created_at: new Date().toISOString() });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
