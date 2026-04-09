import { NextResponse } from 'next/server';
import { clearUserSession, getCurrentSessionUser } from '@/lib/auth';

export async function GET() {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function DELETE() {
  await clearUserSession();
  return NextResponse.json({ success: true });
}
