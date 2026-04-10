'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from "@/lib/placeholder-images";
import { formatAppointmentDateTime } from '@/lib/date-format';

export default function UpcomingAppointments({ patients }: { patients: Patient[] }) {
    const upcomingAppointments = patients
        .flatMap(p => p.appointments.map(a => ({ ...a, patientName: `${p.first_name} ${p.surname || ''}`, patientId: p.id })))
        .filter(a => new Date(a.appointment_date) > new Date())
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
        .slice(0, 5); // Take top 5
        
    const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

    return (
        <Card>
            <CardHeader>
                <CardTitle>Upcoming Appointments</CardTitle>
                <CardDescription>Next 5 scheduled appointments.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {upcomingAppointments.length > 0 ? (
                    upcomingAppointments.map(appt => {
                        const patientForAppt = patients.find(p => p.id === appt.patientId);
                        const fallback = patientForAppt ? `${patientForAppt.first_name[0]}${patientForAppt.surname ? patientForAppt.surname[0] : ''}` : 'P';
                        
                        return (
                            <div key={appt.id} className="flex items-start gap-4 p-3 bg-muted/50 rounded-lg transition-colors hover:bg-muted/80">
                                <Avatar className="h-10 w-10 border">
                                    <AvatarImage src={patientAvatar?.imageUrl} alt={appt.patientName} />
                                    <AvatarFallback>{fallback}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <p className="font-semibold">{appt.title}</p>
                                    <p className="text-sm text-muted-foreground">
                                        <Link href={`/patient/${appt.patientId}`} className="hover:underline font-medium text-primary/90">{appt.patientName}</Link>
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Clock className="h-3 w-3" />
                                        <span>{formatAppointmentDateTime(appt.appointment_date)}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-center text-muted-foreground py-4">No upcoming appointments.</p>
                )}
            </CardContent>
        </Card>
    );
}
