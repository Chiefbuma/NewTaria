import type { UserRole } from '@/lib/types';

export function isPatientRole(role: UserRole | undefined | null) {
  return role === 'user' || role === 'patient';
}

export function isPayerRole(role: UserRole | undefined | null) {
  return role === 'partner' || role === 'payer';
}

export function isPartnerRole(role: UserRole | undefined | null) {
  return isPayerRole(role);
}

export function isClinicianRole(role: UserRole | undefined | null) {
  return role === 'physician' || role === 'clinician';
}

export function isInternalUserRole(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator' || role === 'staff' || isClinicianRole(role);
}

export function canAccessAdminCenter(role: UserRole | undefined | null) {
  return role === 'admin';
}

export function canManageOnboarding(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator';
}

export function canManageGoals(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator';
}

export function canManageAssessments(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator' || isClinicianRole(role);
}

export function canManageReviews(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator' || isClinicianRole(role);
}

export function canManageAppointments(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator';
}

export function canManagePrescriptions(role: UserRole | undefined | null) {
  return role === 'admin' || role === 'navigator' || isClinicianRole(role);
}

export function getRoleLabel(role: UserRole | undefined | null) {
  switch (role) {
    case 'admin':
      return 'Admin';
    case 'navigator':
      return 'Navigator';
    case 'physician':
    case 'clinician':
      return 'Clinician';
    case 'partner':
    case 'payer':
      return 'Partner';
    case 'staff':
      return 'Staff';
    case 'user':
    case 'patient':
      return 'Patient';
    default:
      return 'User';
  }
}
