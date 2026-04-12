import type React from 'react';
import { format } from 'date-fns';
import type { InsightsDeepDive, InsightsMemberMetricsPage, RegistryInsights } from '@/lib/types';
import ClassificationSection, { type ClassificationRow } from '@/components/dashboard/classification-section';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

function buildInsightsUrl({
  selectedPartnerId,
  page,
}: {
  selectedPartnerId: number | null;
  page: number;
}) {
  const params = new URLSearchParams();
  if (selectedPartnerId) params.set('partnerId', String(selectedPartnerId));
  params.set('page', String(page));
  return `/dashboard/insights?${params.toString()}`;
}

function ReportTableSection({
  index,
  title,
  description,
  headers,
  children,
  emptyLabel,
  className,
}: {
  index: number;
  title: string;
  description: string;
  headers: { label: string; className?: string }[];
  children: React.ReactNode;
  emptyLabel: string;
  className?: string;
}) {
  const hasRows = Boolean(children);

  return (
    <section
      className={cn(
        'rounded-[24px] border border-border/70 bg-muted/10 p-5 shadow-[0_18px_50px_-40px_rgba(15,23,42,0.18)] transition-colors dark:bg-muted/10',
        className
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-border/70 bg-background text-xs font-semibold text-foreground">
          {index}
        </div>

        <div className="min-w-0 flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="truncate text-[15px] font-semibold tracking-tight text-foreground sm:text-base">
              {title}
            </h3>
            <p className="text-[12px] leading-5 text-muted-foreground">{description}</p>
          </div>

          <Table className="min-w-0 table-fixed">
            <TableHeader className="bg-transparent">
              <TableRow className="border-border/60">
                {headers.map((h) => (
                  <TableHead key={h.label} className={cn('whitespace-nowrap', h.className)}>
                    {h.label}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {hasRows ? (
                children
              ) : (
                <TableRow>
                  <TableCell colSpan={headers.length} className="py-8 text-center text-[12px] italic text-muted-foreground">
                    {emptyLabel}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </section>
  );
}

export default function InsightsReport({
  stats,
  insights,
  deepDive,
  memberMetrics,
  selectedPartnerId,
  reportTitle,
  reportSubtitle,
  className,
}: {
  stats: any;
  insights: RegistryInsights | null;
  deepDive: InsightsDeepDive | null;
  memberMetrics: InsightsMemberMetricsPage | null;
  selectedPartnerId: number | null;
  reportTitle: string;
  reportSubtitle?: string | null;
  className?: string;
}) {
  const totalMembers = Number(stats?.totalOnboarded ?? stats?.totalPatients ?? 0);
  const reportDateLabel = `Report Date: ${format(new Date(), 'dd MMM yyyy')}`;

  const statusRows: ClassificationRow[] = (stats?.statusDistribution ?? []).map((r: any) => ({
    label: String(r.status ?? 'Unknown'),
    total: Number(r.count ?? 0),
  }));
  const diagnosisRows: ClassificationRow[] = (stats?.diagnosisDistribution ?? []).map((r: any) => ({
    label: String(r.diagnosis ?? 'Not Specified'),
    total: Number(r.count ?? 0),
  }));

  const engagementTotal = totalMembers;
  const engagementRows: ClassificationRow[] = [
    {
      label: 'No check-in (14+ days)',
      total: Number(stats?.membersWithNoCheckIn14d ?? 0),
      meta: 'Patients overdue for follow-up',
    },
  ];

  const goalTotal = Math.max(
    0,
    Number(deepDive?.totals?.activeGoals ?? 0) + Number(deepDive?.totals?.completedGoals ?? 0)
  );
  const goalRows: ClassificationRow[] = [
    { label: 'Active goals', total: Number(deepDive?.totals?.activeGoals ?? 0) },
    { label: 'Overdue goals', total: Number(deepDive?.totals?.overdueGoals ?? 0), meta: 'Active goals past deadline' },
    { label: 'Completed goals', total: Number(deepDive?.totals?.completedGoals ?? 0) },
  ];

  const coverageTotal = deepDive?.totals?.activeMembers ?? totalMembers;
  const coverageRows: ClassificationRow[] = [
    {
      label: 'Patients with no active goals',
      total: Number(deepDive?.totals?.membersWithNoActiveGoals ?? 0),
      meta: 'Potential onboarding gap',
    },
    {
      label: 'Active prescriptions',
      total: Number(deepDive?.totals?.activePrescriptions ?? 0),
      meta: 'Prescription records marked active',
    },
    { label: 'Clinical reviews (30d)', total: Number(deepDive?.totals?.reviews30d ?? 0) },
  ];

  const metricsPage = memberMetrics ?? { total: 0, page: 1, pageSize: 5, rows: [] };
  const totalPages = metricsPage.total ? Math.max(1, Math.ceil(metricsPage.total / metricsPage.pageSize)) : 1;
  const canPrev = metricsPage.page > 1;
  const canNext = metricsPage.page < totalPages;

  return (
    <div
      className={cn(
        className ||
          'mx-auto max-w-[1080px] space-y-8 rounded-[32px] border border-border/70 bg-card/95 p-6 text-foreground shadow-[0_28px_70px_-40px_rgba(15,23,42,0.24)] transition-colors md:p-10 dark:bg-card/95'
      )}
    >
      <div className="flex flex-col items-center gap-5 border-b border-border/70 pb-8">
        <div className="space-y-2 text-center">
          <h2 className="text-xl font-semibold tracking-tight text-foreground md:text-2xl">{reportTitle}</h2>
          {reportSubtitle ? <p className="text-sm text-muted-foreground">{reportSubtitle}</p> : null}
          <p className="text-sm text-muted-foreground">{reportDateLabel}</p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        <ClassificationSection
          index={1}
          title="Patient Status"
          description="Distribution across program states (active, critical, discharged, etc)."
          rows={statusRows}
          measuredLabel="Total patients"
          total={totalMembers}
        />
        <ClassificationSection
          index={2}
          title="Diagnosis Mix"
          description="Primary diagnosis distribution for enrolled patients."
          rows={diagnosisRows}
          measuredLabel="Total patients"
          total={totalMembers}
        />
        <ClassificationSection
          index={3}
          title="Engagement Risks"
          description="Patients who have not checked in recently and may require follow-up."
          rows={engagementRows}
          measuredLabel="Population"
          total={Number(engagementTotal)}
        />
        <ClassificationSection
          index={4}
          title="Goal Health"
          description="Goal workload and deadline risk across your population."
          rows={goalRows}
          measuredLabel="Tracked goals"
          total={Number(goalTotal)}
        />
        <ClassificationSection
          index={5}
          title="Coverage"
          description="How well patients are set up with goals, prescriptions, and clinician reviews."
          rows={coverageRows}
          measuredLabel="Total patients"
          total={Number(coverageTotal)}
        />

        <ReportTableSection
          index={6}
          title="Patient Progress"
          description="A patient-wise summary of key progress and risk indicators."
          headers={[
            { label: 'Patient', className: 'w-[40%]' },
            { label: 'Attention', className: 'w-[15%] text-center' },
            { label: 'Interaction', className: 'w-[15%] text-center' },
            { label: 'Goals', className: 'w-[15%] text-center' },
            { label: 'Progress', className: 'w-[15%] text-center' },
          ]}
          emptyLabel="No patients found."
        >
          {metricsPage.rows.length
            ? metricsPage.rows.map((row) => {
                const last = row.last_assessment_at ? new Date(row.last_assessment_at) : null;
                const daysSinceLast = last ? Math.floor((Date.now() - last.getTime()) / (1000 * 60 * 60 * 24)) : null;

                const attentionStatus = row.status ?? 'Unknown';

                let interactionStatus = 'Active';
                if (row.last_assessment_at === null) {
                  interactionStatus = 'No Check-ins';
                } else if (daysSinceLast !== null && daysSinceLast >= 14) {
                  interactionStatus = 'Inactive (14+ days)';
                }

                let goalStatus = 'No Active Goals';
                // @ts-expect-error
                if (row.overdue_goals > 0) {
                  goalStatus = 'Overdue';
                  // @ts-expect-error
                } else if (row.active_goals > 0) {
                  goalStatus = 'Active';
                }

                let progressStatus = 'N/A';
                // @ts-expect-error
                if (row.total_numeric_goals > 0) {
                  // @ts-expect-error
                  if (row.off_target_numeric_goals > 0) {
                    progressStatus = 'Off Track';
                  } else {
                    progressStatus = 'On Track';
                  }
                }

                return (
                  <TableRow key={row.patient_id} className="border-border/50">
                    <TableCell className="py-2 font-medium text-foreground">
                      <span className="truncate">{row.patient_name}</span>
                    </TableCell>
                    <TableCell
                      className={cn('py-2 text-center font-semibold', {
                        'text-red-500': attentionStatus === 'Critical',
                      })}
                    >
                      {attentionStatus}
                    </TableCell>
                    <TableCell
                      className={cn('py-2 text-center', {
                        'text-red-500': interactionStatus === 'No Check-ins',
                        'text-amber-500': interactionStatus === 'Inactive (14+ days)',
                      })}
                    >
                      {interactionStatus}
                    </TableCell>
                    <TableCell
                      className={cn('py-2 text-center', {
                        'text-red-500': goalStatus === 'Overdue',
                      })}
                    >
                      {goalStatus}
                    </TableCell>
                    <TableCell
                      className={cn('py-2 text-center font-semibold', {
                        'text-red-500': progressStatus === 'Off Track',
                        'text-emerald-500': progressStatus === 'On Track',
                      })}
                    >
                      {progressStatus}
                    </TableCell>
                  </TableRow>
                );
              })
            : null}
        </ReportTableSection>

        <div className="flex flex-wrap items-center justify-between gap-3 px-1">
          <div className="text-[11px] font-semibold text-muted-foreground">
            {metricsPage.total ? (
              <>
                {metricsPage.total} patients • Page <span className="text-foreground">{metricsPage.page}</span> of{' '}
                <span className="text-foreground">{totalPages}</span>
              </>
            ) : (
              '0 patients'
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" disabled={!canPrev}>
              <Link href={buildInsightsUrl({ selectedPartnerId, page: Math.max(1, metricsPage.page - 1) })}>
                Prev
              </Link>
            </Button>
            <Button asChild variant="outline" size="sm" disabled={!canNext}>
              <Link href={buildInsightsUrl({ selectedPartnerId, page: Math.min(totalPages, metricsPage.page + 1) })}>
                Next
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t border-border/70 pt-8">
        <div className="rounded-[24px] border border-border/70 bg-muted/25 p-5 dark:bg-muted/20">
          <p className="text-[11px] leading-6 text-muted-foreground">
            These insights are computed from the latest recorded activity for patients in this care program: goals,
            check-ins (assessments), and prescriptions. Use the “Attention”, “Interaction”, and “Progress” columns to
            prioritize patient outreach.
          </p>
        </div>
      </div>
    </div>
  );
}
