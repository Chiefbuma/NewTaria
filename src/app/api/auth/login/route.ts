import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createUserSession } from '@/lib/auth';
import { fetchPatientByUserId, getUserByPhone, recordFailedLoginAttempt, recordSuccessfulLogin } from '@/lib/data';
import type { User } from '@/lib/types';
import { isPatientRole } from '@/lib/role-utils';

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const phone = String(body?.phone || '').trim();
    const password = String(body?.password || '');

    if (!phone || !password) {
      return NextResponse.json({ success: false, error: 'Phone number and password are required.' }, { status: 400 });
    }

    const userFromDb = await getUserByPhone(phone);
    if (!userFromDb) {
      return NextResponse.json({ success: false, error: 'Invalid phone number or password.' }, { status: 401 });
    }

    if (userFromDb.locked_until) {
      const lockedUntil = new Date(userFromDb.locked_until);
      if (!Number.isNaN(lockedUntil.getTime()) && lockedUntil.getTime() > Date.now()) {
        return NextResponse.json(
          { success: false, error: 'Account temporarily locked. Please try again later.' },
          { status: 423 }
        );
      }
    }

    const passwordsMatch = await bcrypt.compare(password, userFromDb.password);
    if (!passwordsMatch) {
      const currentAttempts = Number(userFromDb.failed_login_attempts || 0);
      const nextAttempts = currentAttempts + 1;
      const lockAfter = 5;
      const lockedUntil = nextAttempts >= lockAfter ? new Date(Date.now() + 15 * 60 * 1000) : null;
      await recordFailedLoginAttempt(userFromDb.id, nextAttempts, lockedUntil);
      return NextResponse.json({ success: false, error: 'Invalid phone number or password.' }, { status: 401 });
    }

    const { password: _, ...userWithoutPassword } = userFromDb;
    const user: User & { patientId?: number } = { ...userWithoutPassword };

    if (isPatientRole(user.role)) {
      const patient = await fetchPatientByUserId(user.id);
      if (patient) user.patientId = patient.id;
    }

    await recordSuccessfulLogin(user.id);
    await createUserSession(user.id, Boolean(user.must_change_password));

    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('auth/login Error:', error);
    return NextResponse.json(
      { success: false, error: 'An unexpected error occurred during login.' },
      { status: 500 }
    );
  }
}

