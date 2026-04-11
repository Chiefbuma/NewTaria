import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchDashboardStats, fetchPartners } from '@/lib/data';
import { canAccessAdminCenter, isPartnerRole, isPatientRole } from '@/lib/role-utils';
import AdminOverview from '@/components/dashboard/admin-overview';
import PartnerGlobalFilter from '@/components/dashboard/partner-global-filter';

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string }>;
}) {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) redirect('/');

  if (isPatientRole(currentUser.role) && currentUser.patientId) {
    redirect(`/dashboard/patient/${currentUser.patientId}/progress`);
  }

  const isAdmin = canAccessAdminCenter(currentUser.role);
  const isPartner = isPartnerRole(currentUser.role);
  if (!isAdmin && !isPartner) {
    redirect('/dashboard');
  }

  const { partnerId } = await searchParams;
  const selectedPartnerId = isAdmin
    ? (partnerId ? Number(partnerId) : null)
    : (currentUser.partner_id ?? null);

  const partners = isAdmin ? await fetchPartners() : [];
  const stats = await fetchDashboardStats(currentUser, selectedPartnerId);
  const filterLabel = isAdmin
    ? (selectedPartnerId ? (partners.find((p) => p.id === selectedPartnerId)?.name ?? null) : null)
    : (currentUser.partner_name ?? null);

  return (
    <div className="space-y-6">
      {isPartner ? (
        <div className="text-center text-sm font-bold tracking-[0.18em] text-foreground">
          {(currentUser.partner_name || 'Partner').toUpperCase()}
        </div>
      ) : (
        <>
          <PartnerGlobalFilter
            partners={partners}
            selectedPartnerId={selectedPartnerId}
            locked={false}
            lockedLabel={currentUser.partner_name || 'Your Partner'}
            labelPrefix="Dashboard"
          />
          {filterLabel ? (
            <div className="text-xs font-semibold text-muted-foreground">
              Filtered by partner: <span className="text-foreground">{filterLabel}</span>
            </div>
          ) : null}
        </>
      )}
      <AdminOverview stats={stats} />
    </div>
  );
}
