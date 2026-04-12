'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import type { RegistryInsights } from '@/lib/types';
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
  male: number | string;
  female: number | string;
  color?: string;
  percentage?: string;
};

interface VisualSectionProps {
  title: string;
  icon: React.ReactNode;
  chartData: any[];
  tableData: BreakdownRow[];
  total: number;
  note?: string;
}

const VisualSection = ({ title, icon, chartData, tableData, total, note }: VisualSectionProps) => {
  const hasData = total > 0;

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
              <div className="grid gap-0.5">
                <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
                {note ? <p className="text-sm text-muted-foreground">{note}</p> : null}
              </div>
            </div>
          </div>
          <span className="rounded border border-border/60 bg-background/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Snapshot
          </span>
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        <div className="space-y-4">
          <Card className="flex flex-col items-center justify-center border-border/60 bg-background shadow-sm">
            <div className="w-full p-6">
              {hasData ? (
                <div className="relative mx-auto aspect-square w-full max-w-[240px]">
                  <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-foreground">{total}</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Total</span>
                  </div>
                  <ChartContainer config={{ value: { label: 'Total' } }} className="h-full w-full">
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

          <Card className="overflow-hidden border-border/60 bg-background shadow-sm">
            <Table className="w-full min-w-0 table-fixed">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[52%] whitespace-nowrap">Category</TableHead>
                      <TableHead className="w-[76px] whitespace-nowrap text-right">Total</TableHead>
                      <TableHead className="w-[56px] whitespace-nowrap text-right">M</TableHead>
                      <TableHead className="w-[56px] whitespace-nowrap text-right">F</TableHead>
                      <TableHead className="w-[56px] whitespace-nowrap text-right">%</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tableData.length ? (
                      tableData.map((row, rowIndex) => (
                        <TableRow key={rowIndex}>
                          <TableCell className="py-2 font-medium">
                            <div className="flex items-center gap-2">
                              {row.color ? (
                                <div className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                              ) : null}
                              <span className="truncate text-foreground">{row.label}</span>
                            </div>
                          </TableCell>
                          <TableCell className="py-2 text-right font-bold text-foreground">{row.value}</TableCell>
                          <TableCell className="py-2 text-right font-bold text-foreground">{row.male}</TableCell>
                          <TableCell className="py-2 text-right font-bold text-foreground">{row.female}</TableCell>
                          <TableCell className="py-2 text-right font-bold text-muted-foreground">
                            {row.percentage ?? (total ? `${Math.round((Number(row.value) / total) * 100)}%` : '0%')}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="py-10 text-center text-sm italic text-muted-foreground">
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

function TightListTable({
  title,
  icon,
  headers,
  rows,
  emptyLabel,
}: {
  title: string;
  icon: React.ReactNode;
  headers: string[];
  rows: React.ReactNode;
  emptyLabel: string;
}) {
  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-primary/10 p-2 text-primary">{icon}</div>
          <div className="grid gap-0.5">
            <h2 className="text-lg font-bold tracking-tight text-foreground">{title}</h2>
            <p className="text-sm text-muted-foreground">Focused list for follow-up.</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <Table className="w-full min-w-0 table-fixed">
          <TableHeader>
            <TableRow>
              {headers.map((h) => (
                <TableHead key={h} className="whitespace-nowrap">
                  {h}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows || (
              <TableRow>
                <TableCell colSpan={headers.length} className="py-10 text-center text-sm italic text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default function AdminOverview({ stats, insights }: { stats: any; insights?: RegistryInsights | null }) {
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

  const genderChart = (stats.genderDistribution || []).map((g: any, i: number) => ({
    name: g.gender,
    value: Number(g.count),
    fill: COLORS[i % COLORS.length],
  }));
  const genderTable: BreakdownRow[] = (stats.genderDistribution || []).map((g: any, i: number) => ({
    label: g.gender,
    value: Number(g.count),
    male: g.gender === 'Male' ? Number(g.count) : 0,
    female: g.gender === 'Female' ? Number(g.count) : 0,
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
    male: a.male_count, // Assuming the backend sends this
    female: a.female_count, // Assuming the backend sends this
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
    male: d.male_count, // Assuming the backend sends this
    female: d.female_count, // Assuming the backend sends this
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
      male: stats.completed_male_count, // Assuming the backend sends this
      female: stats.completed_female_count, // Assuming the backend sends this
      color: 'hsl(var(--chart-2))',
      percentage: totalGoalsSet ? `${Math.round((Number(stats.totalCompleted ?? 0) / totalGoalsSet) * 100)}%` : undefined,
    },
    {
      label: 'Pending / Overdue',
      value: Number(stats.totalInProgress ?? 0) + Number(stats.totalCritical ?? 0),
      male: stats.pending_male_count, // Assuming the backend sends this
      female: stats.pending_female_count, // Assuming the backend sends this
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
    male: row.male_count, // Assuming the backend sends this
    female: row.female_count, // Assuming the backend sends this
    color: COLORS[i % COLORS.length],
    percentage: stats.totalPatients ? `${Math.round((Number(row.count) / stats.totalPatients) * 100)}%` : undefined,
  }));

  return (
    <div className="space-y-8 pb-12">
      <div className="space-y-6">
        <VisualSection
          title="Goal Completion"
          note="Achieved vs pending across assigned goals."
          icon={<Target className="h-5 w-5" />}
          chartData={completionChart}
          tableData={completionTable}
          total={totalGoalsSet}
        />

        <VisualSection
          title="Member Status"
          note="Distribution across program states."
          icon={<ClipboardCheck className="h-5 w-5" />}
          chartData={statusChart}
          tableData={statusTable}
          total={Number(stats.totalPatients)}
        />

        <VisualSection
          title="Diagnosis Mix"
          note="Hypertension, diabetes, or both."
          icon={<Activity className="h-5 w-5" />}
          chartData={diagnosisChart}
          tableData={diagnosisTable}
          total={Number(stats.totalPatients)}
        />

        <VisualSection
          title="Age Distribution"
          icon={<Calendar className="h-5 w-5" />}
          chartData={ageChart}
          tableData={ageTable}
          total={Number(stats.totalPatients)}
        />

        <VisualSection
          title="Gender Distribution"
          icon={<Users className="h-5 w-5" />}
          chartData={genderChart}
          tableData={genderTable}
          total={Number(stats.totalPatients)}
        />
      </div>

      {insights ? (
        <div className="space-y-6">
          <TightListTable
            title="Needs Attention"
            icon={<ShieldAlert className="h-5 w-5" />}
            headers={["Member", "Reason", "Overdue", "Last check-in"]}
            emptyLabel="No members need attention right now."
            rows={
              insights.needsAttention.length ? (
                <>
                  {insights.needsAttention.map((row) => {
                    const reason =
                      row.status === "Critical"
                        ? "Critical"
                        : row.overdue_goals > 0
                          ? "Overdue goals"
                          : row.last_assessment_at
                            ? "No check-in (14d)"
                            : "No check-ins";
                    return (
                      <TableRow key={row.patient_id}>
                        <TableCell className="py-2 font-medium">
                          <span className="truncate text-foreground">{row.patient_name}</span>
                        </TableCell>
                        <TableCell className="py-2 text-xs text-muted-foreground">{reason}</TableCell>
                        <TableCell className="py-2 text-right font-semibold text-foreground">{row.overdue_goals}</TableCell>
                        <TableCell className="py-2 text-right text-xs text-muted-foreground">
                          {row.last_assessment_at ? new Date(row.last_assessment_at).toLocaleDateString() : "Never"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </>
              ) : null
            }
          />

          <TightListTable
            title="Least Interaction"
            icon={<TrendingUp className="h-5 w-5" />}
            headers={["Member", "Goals", "30d", "Last"]}
            emptyLabel="No low-interaction members right now."
            rows={
              insights.leastInteraction.length ? (
                <>
                  {insights.leastInteraction.map((row) => (
                    <TableRow key={row.patient_id}>
                      <TableCell className="py-2 font-medium">
                        <span className="truncate text-foreground">{row.patient_name}</span>
                      </TableCell>
                      <TableCell className="py-2 text-right font-semibold text-foreground">{row.active_goals}</TableCell>
                      <TableCell className="py-2 text-right font-semibold text-foreground">{row.assessments_30d}</TableCell>
                      <TableCell className="py-2 text-right text-xs text-muted-foreground">
                        {row.last_assessment_at ? new Date(row.last_assessment_at).toLocaleDateString() : "Never"}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : null
            }
          />

          <TightListTable
            title="Upcoming Appointments"
            icon={<CalendarDays className="h-5 w-5" />}
            headers={["Member", "When", "Status"]}
            emptyLabel="No upcoming appointments."
            rows={
              insights.upcomingAppointments.length ? (
                <>
                  {insights.upcomingAppointments.map((row) => (
                    <TableRow key={`${row.patient_id}:${row.appointment_date}`}>
                      <TableCell className="py-2 font-medium">
                        <span className="truncate text-foreground">{row.patient_name}</span>
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs text-muted-foreground">
                        {new Date(row.appointment_date).toLocaleString()}
                      </TableCell>
                      <TableCell className="py-2 text-right text-xs font-semibold text-muted-foreground">
                        {String(row.status).replace("_", " ")}
                      </TableCell>
                    </TableRow>
                  ))}
                </>
              ) : null
            }
          />
        </div>
      ) : null}
    </div>
  );
}
