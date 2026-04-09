import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { User, UserRole } from '@/lib/types';
import { fetchUserById, fetchPatientById, fetchPatientByUserId } from '@/lib/data';
import { SESSION_COOKIE_NAME, createSessionToken, getSessionCookieOptions, getSessionCookieValue, verifySessionToken } from '@/lib/session';
import { canAccessAdminCenter, canManageAppointments, canManageAssessments, canManageGoals, canManageOnboarding, canManagePrescriptions, canManageReviews, isInternalUserRole, isPatientRole } from '@/lib/role-utils';

export async function createUserSession(userId: number, mustChangePassword = false) {
  const token = await createSessionToken(userId, mustChangePassword);
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, getSessionCookieOptions());
}

export async function clearUserSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentSessionUser(): Promise<(User & { patientId?: number }) | null> {
  const cookieStore = await cookies();
  const payload = await verifySessionToken(getSessionCookieValue(cookieStore.get(SESSION_COOKIE_NAME)));
  if (!payload) return null;

  const user = await fetchUserById(payload.userId);
  if (!user) return null;

  if (isPatientRole(user.role)) {
    const patient = await fetchPatientByUserId(user.id);
    return patient ? { ...user, patientId: patient.id } : user;
  }

  return user;
}

export async function requireAuthenticatedUserForPage() {
  return getCurrentSessionUser();
}

export async function authorizeApiRequest(
  allowedRoles?: UserRole[],
  options?: { allowPasswordChangeRequired?: boolean }
): Promise<NextResponse | (User & { patientId?: number })> {
  const user = await getCurrentSessionUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (user.must_change_password && !options?.allowPasswordChangeRequired) {
    return NextResponse.json({ error: 'Password change required' }, { status: 403 });
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return user;
}

export async function authorizeInternalApiRequest() {
  const authResult = await authorizeApiRequest();
  if (authResult instanceof NextResponse) return authResult;
  if (!isInternalUserRole(authResult.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return authResult;
}

export async function authorizeAdminApiRequest() {
  const authResult = await authorizeApiRequest();
  if (authResult instanceof NextResponse) return authResult;
  if (!canAccessAdminCenter(authResult.role)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return authResult;
}

export async function authorizePatientAccess(patientId: number | string) {
  const authResult = await authorizeApiRequest();
  if (authResult instanceof NextResponse) return authResult;

  const patient = await fetchPatientById(String(patientId), authResult);
  if (!patient) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return { user: authResult, patient };
}

export function isAllowedForPatientMutation(
  role: UserRole | undefined | null,
  mutation: 'onboarding' | 'goals' | 'assessments' | 'reviews' | 'appointments' | 'prescriptions'
) {
  if (mutation === 'onboarding') return canManageOnboarding(role);
  if (mutation === 'goals') return canManageGoals(role);
  if (mutation === 'assessments') return canManageAssessments(role);
  if (mutation === 'reviews') return canManageReviews(role);
  if (mutation === 'appointments') return canManageAppointments(role);
  if (mutation === 'prescriptions') return canManagePrescriptions(role);
  return false;
}
