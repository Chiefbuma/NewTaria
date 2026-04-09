import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { canAccessAdminCenter, isPatientRole } from '@/lib/role-utils';

export default async function DashboardPage() {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect('/');
  }

  if (isPatientRole(user.role) && user.patientId) {
    redirect(`/dashboard/patient/${user.patientId}/progress`);
  }

  if (canAccessAdminCenter(user.role)) {
    redirect('/dashboard/admin?section=dashboard');
  }

  redirect('/dashboard/registry');
}
