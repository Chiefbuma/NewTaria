import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { createPasswordResetToken, getUserByEmail } from '@/lib/data';

function buildResetUrl(token: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL || 'http://localhost:3000';
  return `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
}

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!normalizedEmail) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const user = await getUserByEmail(normalizedEmail);
    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 1000 * 60 * 30);
      await createPasswordResetToken(user.id, token, expiresAt);

      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          success: true,
          resetUrl: buildResetUrl(token),
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to start password reset.' }, { status: 500 });
  }
}
