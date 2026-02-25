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
import { BarChart, Target } from 'lucide-react';
import { format } from 'date-fns';

const ParameterDonutChart = ({ assessments, parameter, goal }: { assessments: Assessment[], parameter: ClinicalParameter, goal?: Goal | null }) => {
    
    const data = useMemo(() => {
        if (!goal) {
            const normal = assessments.filter(a => a.is_normal === true).length;
            const abnormal = assessments.filter(a => a.is_normal === false).length;
            
            const result = [];
            if (normal > 0) result.push({ name: 'Normal', value: normal, fill: 'hsl(var(--chart-2))' });
            if (abnormal > 0) result.push({ name: 'Abnormal', value: abnormal, fill: 'hsl(var(--chart-5))' });
            return result;
        }

        if (goal.status === 'completed') {
            return [{ name: 'Completed', value: 1, fill: 'hsl(var(--chart-2))' }];
        }

        if (assessments.length === 0) {
            return [];
        }

        const checkTargetMet = (assessmentValue: string, goal: Goal) => {
            const current = parseFloat(assessmentValue);
            const target = parseFloat(goal.target_value);
            if (isNaN(current) || isNaN(target)) return false;

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
        if (onTrackCount > 0) result.push({ name: 'On Track', value: onTrackCount, fill: 'hsl(var(--chart-2))' });
        if (needsImprovementCount > 0) result.push({ name: 'Needs Improvement', value: needsImprovementCount, fill: 'hsl(var(--chart-5))' });
        
        return result;

    }, [assessments, goal]);

    const title = goal ? 'Goal Status' : 'Overall Status';
    const noDataMessage = goal ? 'No assessments for selected range.' : 'No data.';

    const chartConfig = {
        value: { label: 'Assessments', color: 'hsl(var(--primary))' }
    };

    if (data.length === 0) {
        return (
            <Card className="h-full flex flex-col border-primary/20">
                <CardHeader className="pb-2">
                    <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><Target className="h-4 w-4 text-primary"/>{title}</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex items-center justify-center">
                    <p className="text-xs text-muted-foreground">{noDataMessage}</p>
                </CardContent>
            </Card>
        );
    }
    
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

const ParameterLineChart = ({ assessments, parameter }: { assessments: Assessment[], parameter: ClinicalParameter }) => {
    const chartData = useMemo(() => {
        // Dynamic continuous trend: Group by day to keep the line smooth, but plot sequentially
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
    toDate
}: { 
    patient: Patient, 
    clinicalParameters: ClinicalParameter[],
    fromDate: Date,
    toDate: Date
}) {
    
    const filteredAssessedParameters = useMemo(() => {
        const numericParamIds = new Set(clinicalParameters.filter(p => p.type === 'numeric').map(p => p.id));
        const assessmentsByParam = new Map<number, Assessment[]>();
        
        patient.assessments.forEach(a => {
            const date = new Date(a.measured_at);
            const matchesFilter = date >= fromDate && date <= toDate;

            if (matchesFilter && numericParamIds.has(a.clinical_parameter_id)) {
                const current = assessmentsByParam.get(a.clinical_parameter_id) || [];
                assessmentsByParam.set(a.clinical_parameter_id, [...current, a]);
            }
        });

        return Array.from(assessmentsByParam.entries())
            .map(([id, assessments]) => ({
                parameter: clinicalParameters.find(p => p.id === id),
                assessments: assessments.sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime())
            }))
            .filter((item): item is { parameter: ClinicalParameter, assessments: Assessment[] } => !!item.parameter);
    }, [patient.assessments, clinicalParameters, fromDate, toDate]);


    return (
        <div className="space-y-8">
            {filteredAssessedParameters.length > 0 ? (
                filteredAssessedParameters.map(({ parameter, assessments }) => {
                    const goal = patient.goals.find(g => g.clinical_parameter_id === parameter.id);

                    return (
                        <div key={parameter.id} className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold tracking-tight text-foreground">{parameter.name}</h2>
                                {parameter.unit && <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">{parameter.unit}</span>}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                                <div className="md:col-span-4">
                                    <ParameterDonutChart assessments={assessments} parameter={parameter} goal={goal} />
                                </div>
                                <div className="md:col-span-8">
                                     <ParameterLineChart assessments={assessments} parameter={parameter} />
                                </div>
                            </div>
                        </div>
                    )
                })
            ) : (
                 <div className="text-center py-20 rounded-2xl bg-muted/30 border-2 border-dashed border-primary/20">
                    <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                        <BarChart className="h-6 w-6 text-primary/40" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground">No Data for Selected Range</h3>
                    <p className="text-muted-foreground mt-1 max-w-xs mx-auto">Try widening the date range or record new assessments to visualize progress.</p>
                </div>
            )}
        </div>
    )
}
