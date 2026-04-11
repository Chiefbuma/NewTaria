import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchPatients, fetchPartners, fetchRegistryInsights } from '@/lib/data';
import RegistryDashboard from '@/components/dashboard/registry-dashboard';
import { canAccessAdminCenter, isPartnerRole, isPatientRole } from '@/lib/role-utils';

export default async function RegistryPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    redirect('/');
  }

  if (isPatientRole(currentUser.role) && currentUser.patientId) {
    redirect(`/dashboard/patient/${currentUser.patientId}/progress`);
  }

  const { partnerId } = await searchParams;
  const selectedPartnerId =
    canAccessAdminCenter(currentUser.role) && partnerId ? Number(partnerId) : (isPartnerRole(currentUser.role) ? (currentUser.partner_id ?? null) : null);
  const partners = canAccessAdminCenter(currentUser.role) ? await fetchPartners() : [];

  const [patients, insights] = await Promise.all([
    fetchPatients(currentUser, selectedPartnerId),
    fetchRegistryInsights(currentUser, selectedPartnerId),
  ]);
  const onboardedPatients = patients.filter((patient) => patient.status !== 'Pending');

  return (
    <RegistryDashboard
      patients={onboardedPatients}
      insights={insights}
      partners={partners}
      selectedPartnerId={selectedPartnerId}
      partnerLocked={isPartnerRole(currentUser.role)}
      lockedPartnerLabel={currentUser.partner_name || 'Your Partner'}
    />
  );
}
