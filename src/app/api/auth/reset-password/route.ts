import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { consumePasswordResetToken, fetchPasswordResetToken, updateUserPassword, clearPasswordResetTokensForUser } from '@/lib/data';

function validateNewPassword(password: string) {
  return typeof password === 'string' && password.length >= 8;
}

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token) {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }

    if (!validateNewPassword(newPassword)) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const resetToken = await fetchPasswordResetToken(token);
    if (!resetToken) {
      return NextResponse.json({ error: 'This reset link is invalid or has expired.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(resetToken.user_id, hashedPassword);
    await consumePasswordResetToken(resetToken.id);
    await clearPasswordResetTokensForUser(resetToken.user_id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to reset password.' }, { status: 500 });
  }
}
