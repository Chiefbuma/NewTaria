'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, Building2, ClipboardCheck, Target, Activity } from 'lucide-react';

interface VisualSectionProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    chartData: any[];
    tableData: { label: string; value: number | string; color?: string; percentage?: string }[];
    total: number;
}

const VisualSection = ({ title, description, icon, chartData, tableData, total }: VisualSectionProps) => {
    if (total === 0) return null;

    return (
        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {icon}
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">{title}</h2>
                </div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-muted px-2 py-0.5 rounded">
                    Metrics Overview
                </span>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Left: Donut Chart */}
                <Card className="lg:col-span-5 border-primary/10 shadow-sm flex flex-col items-center justify-center p-6">
                    <div className="w-full aspect-square max-w-[220px] relative">
                         <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-black text-foreground">{total}</span>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total</span>
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
                                        {chartData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                </PieChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                </Card>

                {/* Right: Table */}
                <Card className="lg:col-span-7 border-primary/10 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">Category</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Figure</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">%</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {tableData.map((row, idx) => (
                                <TableRow key={idx} className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: row.color }} />
                                            {row.label}
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-black">{row.value}</TableCell>
                                    <TableCell className="text-right text-muted-foreground text-xs font-bold">
                                        {row.percentage || (total > 0 ? `${((Number(row.value) / total) * 100).toFixed(0)}%` : '0%')}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </Card>
            </div>
        </div>
    );
};

export default function AdminOverview({ stats }: { stats: any }) {
    if (!stats || stats.totalPatients === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-6 bg-muted/20 border-2 border-dashed rounded-3xl">
                <div className="p-4 rounded-full bg-background shadow-sm border">
                    <BarChart3 className="h-12 w-12 text-muted-foreground/40" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-foreground">No Data Available</h3>
                    <p className="text-muted-foreground max-w-xs mx-auto">
                        Stats will appear here once patients are registered and onboarded into the program.
                    </p>
                </div>
            </div>
        );
    }

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    // 1. GENDER DISTRIBUTION
    const genderChart = stats.genderDistribution.map((g: any, i: number) => ({
        name: g.gender,
        value: g.count,
        fill: COLORS[i % COLORS.length]
    }));
    const genderTable = stats.genderDistribution.map((g: any, i: number) => ({
        label: g.gender,
        value: g.count,
        color: COLORS[i % COLORS.length]
    }));

    // 2. GOAL COMPLETION
    const totalWithGoals = stats.totalCompleted + stats.totalInProgress + stats.totalCritical;
    const completionChart = [
        { name: 'Completed', value: stats.totalCompleted, fill: 'hsl(var(--chart-2))' },
        { name: 'Remaining', value: stats.totalInProgress + stats.totalCritical, fill: 'hsl(var(--muted))' }
    ];
    const completionTable = [
        { label: 'Achieved Targets', value: stats.totalCompleted, color: 'hsl(var(--chart-2))' },
        { label: 'In Progress / Overdue', value: stats.totalInProgress + stats.totalCritical, color: 'hsl(var(--muted))' }
    ];

    // 3. PATIENT PROGRESS STATUS
    const progressChart = [
        { name: 'Active', value: stats.totalOnboarded, fill: 'hsl(var(--chart-1))' },
        { name: 'In Progress', value: stats.totalInProgress, fill: 'hsl(var(--chart-3))' },
        { name: 'Critical', value: stats.totalCritical, fill: 'hsl(var(--destructive))' },
        { name: 'Inactive', value: stats.totalInactive, fill: 'hsl(var(--muted))' }
    ];
    const progressTable = [
        { label: 'Onboarded (Active)', value: stats.totalOnboarded, color: 'hsl(var(--chart-1))' },
        { label: 'In Progress', value: stats.totalInProgress, color: 'hsl(var(--chart-3))' },
        { label: 'Critical (Overdue)', value: stats.totalCritical, color: 'hsl(var(--destructive))' },
        { label: 'Inactive (Pending)', value: stats.totalInactive, color: 'hsl(var(--muted))' }
    ];

    // 4. DIAGNOSIS DISTRIBUTION
    const diagnosisChart = (stats.diagnosisDistribution || []).map((d: any, i: number) => ({
        name: d.diagnosis || 'Not Specified',
        value: d.count,
        fill: COLORS[(i + 2) % COLORS.length]
    }));
    const diagnosisTable = (stats.diagnosisDistribution || []).map((d: any, i: number) => ({
        label: d.diagnosis || 'Not Specified',
        value: d.count,
        color: COLORS[(i + 2) % COLORS.length]
    }));

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            {/* 1st Visual: System Summary */}
            <div className="space-y-4">
                <div className="flex items-center gap-3 border-b pb-2">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="text-xl font-bold tracking-tight text-foreground">System Summary</h2>
                </div>
                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <Table>
                        <TableHeader className="bg-muted/50">
                            <TableRow>
                                <TableHead className="font-bold text-[10px] uppercase tracking-wider">System Metric</TableHead>
                                <TableHead className="text-right font-bold text-[10px] uppercase tracking-wider">Total Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Users className="h-4 w-4 text-primary" />
                                    Total Registered Patients
                                </TableCell>
                                <TableCell className="text-right font-black text-lg">{stats.totalPatients}</TableCell>
                            </TableRow>
                            <TableRow className="border-b border-primary/5 hover:bg-primary/5 transition-colors">
                                <TableCell className="font-medium flex items-center gap-2">
                                    <Building2 className="h-4 w-4 text-primary" />
                                    Total Active Partners
                                </TableCell>
                                <TableCell className="text-right font-black text-lg">{stats.totalPartners}</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Card>
            </div>

            {/* 2nd Visual: Gender Distribution */}
            <VisualSection 
                title="Gender Distribution"
                description="Patient population breakdown by gender."
                icon={<Users className="h-5 w-5" />}
                chartData={genderChart}
                tableData={genderTable}
                total={stats.totalPatients}
            />

            {/* 3rd Visual: Goal Completion Rate */}
            <VisualSection 
                title="Goal Completion Rate"
                description="Percentage of patients achieving their clinical targets."
                icon={<Target className="h-5 w-5" />}
                chartData={completionChart}
                tableData={completionTable}
                total={totalWithGoals}
            />

            {/* 4th Visual: Patient Progress Status */}
            <VisualSection 
                title="Patient Progress Status"
                description="Granular breakdown of clinical engagement levels."
                icon={<ClipboardCheck className="h-5 w-5" />}
                chartData={progressChart}
                tableData={progressTable}
                total={stats.totalPatients}
            />

            {/* 5th Visual: Diagnosis Distribution */}
            <VisualSection 
                title="Diagnosis Distribution"
                description="Breakdown by primary clinical diagnosis."
                icon={<Activity className="h-5 w-5" />}
                chartData={diagnosisChart}
                tableData={diagnosisTable}
                total={stats.totalPatients}
            />
        </div>
    );
}