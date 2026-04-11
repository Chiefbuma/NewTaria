'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Calendar,
  CalendarDays,
  ClipboardCheck,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

type BreakdownRow = {
  label: string;
  value: number | string;
  color?: string;
  percentage?: string;
};

interface VisualSectionProps {
  index: number;
  title: string;
  icon: React.ReactNode;
  chartData: any[];
  tableData: BreakdownRow[];
  total: number;
  note?: string;
}

const VisualSection = ({ index, title, icon, chartData, tableData, total, note }: VisualSectionProps) => {
  const hasData = total > 0;

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
      <CardHeader className="bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl border border-border/70 bg-background text-xs font-black text-foreground">
              {index}
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
              <div className="grid gap-0.5">
                <h2 className="text-base font-bold tracking-tight text-foreground">{title}</h2>
                {note ? <p className="text-xs text-muted-foreground">{note}</p> : null}
              </div>
            </div>
          </div>
          <span className="rounded border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Snapshot
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
          <Card className="flex flex-col items-center justify-center border-border/60 bg-background shadow-sm lg:col-span-5">
            <div className="w-full p-6">
              {hasData ? (
                <div className="relative mx-auto aspect-square w-full max-w-[240px]">
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">{total}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                  </div>
                  <ChartContainer config={{ value: { label: 'Count' } }} className="h-full w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius="70%"
                          outerRadius="100%"
                          paddingAngle={5}
                          stroke="none"
                        >
                          {chartData.map((entry: any, entryIndex: number) => (
                            <Cell key={`cell-${entryIndex}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </div>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-sm font-medium italic text-muted-foreground">No data available.</p>
                </div>
              )}
            </div>
          </Card>

          <Card className="overflow-hidden border-border/60 bg-background shadow-sm lg:col-span-7">
            <Table>
              <TableHeader className="bg-muted/30">
                <TableRow className="hover:bg-muted/30">
                  <TableHead className="h-8 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Category
                  </TableHead>
                  <TableHead className="h-8 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Count
                  </TableHead>
                  <TableHead className="h-8 text-right text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    %
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tableData.length ? (
                  tableData.map((row, rowIndex) => (
                    <TableRow key={rowIndex} className="border-b border-border/60 hover:bg-muted/30">
                      <TableCell className="py-2 text-xs font-medium">
                        <div className="flex items-center gap-2">
                          {row.color ? (
                            <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                          ) : null}
                          <span className="text-foreground">{row.label}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs font-bold text-foreground">{row.value}</TableCell>
                      <TableCell className="py-2 text-right text-xs font-bold text-muted-foreground">
                        {row.percentage ?? (total ? `${Math.round((Number(row.value) / total) * 100)}%` : '0%')}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="py-10 text-center text-sm italic text-muted-foreground">
                      No records found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </CardContent>
    </Card>
  );
};

export default function AdminOverview({ stats }: { stats: any }) {
  if (!stats || stats.totalPatients === 0) {
    return (
      <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
        <CardContent className="flex flex-col items-center justify-center gap-5 py-20 text-center">
          <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-sm">
            <BarChart3 className="h-10 w-10 text-muted-foreground/50" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-foreground">No Data Available</h3>
            <p className="mx-auto max-w-sm text-sm text-muted-foreground">
              Insights will appear once members are registered and activity is recorded.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const COLORS = [
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))',
    'hsl(var(--chart-4))',
    'hsl(var(--chart-5))',
  ];

  const statusCounts = (stats.statusDistribution || []).reduce((acc: Record<string, number>, row: any) => {
    acc[row.status] = Number(row.count);
    return acc;
  }, {});

  const activeMembers = statusCounts['Active'] ?? 0;
  const onboardedMembers = Number(stats.totalOnboarded ?? 0);
  const upcomingAppointments = Number(stats.upcomingAppointments ?? 0);
  const needsAttention = Number(stats.totalCritical ?? 0);
  const engaged30d = Number(stats.membersWithRecentCheckIn30d ?? 0);
  const noCheckIn14d = Number(stats.membersWithNoCheckIn14d ?? 0);

  const genderChart = (stats.genderDistribution || []).map((g: any, i: number) => ({
    name: g.gender,
    value: Number(g.count),
    fill: COLORS[i % COLORS.length],
  }));
  const genderTable: BreakdownRow[] = (stats.genderDistribution || []).map((g: any, i: number) => ({
    label: g.gender,
    value: Number(g.count),
    color: COLORS[i % COLORS.length],
    percentage: stats.totalPatients ? `${Math.round((Number(g.count) / stats.totalPatients) * 100)}%` : undefined,
  }));

  const ageChart = (stats.ageDistribution || []).map((a: any, i: number) => ({
    name: a.age_group,
    value: Number(a.count),
    fill: COLORS[(i + 1) % COLORS.length],
  }));
  const ageTable: BreakdownRow[] = (stats.ageDistribution || []).map((a: any, i: number) => ({
    label: a.age_group,
    value: Number(a.count),
    color: COLORS[(i + 1) % COLORS.length],
    percentage: stats.totalPatients ? `${Math.round((Number(a.count) / stats.totalPatients) * 100)}%` : undefined,
  }));

  const diagnosisChart = (stats.diagnosisDistribution || []).map((d: any, i: number) => ({
    name: d.diagnosis,
    value: Number(d.count),
    fill: COLORS[(i + 2) % COLORS.length],
  }));
  const diagnosisTable: BreakdownRow[] = (stats.diagnosisDistribution || []).map((d: any, i: number) => ({
    label: d.diagnosis,
    value: Number(d.count),
    color: COLORS[(i + 2) % COLORS.length],
    percentage: stats.totalPatients ? `${Math.round((Number(d.count) / stats.totalPatients) * 100)}%` : undefined,
  }));

  const totalGoalsSet = Number(stats.totalCompleted ?? 0) + Number(stats.totalInProgress ?? 0) + Number(stats.totalCritical ?? 0);
  const completionChart = [
    { name: 'Achieved', value: Number(stats.totalCompleted ?? 0), fill: 'hsl(var(--chart-2))' },
    { name: 'Remaining', value: Number(stats.totalInProgress ?? 0) + Number(stats.totalCritical ?? 0), fill: 'hsl(var(--muted))' },
  ];
  const completionTable: BreakdownRow[] = [
    {
      label: 'Targets Achieved',
      value: Number(stats.totalCompleted ?? 0),
      color: 'hsl(var(--chart-2))',
      percentage: totalGoalsSet ? `${Math.round((Number(stats.totalCompleted ?? 0) / totalGoalsSet) * 100)}%` : undefined,
    },
    {
      label: 'Pending / Overdue',
      value: Number(stats.totalInProgress ?? 0) + Number(stats.totalCritical ?? 0),
      color: 'hsl(var(--muted))',
      percentage: totalGoalsSet
        ? `${Math.round(((Number(stats.totalInProgress ?? 0) + Number(stats.totalCritical ?? 0)) / totalGoalsSet) * 100)}%`
        : undefined,
    },
  ];

  const statusChart = (stats.statusDistribution || []).map((row: any, i: number) => ({
    name: row.status,
    value: Number(row.count),
    fill: COLORS[i % COLORS.length],
  }));
  const statusTable: BreakdownRow[] = (stats.statusDistribution || []).map((row: any, i: number) => ({
    label: row.status,
    value: Number(row.count),
    color: COLORS[i % COLORS.length],
    percentage: stats.totalPatients ? `${Math.round((Number(row.count) / stats.totalPatients) * 100)}%` : undefined,
  }));

  return (
    <div className="space-y-8 pb-12">
      <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-base font-bold tracking-tight text-foreground">Priority Metrics</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <PriorityMetric index={1} icon={Users} label="Onboarded" value={onboardedMembers} sub="All non-pending" />
            <PriorityMetric index={2} icon={TrendingUp} label="Active" value={activeMembers} sub="In care" />
            <PriorityMetric index={3} icon={ShieldAlert} label="Needs attention" value={needsAttention} sub="Overdue goals" tone="danger" />
            <PriorityMetric index={4} icon={CalendarDays} label="Upcoming" value={upcomingAppointments} sub="Appointments" />
            <PriorityMetric index={5} icon={BarChart3} label="Engagement" value={engaged30d} sub="Checked-in (30d)" />
          </div>
          <div className="mt-3 text-xs font-semibold text-muted-foreground">
            <span className="text-foreground">{noCheckIn14d}</span> members have no check-in in the last 14 days.
          </div>
        </CardContent>
      </Card>

      <div className="space-y-6">
        <VisualSection
          index={6}
          title="Goal Completion"
          note="Achieved vs pending across assigned goals."
          icon={<Target className="h-5 w-5" />}
          chartData={completionChart}
          tableData={completionTable}
          total={totalGoalsSet}
        />

        <VisualSection
          index={7}
          title="Member Status"
          note="Distribution across program states."
          icon={<ClipboardCheck className="h-5 w-5" />}
          chartData={statusChart}
          tableData={statusTable}
          total={Number(stats.totalPatients)}
        />

        <VisualSection
          index={8}
          title="Diagnosis Mix"
          note="Hypertension, diabetes, or both."
          icon={<Activity className="h-5 w-5" />}
          chartData={diagnosisChart}
          tableData={diagnosisTable}
          total={Number(stats.totalPatients)}
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <VisualSection
            index={9}
            title="Age Distribution"
            icon={<Calendar className="h-5 w-5" />}
            chartData={ageChart}
            tableData={ageTable}
            total={Number(stats.totalPatients)}
          />
          <VisualSection
            index={10}
            title="Gender Distribution"
            icon={<Users className="h-5 w-5" />}
            chartData={genderChart}
            tableData={genderTable}
            total={Number(stats.totalPatients)}
          />
        </div>
      </div>
    </div>
  );
}

function PriorityMetric({
  index,
  icon: Icon,
  label,
  value,
  sub,
  tone,
}: {
  index: number;
  icon: any;
  label: string;
  value: number | string;
  sub?: string;
  tone?: 'danger';
}) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-border/70 bg-background p-4 shadow-sm',
        tone === 'danger' ? 'border-red-500/25 bg-red-500/5' : null
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl border border-border/70 bg-muted/20 text-[11px] font-black text-foreground">
            {index}
          </div>
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</div>
        </div>
        <Icon className={cn('h-4 w-4', tone === 'danger' ? 'text-red-600' : 'text-primary')} />
      </div>
      <div className="mt-3 text-2xl font-black text-foreground">{value}</div>
      {sub ? <div className="mt-1 text-xs text-muted-foreground">{sub}</div> : null}
    </div>
  );
}

