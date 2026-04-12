import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchDashboardStats, fetchInsightsDeepDive, fetchInsightsMemberMetricsPage, fetchPartners, fetchRegistryInsights } from '@/lib/data';
import { canAccessAdminCenter, isPartnerRole, isPatientRole } from '@/lib/role-utils';
import InsightsReport from '@/components/dashboard/insights-report';
import PartnerGlobalFilter from '@/components/dashboard/partner-global-filter';

export default async function InsightsPage({
  searchParams,
}: {
  searchParams: Promise<{ partnerId?: string; page?: string }>;
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

  const { partnerId, page } = await searchParams;
  const selectedPartnerId = isAdmin
    ? (partnerId ? Number(partnerId) : null)
    : (currentUser.partner_id ?? null);
  const memberPage = page ? Number(page) : 1;

  const partners = isAdmin ? await fetchPartners() : [];
  const [stats, insights, deepDive, memberMetrics] = await Promise.all([
    fetchDashboardStats(currentUser, selectedPartnerId),
    fetchRegistryInsights(currentUser, selectedPartnerId),
    fetchInsightsDeepDive(currentUser, selectedPartnerId),
    fetchInsightsMemberMetricsPage(currentUser, selectedPartnerId, memberPage, 5),
  ]);
  const filterLabel = isAdmin
    ? (selectedPartnerId ? (partners.find((p) => p.id === selectedPartnerId)?.name ?? null) : null)
    : (currentUser.partner_name ?? null);

  const partnerName = (currentUser.partner_name || 'Partner').toUpperCase();
  const reportTitle = filterLabel ? filterLabel : 'All Partners';

  const filterComponent = isPartner ? null : (
    <PartnerGlobalFilter
      partners={partners}
      selectedPartnerId={selectedPartnerId}
      locked={false}
      lockedLabel={currentUser.partner_name || 'Your Partner'}
      labelPrefix="Dashboard"
    />
  );

  return (
    <div className="space-y-6">
      {isPartner && (
        <div className="text-center text-sm font-bold tracking-[0.18em] text-foreground">
          {partnerName}
        </div>
      )}
      <InsightsReport
        stats={stats}
        insights={insights}
        deepDive={deepDive}
        memberMetrics={memberMetrics}
        selectedPartnerId={selectedPartnerId}
        reportTitle={reportTitle}
        filterComponent={filterComponent}
      />
    </div>
  );
}
