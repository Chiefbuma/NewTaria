'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, Users, Building2, ClipboardCheck, Target, CheckCircle2 } from 'lucide-react';

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

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))'];

    const genderData = useMemo(() => {
        if (!stats.genderDistribution || stats.genderDistribution.length === 0) return [];
        return stats.genderDistribution.map((g: any, idx: number) => ({
            name: g.gender,
            value: Number(g.count),
            fill: COLORS[idx % COLORS.length]
        }));
    }, [stats.genderDistribution]);

    const completionRate = useMemo(() => {
        const totalWithGoals = (stats.totalCompleted || 0) + (stats.totalInProgress || 0) + (stats.totalCritical || 0);
        if (totalWithGoals === 0) return 0;
        return Math.round((stats.totalCompleted / totalWithGoals) * 100);
    }, [stats]);

    const completionData = [
        { name: 'Completed', value: stats.totalCompleted || 0, fill: 'hsl(var(--chart-2))' },
        { name: 'Remaining', value: (stats.totalInProgress || 0) + (stats.totalCritical || 0), fill: 'hsl(var(--muted))' }
    ];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* System Totals Table */}
                <Card className="border-primary/10 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-primary" />
                            System Summary
                        </CardTitle>
                        <CardDescription>Core metrics for the entire program.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">Metric</TableHead>
                                    <TableHead className="text-right font-bold">Total</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Total Patients Registered</TableCell>
                                    <TableCell className="text-right font-black text-lg">{stats.totalPatients}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Total Active Partners</TableCell>
                                    <TableCell className="text-right font-black text-lg">{stats.totalPartners}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Patient Progress Table */}
                <Card className="border-primary/10 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ClipboardCheck className="h-5 w-5 text-primary" />
                            Patient Progress Status
                        </CardTitle>
                        <CardDescription>Breakdown of clinical engagement levels.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="font-bold">Status</TableHead>
                                    <TableHead className="text-right font-bold">Count</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell className="font-medium">Total Onboarded (Active)</TableCell>
                                    <TableCell className="text-right font-black">{stats.totalOnboarded}</TableCell>
                                </TableRow>
                                <TableRow className="bg-green-50/50">
                                    <TableCell className="font-medium text-green-700">Total Completed (Targets Achieved)</TableCell>
                                    <TableCell className="text-right font-black text-green-700">{stats.totalCompleted}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Total In Progress</TableCell>
                                    <TableCell className="text-right font-black">{stats.totalInProgress}</TableCell>
                                </TableRow>
                                <TableRow className="bg-red-50/50">
                                    <TableCell className="font-medium text-red-700">Total Critical (Targets Overdue)</TableCell>
                                    <TableCell className="text-right font-black text-red-700">{stats.totalCritical}</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell className="font-medium">Total Inactive (Not Boarded)</TableCell>
                                    <TableCell className="text-right font-black">{stats.totalInactive}</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Completion Rate Donut */}
                <Card className="border-primary/10 shadow-lg overflow-hidden">
                    <CardHeader className="bg-muted/30 border-b">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Target className="h-5 w-5 text-primary" />
                            Goal Completion Rate
                        </CardTitle>
                        <CardDescription>Percentage of patients who have met their targets.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex flex-col items-center">
                        <div className="w-full aspect-square max-w-[240px] relative">
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-4xl font-black text-foreground">{completionRate}%</span>
                                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Achieved</span>
                            </div>
                            <ChartContainer config={{ value: { label: 'Patients' } }} className="h-full w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={completionData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            innerRadius="75%"
                                            outerRadius="100%"
                                            paddingAngle={0}
                                            stroke="none"
                                        >
                                            {completionData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </ChartContainer>
                        </div>
                        <div className="mt-6 flex items-center gap-4 text-sm font-medium">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-[hsl(var(--chart-2))]" />
                                <span>{stats.totalCompleted} Achieved</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-muted" />
                                <span>{(stats.totalInProgress || 0) + (stats.totalCritical || 0)} In Progress</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Gender Distribution Donut */}
                <Card className="border-primary/10 shadow-lg overflow-hidden flex flex-col">
                    <CardHeader className="bg-muted/30 border-b pb-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            Gender Distribution
                        </CardTitle>
                        <CardDescription>Breakdown of current patient population.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col items-center justify-center">
                        <div className="w-full flex flex-col md:flex-row items-center gap-8">
                            <div className="w-full aspect-square max-w-[240px]">
                                <ChartContainer config={{ value: { label: 'Count' } }} className="h-full w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={genderData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                innerRadius="65%"
                                                outerRadius="100%"
                                                paddingAngle={8}
                                                stroke="none"
                                            >
                                                {genderData.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={entry.fill} />
                                                ))}
                                            </Pie>
                                            <Tooltip content={<ChartTooltipContent hideLabel />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </ChartContainer>
                            </div>
                            <div className="flex-1 space-y-4 w-full">
                                {genderData.map((entry: any, index: number) => (
                                    <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-primary/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.fill }} />
                                            <span className="text-sm font-bold text-foreground">{entry.name}</span>
                                        </div>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-lg font-black text-foreground">{entry.value}</span>
                                            <span className="text-xs font-medium text-muted-foreground">
                                                ({((entry.value / stats.totalPatients) * 100).toFixed(0)}%)
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
