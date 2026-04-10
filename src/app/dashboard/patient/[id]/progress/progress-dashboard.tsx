
'use client';

import { useMemo } from 'react';
import type { Patient, ClinicalParameter, Assessment, Goal } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Target, FileText } from 'lucide-react';
import { format } from 'date-fns';

const ParameterDonutChart = ({ assessments, parameter, goal }: { assessments: Assessment[], parameter: ClinicalParameter, goal?: Goal | null }) => {
    
    const data = useMemo(() => {
        if (parameter.type === 'choice') {
            // Calculate distribution of choices
            const distribution: Record<string, number> = {};
            assessments.forEach(a => {
                distribution[a.value] = (distribution[a.value] || 0) + 1;
            });
            
            const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
            
            return Object.entries(distribution).map(([name, value], idx) => ({
                name,
                value,
                fill: COLORS[idx % COLORS.length]
            }));
        }

        if (!goal) {
            const normal = assessments.filter(a => a.is_normal === true).length;
            const abnormal = assessments.filter(a => a.is_normal === false).length;
            
            const result = [];
            if (normal > 0) result.push({ name: 'Normal', value: normal, fill: 'hsl(var(--chart-2))' });
            if (abnormal > 0) result.push({ name: 'Abnormal', value: abnormal, fill: 'hsl(var(--chart-5))' });
            return result;
        }

        const checkTargetMet = (assessmentValue: string, goal: Goal) => {
            const current = parseFloat(assessmentValue);
            const target = parseFloat(goal.target_value);
            if (isNaN(current) || isNaN(target)) return assessmentValue === goal.target_value;

            switch (goal.target_operator) {
                case '<': return current < target;
                case '<=': return current <= target;
                case '=': return current === target;
                case '>=': return current >= target;
                case '>': return current > target;
                default: return false;
            }
        };

        const onTrackCount = assessments.filter(a => checkTargetMet(a.value, goal)).length;
        const needsImprovementCount = assessments.length - onTrackCount;
        
        const result = [];
        if (onTrackCount > 0) result.push({ name: 'Achieved/On Track', value: onTrackCount, fill: 'hsl(var(--chart-2))' });
        if (needsImprovementCount > 0) result.push({ name: 'Off Track', value: needsImprovementCount, fill: 'hsl(var(--chart-5))' });
        
        return result;

    }, [assessments, goal, parameter]);

    const title = parameter.type === 'choice' ? 'Distribution' : (goal ? 'Goal Achievement' : 'Status Overview');
    const chartConfig = {
        value: { label: 'Assessments', color: 'hsl(var(--primary))' }
    };

    if (data.length === 0) return null;
    
    return (
        <Card className="h-full flex flex-col border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><Target className="h-4 w-4 text-primary"/>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
                <div className="w-full aspect-square max-h-[180px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="90%"
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<ChartTooltipContent hideLabel />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="mt-4 space-y-1 w-full">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                                <span className="text-muted-foreground font-medium">{entry.name}</span>
                            </div>
                            <span className="font-bold text-foreground">
                                {((entry.value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

const ParameterTextTable = ({ assessments }: { assessments: Assessment[] }) => {
    const latestAssessments = assessments
        .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
        .slice(0, 4);

    return (
        <Card className="h-full border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><FileText className="h-4 w-4 text-primary"/>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
                {latestAssessments.length > 0 ? (
                    <div className="space-y-3">
                        {latestAssessments.map((a) => (
                            <div key={a.id} className="p-3 bg-muted/50 rounded-lg border border-primary/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {format(new Date(a.measured_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                <p className="text-sm text-foreground leading-relaxed">{a.value}</p>
                                {a.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">"{a.notes}"</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <p className="text-xs text-muted-foreground">No entries in the selected date range.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ParameterLineChart = ({ assessments, parameter }: { assessments: Assessment[], parameter: ClinicalParameter }) => {
    const chartData = useMemo(() => {
        const dailySummary: { [date: string]: { sum: number, count: number } } = {};

        assessments.forEach(assessment => {
            const dateKey = format(new Date(assessment.measured_at), 'yyyy-MM-dd');
            const value = parseFloat(assessment.value);
            
            if (!isNaN(value)) {
                if (!dailySummary[dateKey]) {
                    dailySummary[dateKey] = { sum: 0, count: 0 };
                }
                dailySummary[dateKey].sum += value;
                dailySummary[dateKey].count += 1;
            }
        });
        
        return Object.entries(dailySummary)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
                date: format(new Date(date), 'MMM dd'),
                fullDate: format(new Date(date), 'MMMM dd, yyyy'),
                value: parseFloat((data.sum / data.count).toFixed(2)),
            }));

    }, [assessments]);

    const chartConfig = {
        value: { label: parameter.name, color: 'hsl(var(--primary))' }
    };

    return (
        <Card className="h-full flex flex-col border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><BarChart className="h-4 w-4 text-primary"/>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                {chartData.length > 0 ? (
                    <div className="h-full min-h-[200px]">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--muted-foreground), 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                                    />
                                    <Tooltip content={<ChartTooltipContent labelKey="fullDate" />} />
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        name={parameter.name} 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={3} 
                                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center min-h-[200px]">
                        <p className="text-xs text-muted-foreground">Insufficient data for trend analysis.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function ProgressDashboard({ 
    patient, 
    clinicalParameters,
    fromDate,
    toDate,
    patientView = false,
}: { 
    patient: Patient, 
    clinicalParameters: ClinicalParameter[],
    fromDate: Date,
    toDate: Date,
    patientView?: boolean,
}) {
    
    const trackedParameters = useMemo(() => {
        const latestGoalByParameter = new Map<number, Goal>();

        patient.goals
            .filter((goal) => goal.deleted_at === null || goal.deleted_at === undefined)
            .forEach((goal) => {
                if (!latestGoalByParameter.has(goal.clinical_parameter_id)) {
                    latestGoalByParameter.set(goal.clinical_parameter_id, goal);
                }
            });

        return Array.from(latestGoalByParameter.entries())
            .map(([parameterId, goal]) => {
                const parameter = clinicalParameters.find((item) => item.id === parameterId);
                if (!parameter) return null;

                const assessments = patient.assessments
                    .filter((assessment) => {
                        const measuredAt = new Date(assessment.measured_at);
                        return (
                            assessment.clinical_parameter_id === parameterId &&
                            measuredAt >= fromDate &&
                            measuredAt <= toDate
                        );
                    })
                    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

                return { parameter, goal, assessments };
            })
            .filter((item): item is { parameter: ClinicalParameter; goal: Goal; assessments: Assessment[] } => !!item);
    }, [patient.goals, patient.assessments, clinicalParameters, fromDate, toDate]);


    return (
        <div className={patientView ? "space-y-6" : "space-y-10"}>
            {trackedParameters.length > 0 ? (
                trackedParameters.map(({ parameter, assessments, goal }) => {
                    return (
                        <Card key={parameter.id} className="overflow-hidden border-primary/10 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.22)]">
                            <CardHeader className="bg-muted/30">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold tracking-tight text-foreground">{parameter.name}</h2>
                                        {parameter.unit && (
                                            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                                {parameter.unit}
                                            </span>
                                        )}
                                    </div>
                                    <span className="rounded bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                        {parameter.type}
                                    </span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {goal ? `Target: ${goal.target_operator} ${goal.target_value}` : 'Recent activity and progress summary'}
                                </p>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                    {parameter.type === 'numeric' ? (
                                        <>
                                            <div className="lg:col-span-4">
                                                <ParameterDonutChart assessments={assessments} parameter={parameter} goal={goal} />
                                            </div>
                                            <div className="lg:col-span-8">
                                                <ParameterLineChart assessments={assessments} parameter={parameter} />
                                            </div>
                                        </>
                                    ) : parameter.type === 'choice' ? (
                                        <>
                                            <div className="lg:col-span-4">
                                                <ParameterDonutChart assessments={assessments} parameter={parameter} goal={goal} />
                                            </div>
                                            <div className="lg:col-span-8">
                                                <ParameterTextTable assessments={assessments} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="lg:col-span-12">
                                            <ParameterTextTable assessments={assessments} />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                 <div className="text-center py-24 rounded-2xl bg-muted/20 border-2 border-dashed border-primary/10">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                        <BarChart className="h-8 w-8 text-primary/30" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Tracked Goals</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        This patient does not have any assigned goals yet, so there are no parameters to track on the progress dashboard.
                    </p>
                </div>
            )}
        </div>
    )
}
