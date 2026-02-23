'use client';

import { useState, useMemo } from 'react';
import type { Patient, ClinicalParameter, Assessment, Review } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { FileText, Stethoscope } from 'lucide-react';

const calculateAssessmentWeek = (assessment: Assessment, patient: Patient) => {
    if (!patient?.date_of_onboarding) return null;
    const assessmentDate = new Date(assessment.measured_at);
    const treatmentStartDate = new Date(patient.date_of_onboarding);
    const timeDiff = assessmentDate.getTime() - treatmentStartDate.getTime();
    if (timeDiff < 0) return null;
    const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7)) + 1;
    return weeksDiff;
};

const LatestReviewCard = ({ review }: { review: Review | undefined }) => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Stethoscope className="h-5 w-5" />
                    Latest Clinical Assessment
                </CardTitle>
                {review ? (
                    <CardDescription>
                        From {new Date(review.review_date).toLocaleDateString()} by {review.reviewed_by}
                    </CardDescription>
                ) : (
                    <CardDescription>No reviews found.</CardDescription>
                )}
            </CardHeader>
            <CardContent>
                {review ? (
                    <div className="space-y-4 text-sm">
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Subjective</h4>
                            <p>{review.subjective_findings || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Objective</h4>
                            <p>{review.objective_findings || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Assessment</h4>
                            <p>{review.assessment || '-'}</p>
                        </div>
                        <div>
                            <h4 className="font-semibold text-muted-foreground">Plan</h4>
                            <p>{review.plan || '-'}</p>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No clinical assessment summary available.</p>
                )}
            </CardContent>
        </Card>
    )
}

const AssessmentSummaryDonut = ({ assessments }: { assessments: Assessment[] }) => {
    const data = useMemo(() => {
        const total = assessments.length;
        if (total === 0) return [];
        const normal = assessments.filter(a => a.is_normal === true).length;
        const abnormal = assessments.filter(a => a.is_normal === false).length;
        
        const result = [];
        if (normal > 0) result.push({ name: 'Normal', value: normal, fill: 'hsl(var(--chart-2))' });
        if (abnormal > 0) result.push({ name: 'Abnormal', value: abnormal, fill: 'hsl(var(--chart-5))' });
        
        return result;
    }, [assessments]);

    if (assessments.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Assessment Results</CardTitle>
                    <CardDescription>Summary of normal vs. abnormal results.</CardDescription>
                </CardHeader>
                <CardContent className="h-64 flex items-center justify-center">
                    <p className="text-muted-foreground">No assessments to summarize.</p>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle>Assessment Results</CardTitle>
                <CardDescription>Summary of normal vs. abnormal results.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={{}} className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                dataKey="value"
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Tooltip content={<ChartTooltipContent />} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}

export default function ProgressDashboard({ patient, clinicalParameters }: { patient: Patient, clinicalParameters: ClinicalParameter[] }) {
    const numericParameters = useMemo(() => clinicalParameters.filter(p => p.type === 'numeric'), [clinicalParameters]);
    const [selectedParamId, setSelectedParamId] = useState<string | undefined>(numericParameters[0]?.id.toString());
    
    const weeklyData = useMemo(() => {
        if (!selectedParamId) return [];

        const paramId = parseInt(selectedParamId, 10);
        const relevantAssessments = patient.assessments.filter(a => a.clinical_parameter_id === paramId);
        
        const weeklySummary: { [week: number]: { sum: number, count: number } } = {};

        relevantAssessments.forEach(assessment => {
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

    }, [selectedParamId, patient]);

    const latestReview = useMemo(() => {
        return [...patient.reviews].sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime())[0];
    }, [patient.reviews]);

    const selectedParam = clinicalParameters.find(p => p.id.toString() === selectedParamId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            <div className="lg:col-span-1 space-y-6">
                <LatestReviewCard review={latestReview} />
                <AssessmentSummaryDonut assessments={patient.assessments} />
            </div>

            <div className="lg:col-span-2">
                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                            <div>
                                <CardTitle>Weekly Parameter Tracking</CardTitle>
                                <CardDescription>View the weekly average for a selected health metric.</CardDescription>
                            </div>
                            <Select value={selectedParamId} onValueChange={setSelectedParamId}>
                                <SelectTrigger className="w-full sm:w-[250px]">
                                    <SelectValue placeholder="Select a parameter" />
                                </SelectTrigger>
                                <SelectContent>
                                    {numericParameters.map(p => (
                                        <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {weeklyData.length > 1 ? (
                            <ChartContainer config={{}} className="h-96">
                                <ResponsiveContainer>
                                    <LineChart data={weeklyData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="week" />
                                        <YAxis label={{ value: selectedParam?.unit || '', angle: -90, position: 'insideLeft' }} />
                                        <Tooltip content={<ChartTooltipContent />} />
                                        <Legend />
                                        <Line type="monotone" dataKey="value" name={selectedParam?.name} stroke="hsl(var(--chart-1))" strokeWidth={2} />
                                    </LineChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        ) : (
                            <div className="h-96 flex items-center justify-center">
                                <p className="text-muted-foreground">Not enough data to display a chart for this parameter.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
