import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { canAccessAdminCenter, isPartnerRole, isPatientRole } from '@/lib/role-utils';

export default async function DashboardPage() {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect('/');
  }

  if (isPatientRole(user.role) && user.patientId) {
    redirect(`/dashboard/patient/${user.patientId}/progress`);
  }

  if (canAccessAdminCenter(user.role) || isPartnerRole(user.role)) {
    redirect('/dashboard/insights');
  }

  redirect('/dashboard/registry');
}
