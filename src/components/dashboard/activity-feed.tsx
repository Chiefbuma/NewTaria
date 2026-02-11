'use client';

import type { Patient, Corporate } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, Building, UserRoundCog, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

export default function ActivityFeed({ patients, corporates }: { patients: Patient[], corporates: Corporate[] }) {
  const totalPatients = patients.length;
  const pendingOnboarding = patients.filter(p => p.status === 'Pending').length;
  const criticalPatients = patients.filter(p => p.status === 'Critical').length;
  const totalCorporates = corporates.length;

  const stats = [
    {
      title: 'Total Patients',
      value: totalPatients,
      icon: <Users className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Pending Onboarding',
      value: pendingOnboarding,
      icon: <UserRoundCog className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Critical Patients',
      value: criticalPatients,
      icon: <AlertTriangle className="h-5 w-5 text-muted-foreground" />,
    },
    {
      title: 'Corporate Partners',
      value: totalCorporates,
      icon: <Building className="h-5 w-5 text-muted-foreground" />,
    },
  ];

  return (
     <Card>
        <CardHeader>
            <CardTitle>At a Glance</CardTitle>
            <CardDescription>A quick summary of your operations.</CardDescription>
        </CardHeader>
        <CardContent>
            <ul className="space-y-3">
                {stats.map((stat, index) => (
                    <motion.li 
                        key={stat.title}
                        className="flex items-center justify-between text-sm"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <div className="flex items-center gap-3">
                            {stat.icon}
                            <span className="font-medium">{stat.title}</span>
                        </div>
                        <Badge variant="secondary" className="font-semibold">{stat.value}</Badge>
                    </motion.li>
                ))}
            </ul>
        </CardContent>
     </Card>
  );
}
