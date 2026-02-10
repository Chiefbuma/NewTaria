'use client';

import type { Patient, Corporate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building, UserClock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ActivityFeed({ patients, corporates }: { patients: Patient[], corporates: Corporate[] }) {
  const totalPatients = patients.length;
  const pendingOnboarding = patients.filter(p => p.status === 'Pending').length;
  const totalCorporates = corporates.length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <Users className="h-6 w-6 text-blue-500" />,
      color: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: <UserClock className="h-6 w-6 text-amber-500" />,
      color: 'bg-amber-100 dark:bg-amber-900/20',
    },
    {
      title: 'Total Corporates',
      value: totalCorporates,
      icon: <Building className="h-6 w-6 text-emerald-500" />,
      color: 'bg-emerald-100 dark:bg-emerald-900/20',
    },
  ];

  return (
    <Card>
        <CardHeader>
            <CardTitle>Summary Statistics</CardTitle>
            <CardDescription>An overview of key metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
        {stats.map((stat, index) => (
            <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
            >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                         <div className={`p-2 rounded-lg ${stat.color}`}>
                            {stat.icon}
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-4xl font-bold">{stat.value}</div>
                    </CardContent>
                </Card>
            </motion.div>
        ))}
        </CardContent>
    </Card>
  );
}
