import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { authorizeApiRequest, createUserSession } from '@/lib/auth';
import { fetchUserAuthById, updateUserPassword, clearPasswordResetTokensForUser } from '@/lib/data';

function validateNewPassword(password: string) {
  return typeof password === 'string' && password.length >= 8;
}

export async function POST(req: Request) {
  try {
    const authResult = await authorizeApiRequest(undefined, { allowPasswordChangeRequired: true });
    if (authResult instanceof NextResponse) return authResult;

    const { currentPassword, newPassword } = await req.json();
    if (!validateNewPassword(newPassword)) {
      return NextResponse.json({ error: 'New password must be at least 8 characters.' }, { status: 400 });
    }

    const user = await fetchUserAuthById(authResult.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const matches = await bcrypt.compare(currentPassword || '', user.password);
    if (!matches) {
      return NextResponse.json({ error: 'Current password is incorrect.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await updateUserPassword(authResult.id, hashedPassword);
    await clearPasswordResetTokensForUser(authResult.id);
    await createUserSession(authResult.id, false);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Unable to change password.' }, { status: 500 });
  }
}
