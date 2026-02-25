
'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Users, BarChart3 } from 'lucide-react';

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
                        Stats will appear here once patients are registered and assessed in the program.
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

    const chartConfig = {
        value: { label: 'Count', color: 'hsl(var(--primary))' }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="border-primary/10 shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <CardContent className="p-8 flex items-center gap-6">
                        <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 shadow-inner">
                            <Users className="h-8 w-8 text-primary" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">Total Patients</p>
                            <p className="text-4xl font-black text-foreground tracking-tighter leading-none">
                                {stats.totalPatients}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card className="border-primary/10 shadow-lg overflow-hidden flex flex-col">
                    <CardHeader className="bg-muted/30 border-b pb-6">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <BarChart3 className="h-5 w-5 text-primary" />
                            Gender Distribution
                        </CardTitle>
                        <CardDescription>Breakdown of current patient population by gender.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 flex-1 flex flex-col items-center justify-center">
                        {genderData.length > 0 ? (
                            <div className="w-full flex flex-col md:flex-row items-center gap-8">
                                <div className="w-full aspect-square max-w-[240px]">
                                    <ChartContainer config={chartConfig} className="h-full w-full">
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
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm py-12 gap-4">
                                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center opacity-20">
                                    <Users className="h-6 w-6" />
                                </div>
                                Insufficient gender data.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
