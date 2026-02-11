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
      icon: <Users className="h-6 w-6 text-primary" />,
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: <UserRoundCog className="h-6 w-6 text-amber-500" />,
    },
    {
      title: 'Critical Patients',
      value: criticalPatients,
      icon: <AlertTriangle className="h-6 w-6 text-red-500" />,
    },
    {
      title: 'Corporate Partners',
      value: totalCorporates,
      icon: <Building className="h-6 w-6 text-indigo-500" />,
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>At a Glance</CardTitle>
            <CardDescription>A quick summary of your operations.</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                    <motion.div 
                        key={stat.title}
                        className="flex items-center gap-4 rounded-lg bg-muted/50 p-4 transition-all hover:bg-muted/80 hover:shadow-sm"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                    >
                        <div className="bg-background p-3 rounded-full shadow-inner">
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <div className="text-xs text-muted-foreground font-medium">{stat.title}</div>
                        </div>
                    </motion.div>
                ))}
            </div>
        </CardContent>
     </Card>
  );
}
