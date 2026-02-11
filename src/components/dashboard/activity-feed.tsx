'use client';

import type { Patient, Corporate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building, UserRoundCog, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityFeed({ patients, corporates }: { patients: Patient[], corporates: Corporate[] }) {
  const totalPatients = patients.length;
  const pendingOnboarding = patients.filter(p => p.status === 'Pending').length;
  const criticalPatients = patients.filter(p => p.status === 'Critical').length;
  const totalCorporates = corporates.length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <Users className="h-6 w-6 text-primary" />,
      color: 'text-primary bg-primary/10',
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: <UserRoundCog className="h-6 w-6 text-amber-500" />,
      color: 'text-amber-500 bg-amber-500/10',
    },
    {
      title: 'Critical Patients',
      value: criticalPatients,
      icon: <AlertTriangle className="h-6 w-6 text-destructive" />,
      color: 'text-destructive bg-destructive/10',
    },
    {
      title: 'Total Corporates',
      value: totalCorporates,
      icon: <Building className="h-6 w-6 text-emerald-500" />,
      color: 'text-emerald-500 bg-emerald-500/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
            <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <Card className="hover:border-primary/50 transition-colors shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                        <div className={`p-2 rounded-full ${stat.color}`}>
                           {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            </motion.div>
        ))}
    </div>
  );
}
