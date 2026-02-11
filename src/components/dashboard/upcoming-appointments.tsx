'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar, Clock } from 'lucide-react';
import Link from 'next/link';

export default function UpcomingAppointments({ patients }: { patients: Patient[] }) {
    const upcomingAppointments = patients
        .flatMap(p => p.appointments.map(a => ({ ...a, patientName: `${p.first_name} ${p.surname || ''}`, patientId: p.id })))
        .filter(a => new Date(a.appointment_date) > new Date())
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 5); // Take top 5

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next 5 scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appt => (
                        <div key={appt.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg">
                            <div className="bg-primary/10 text-primary p-3 rounded-full">
                                <Calendar className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-semibold">{appt.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    <Link href={`/patient/${appt.patientId}`} className="hover:underline font-medium text-primary/90">{appt.patientName}</Link>
                                </p>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                    <Clock className="h-3 w-3" />
                                    <span>{new Date(appt.appointment_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-center text-muted-foreground py-4">No upcoming appointments.</p>
                )}
            </CardContent>
        </Card>
    );
}
