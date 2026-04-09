import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchClinicalParameters, fetchClinics, fetchDashboardStats, fetchDiagnoses, fetchPartners, fetchUsers } from '@/lib/data';
import AdminOverview from '@/components/dashboard/admin-overview';
import SystemSetupView, { type SetupSection } from '@/components/settings/system-setup-view';
import { canAccessAdminCenter } from '@/lib/role-utils';

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ section?: string }>;
}) {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    redirect('/');
  }

  if (!canAccessAdminCenter(currentUser.role)) {
    redirect('/dashboard');
  }

  const { section } = await searchParams;
  const setupSections: SetupSection[] = ['payers', 'clinics', 'diagnoses', 'medications', 'clinical-parameters', 'users'];
  const activeSection = setupSections.includes(section as SetupSection) ? (section as SetupSection) : 'dashboard';

  if (activeSection !== 'dashboard') {
    const [payers, clinics, diagnoses, users, clinicalParameters] = await Promise.all([
      fetchPartners('insurance'),
      fetchClinics(),
      fetchDiagnoses(),
      fetchUsers(),
      fetchClinicalParameters(),
    ]);

    return <SystemSetupView payers={payers} clinics={clinics} diagnoses={diagnoses} users={users} clinicalParameters={clinicalParameters} activeSection={activeSection} />;
  }

  const [users, stats] = await Promise.all([fetchUsers(), fetchDashboardStats(currentUser)]);

  return <AdminOverview stats={stats} user={currentUser} />;
}
