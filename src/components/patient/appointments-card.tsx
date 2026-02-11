'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AppointmentsCard({ patient }: { patient: Patient }) {
    const { toast } = useToast();
    
    const upcomingAppointments = patient.appointments
        .filter(a => new Date(a.appointment_date) > new Date())
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    
    const nextAppointment = upcomingAppointments[0];

    const handleSchedule = () => {
        toast({ title: "Info", description: "Appointment scheduling modal not yet implemented."})
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarCheck className="h-5 w-5" />
                            <span>Appointments</span>
                        </CardTitle>
                        <CardDescription>Manage upcoming appointments.</CardDescription>
                    </div>
                     <Button size="sm" onClick={handleSchedule}><PlusCircle className="mr-2 h-4 w-4" /> Schedule</Button>
                </div>
            </CardHeader>
            <CardContent>
                {nextAppointment ? (
                    <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm font-semibold text-primary">{nextAppointment.title}</p>
                        <p className="text-sm text-muted-foreground">With: {nextAppointment.clinician?.name}</p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{new Date(nextAppointment.appointment_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No upcoming appointments.</p>
                )}
            </CardContent>
        </Card>
    );
}
