'use client';

import type { Patient, Corporate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building, UserRoundCog } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityFeed({ patients, corporates }: { patients: Patient[], corporates: Corporate[] }) {
  const totalPatients = patients.length;
  const pendingOnboarding = patients.filter(p => p.status === 'Pending').length;
  const totalCorporates = corporates.length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <Users className="h-6 w-6 text-primary" />,
      color: 'bg-primary/10',
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: <UserRoundCog className="h-6 w-6 text-amber-500" />,
      color: 'bg-amber-500/10',
    },
    {
      title: 'Total Corporates',
      value: totalCorporates,
      icon: <Building className="h-6 w-6 text-emerald-500" />,
      color: 'bg-emerald-500/10',
    },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>An overview of key metrics.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
        {stats.map((stat, index) => (
            <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="p-4 bg-background rounded-xl border flex items-center gap-4 hover:border-primary/50 transition-colors"
            >
                <div className={`p-3 rounded-full ${stat.color}`}>
                    {stat.icon}
                </div>
                <div>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                </div>
            </motion.div>
        ))}
        </CardContent>
    </Card>
  );
}
