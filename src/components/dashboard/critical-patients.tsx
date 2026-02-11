'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from "@/lib/placeholder-images";
import { Button } from '../ui/button';

export default function CriticalPatients({ patients }: { patients: Patient[] }) {
    const criticalPatients = patients.filter(p => p.status === 'Critical');
    const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-destructive" />
                    <span>Critical Patients</span>
                </CardTitle>
                <CardDescription>Patients requiring immediate attention.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {criticalPatients.length > 0 ? (
                    criticalPatients.map(patient => {
                        const name = `${patient.first_name} ${patient.surname || ''}`;
                        const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;
                        return (
                            <div key={patient.id} className="flex items-center justify-between p-3 bg-destructive/10 rounded-lg border border-destructive/20">
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9">
                                        {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} />}
                                        <AvatarFallback>{fallback}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-semibold text-red-800 dark:text-red-300">{name}</p>
                                        <p className="text-sm text-red-700 dark:text-red-400/80">{patient.email || patient.phone}</p>
                                    </div>
                                </div>
                                <Button asChild variant="ghost" size="sm">
                                    <Link href={`/patient/${patient.id}`} className="text-red-800 dark:text-red-300">
                                        View <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                            </div>
                        )
                    })
                ) : (
                    <p className="text-center text-muted-foreground py-4">No patients with critical status.</p>
                )}
            </CardContent>
        </Card>
    );
}
