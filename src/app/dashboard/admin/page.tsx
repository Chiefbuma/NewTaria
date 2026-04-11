import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchClinicalParameters, fetchClinics, fetchDiagnoses, fetchPartners, fetchUsers } from '@/lib/data';
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
  const activeSection = setupSections.includes(section as SetupSection) ? (section as SetupSection) : 'payers';

  const [payers, clinics, diagnoses, users, clinicalParameters] = await Promise.all([
    fetchPartners('insurance'),
    fetchClinics(),
    fetchDiagnoses(),
    fetchUsers(),
    fetchClinicalParameters(),
  ]);

  return (
    <SystemSetupView
      payers={payers}
      clinics={clinics}
      diagnoses={diagnoses}
      users={users}
      clinicalParameters={clinicalParameters}
      activeSection={activeSection}
    />
  );
}
