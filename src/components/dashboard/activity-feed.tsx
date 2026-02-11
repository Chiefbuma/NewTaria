'use client';

import type { Patient, Corporate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
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
      icon: Users,
      color: 'text-primary',
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: UserRoundCog,
      color: 'text-amber-500',
    },
    {
      title: 'Critical Patients',
      value: criticalPatients,
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      title: 'Corporate Partners',
      value: totalCorporates,
      icon: Building,
      color: 'text-indigo-500',
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>At a Glance</CardTitle>
            <CardDescription>A quick summary of your operations.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-4">
                {stats.map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                        <motion.li
                            key={stat.title}
                            className="flex items-center"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                        >
                            <div className={`p-3 bg-muted/50 rounded-lg mr-4`}>
                                <Icon className={`h-5 w-5 ${stat.color}`} />
                            </div>
                            <div className="flex-grow">
                                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                            </div>
                            <p className="text-xl font-bold">{stat.value}</p>
                        </motion.li>
                    );
                })}
            </ul>
        </CardContent>
     </Card>
  );
}
