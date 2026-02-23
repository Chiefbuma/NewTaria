'use client';

import { useMemo } from 'react';
import type { Patient, ClinicalParameter, Assessment, Goal } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Legend,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Target } from 'lucide-react';


const calculateAssessmentWeek = (assessment: Assessment, patient: Patient) => {
    if (!patient?.date_of_onboarding) return null;
    const assessmentDate = new Date(assessment.measured_at);
    const treatmentStartDate = new Date(patient.date_of_onboarding);
    const timeDiff = assessmentDate.getTime() - treatmentStartDate.getTime();
    if (timeDiff < 0) return null;
    const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7)) + 1;
    return weeksDiff;
};

const ParameterDonutChart = ({ assessments, parameter, goal }: { assessments: Assessment[], parameter: ClinicalParameter, goal?: Goal | null }) => {
    
    const data = useMemo(() => {
        if (!goal) {
            const total = assessments.length;
            if (total === 0) return [];
            const normal = assessments.filter(a => a.is_normal === true).length;
            const abnormal = assessments.filter(a => a.is_normal === false).length;
            
            const result = [];
            if (normal > 0) result.push({ name: 'Normal', value: normal, fill: 'hsl(var(--chart-2))' });
            if (abnormal > 0) result.push({ name: 'Abnormal', value: abnormal, fill: 'hsl(var(--chart-5))' });
            return result;
        }

        if (goal.status === 'completed') {
            return [{ name: 'Completed', value: 100, fill: 'hsl(var(--chart-2))' }];
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

    const title = goal ? 'Goal Status' : 'Results Summary';
    const noDataMessage = goal ? 'No assessments for this goal yet.' : 'No data to summarize.';

    if (data.length === 0) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/>{title}</CardTitle>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">{noDataMessage}</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Target className="h-5 w-5"/>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 items-center justify-center pb-0">
                <ChartContainer
                    config={{}}
                    className="mx-auto aspect-square w-full max-w-[250px]"
                >
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                             <Tooltip
                                content={<ChartTooltipContent hideLabel />}
                                />
                            <Pie
                                data={data}
                                dataKey="value"
                                nameKey="name"
                                cx="50%"
                                cy="50%"
                                innerRadius="60%"
                                strokeWidth={5}
                                label={({
                                  payload,
                                  ...props
                                }) => {
                                  return (
                                    <text
                                      cx={props.cx}
                                      cy={props.cy}
                                      x={props.x}
                                      y={props.y}
                                      textAnchor={props.textAnchor}
                                      dominantBaseline={props.dominantBaseline}
                                      fill="hsla(var(--foreground))"
                                      className="text-sm font-semibold"
                                    >
                                      {`${(payload.percent * 100).toFixed(0)}%`}
                                    </text>
                                  )
                                }}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                content={({ payload }) => {
                                if (!payload) {
                                    return null
                                }
                                return (
                                    <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-muted-foreground mt-4">
                                    {payload.map((entry) => (
                                        <li key={entry.value} className="flex items-center gap-2">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{
                                            backgroundColor: entry.color,
                                            }}
                                        />
                                        <span>{entry.value}</span>
                                        </li>
                                    ))}
                                    </ul>
                                )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

const ParameterLineChart = ({ assessments, patient, parameter }: { assessments: Assessment[], patient: Patient, parameter: ClinicalParameter }) => {
    const weeklyData = useMemo(() => {
        const weeklySummary: { [week: number]: { sum: number, count: number } } = {};

        assessments.forEach(assessment => {
            const week = calculateAssessmentWeek(assessment, patient);
            if (week !== null) {
                const value = parseFloat(assessment.value);
                if (!isNaN(value)) {
                    if (!weeklySummary[week]) {
                        weeklySummary[week] = { sum: 0, count: 0 };
                    }
                    weeklySummary[week].sum += value;
                    weeklySummary[week].count += 1;
                }
            }
        });
        
        return Object.entries(weeklySummary)
            .map(([week, { sum, count }]) => ({
                week: `Week ${week}`,
                value: sum / count,
            }))
            .sort((a, b) => parseInt(a.week.split(' ')[1]) - parseInt(b.week.split(' ')[1]));

    }, [assessments, patient]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><BarChart className="h-5 w-5"/>Weekly Trend</CardTitle>
                <CardDescription>Average weekly measurements for this parameter.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
                {weeklyData.length > 1 ? (
                    <ChartContainer config={{}} className="h-full min-h-[250px]">
                        <ResponsiveContainer>
                            <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="week" />
                                <YAxis label={{ value: parameter.unit || '', angle: -90, position: 'insideLeft' }} />
                                <Tooltip content={<ChartTooltipContent />} />
                                <Legend />
                                <Line type="monotone" dataKey="value" name={parameter.name} stroke="hsl(var(--chart-1))" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                ) : (
                    <div className="h-full flex items-center justify-center min-h-[250px]">
                        <p className="text-muted-foreground">Not enough data to display a chart.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default function ProgressDashboard({ patient, clinicalParameters }: { patient: Patient, clinicalParameters: ClinicalParameter[] }) {
    
    const assessedParameterIds = useMemo(() => {
        const numericParamIds = new Set(clinicalParameters.filter(p => p.type === 'numeric').map(p => p.id));
        const ids = new Set(patient.assessments.filter(a => numericParamIds.has(a.clinical_parameter_id)).map(a => a.clinical_parameter_id));
        return Array.from(ids);
    }, [patient.assessments, clinicalParameters]);

    const assessedParameters = useMemo(() => {
        return clinicalParameters.filter(p => assessedParameterIds.includes(p.id));
    }, [clinicalParameters, assessedParameterIds]);


    return (
        <div className="space-y-12">
            {assessedParameters.length > 0 ? (
                assessedParameters.map(parameter => {
                    const parameterAssessments = patient.assessments.filter(
                        a => a.clinical_parameter_id === parameter.id
                    );
                    
                    const goal = patient.goals.find(g => g.clinical_parameter_id === parameter.id);

                    return (
                        <div key={parameter.id} className="space-y-4 p-6 border rounded-2xl bg-muted/30">
                            <h2 className="text-2xl font-bold tracking-tight text-foreground">{parameter.name}</h2>
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                                <div className="lg:col-span-1">
                                    <ParameterDonutChart assessments={parameterAssessments} parameter={parameter} goal={goal} />
                                </div>
                                <div className="lg:col-span-2">
                                     <ParameterLineChart assessments={parameterAssessments} patient={patient} parameter={parameter} />
                                </div>
                            </div>
                        </div>
                    )
                })
            ) : (
                 <div className="text-center py-20 rounded-2xl bg-muted/50">
                    <h3 className="text-xl font-semibold text-muted-foreground">No Progress to Show</h3>
                    <p className="text-muted-foreground mt-2">There is no assessment data available for this patient yet.</p>
                </div>
            )}
        </div>
    )
}
