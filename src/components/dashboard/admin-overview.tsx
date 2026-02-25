
'use client';

import { useMemo } from 'react';
import type { User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, Building2, Activity, ClipboardCheck, BarChart3, TrendingUp, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AdminOverview({ stats, user }: { stats: any, user: User }) {
    if (!stats) {
        return (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <BarChart3 className="h-12 w-12 text-muted-foreground/20" />
                <div>
                    <h3 className="text-lg font-bold">No Data Available</h3>
                    <p className="text-muted-foreground">Stats will appear here once patients are registered and assessed.</p>
                </div>
            </div>
        );
    }

    const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

    const patientStatusData = useMemo(() => {
        if (!stats.patientCounts || stats.patientCounts.length === 0) return [];
        return stats.patientCounts.map((s: any, idx: number) => ({
            name: s.status,
            value: Number(s.count),
            fill: COLORS[idx % COLORS.length]
        }));
    }, [stats.patientCounts]);

    const goalStatusData = useMemo(() => {
        if (!stats.goalStatus || stats.goalStatus.length === 0) return [];
        return stats.goalStatus.map((s: any, idx: number) => ({
            name: s.status.charAt(0).toUpperCase() + s.status.slice(1),
            value: Number(s.count),
            fill: COLORS[(idx + 2) % COLORS.length]
        }));
    }, [stats.goalStatus]);

    const diagnosisData = useMemo(() => {
        if (!stats.primaryDiagnosis || stats.primaryDiagnosis.length === 0) return [];
        const diagMap: Record<string, number> = {};
        stats.primaryDiagnosis.forEach((d: any) => {
            const key = d.diagnosis || 'Unspecified';
            diagMap[key] = (diagMap[key] || 0) + Number(d.count);
        });
        return Object.entries(diagMap).map(([name, value], idx) => ({
            name,
            value,
            fill: COLORS[idx % COLORS.length]
        }));
    }, [stats.primaryDiagnosis]);

    const totalPatients = Number(stats.registeredCount || 0) + Number(stats.activeCount || 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard label="Registered Patients" value={totalPatients} icon={Users} color="text-primary" />
                <StatCard label="Total Partners" value={Number(stats.totalPartners || 0)} icon={Building2} color="text-blue-500" />
                <StatCard label="Clinical Metrics" value={Number(stats.totalMetrics || 0)} icon={Activity} color="text-emerald-500" />
                <StatCard label="Active Status" value={Number(stats.activeCount || 0)} icon={ClipboardCheck} color="text-amber-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary"/>Patient Lifecycle</CardTitle>
                        <CardDescription>Breakdown of all registered patients by status.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[300px]">
                        {patientStatusData.length > 0 ? (
                            <ChartWrapper data={patientStatusData} />
                        ) : (
                            <EmptyChartState />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-primary"/>Goal Progression</CardTitle>
                        <CardDescription>Aggregate status of all health targets.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[300px]">
                        {goalStatusData.length > 0 ? (
                            <ChartWrapper data={goalStatusData} />
                        ) : (
                            <EmptyChartState />
                        )}
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card className="lg:col-span-2 border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2"><Activity className="h-5 w-5 text-primary"/>Diagnosis Distribution</CardTitle>
                        <CardDescription>Clinical findings across the population.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6 h-[350px]">
                        {diagnosisData.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={diagnosisData} layout="vertical" margin={{ left: 40, right: 40 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="hsla(var(--muted-foreground), 0.1)" />
                                    <XAxis type="number" hide />
                                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={150} tick={{ fontSize: 12 }} />
                                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={30}>
                                        {diagnosisData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChartState />
                        )}
                    </CardContent>
                </Card>

                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-lg flex items-center gap-2"><Users className="h-5 w-5 text-primary"/>Age Demographics</CardTitle>
                        <CardDescription>Population distribution by age group.</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-6">
                            {stats.ageDistribution && stats.ageDistribution.length > 0 ? (
                                stats.ageDistribution.map((group: any, idx: number) => (
                                    <div key={group.age_group} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm font-semibold">
                                            <span className="text-muted-foreground">{group.age_group} years</span>
                                            <span>{Number(group.count)} patients</span>
                                        </div>
                                        <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                                            <div 
                                                className="h-full bg-primary transition-all duration-1000" 
                                                style={{ width: `${totalPatients > 0 ? (Number(group.count) / totalPatients) * 100 : 0}%` }} 
                                            />
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-10">No demographic data.</p>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

const StatCard = ({ label, value, icon: Icon, color }: { label: string, value: number, icon: any, color: string }) => (
    <Card className="border-primary/10 hover:border-primary/30 transition-all">
        <CardContent className="p-6 flex items-center gap-4">
            <div className={cn("p-3 rounded-xl bg-muted/50", color.replace('text-', 'bg-').replace('500', '500/10'))}>
                <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
                <p className="text-sm font-medium text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{value}</p>
            </div>
        </CardContent>
    </Card>
);

const ChartWrapper = ({ data }: { data: any[] }) => {
    const config = { value: { label: 'Count', color: 'hsl(var(--primary))' } };
    return (
        <ChartContainer config={config} className="h-full w-full">
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
                    <Tooltip content={<ChartTooltipContent hideLabel />} />
                </PieChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
};

const EmptyChartState = () => (
    <div className="h-full w-full flex flex-col items-center justify-center text-muted-foreground/40 space-y-2">
        <BarChart3 className="h-8 w-8" />
        <p className="text-xs font-medium">No data points yet</p>
    </div>
);
