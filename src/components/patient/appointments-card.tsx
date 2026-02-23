'use client';
import type { Patient, Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, PlusCircle, Edit, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export default function AppointmentsCard({ patient, onSchedule, onEdit, onUpdate }: { patient: Patient, onSchedule: () => void, onEdit: (appointment: Appointment) => void, onUpdate: (appointments: Appointment[]) => void }) {
    const { toast } = useToast();
    
    const upcomingAppointments = patient.appointments
        .filter(a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    
    const nextAppointment = upcomingAppointments[0];

    const handleCancel = (appointmentId: number) => {
        const updatedAppointments = patient.appointments.map(a => 
            a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
        );
        onUpdate(updatedAppointments);
        toast({ title: "Success", description: "Appointment cancelled." });
    }
    
    const handleConfirm = (appointmentId: number) => {
         const updatedAppointments = patient.appointments.map(a => 
            a.id === appointmentId ? { ...a, status: 'confirmed' as const } : a
        );
        onUpdate(updatedAppointments);
        toast({ title: "Success", description: "Appointment confirmed." });
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
                     <Button size="sm" onClick={onSchedule}><PlusCircle className="mr-2 h-4 w-4" /> Schedule</Button>
                </div>
            </CardHeader>
            <CardContent>
                {nextAppointment ? (
                    <div className="p-3 bg-muted/50 rounded-lg space-y-3">
                        <div>
                            <p className="text-sm font-semibold text-primary">{nextAppointment.title}</p>
                            <p className="text-sm text-muted-foreground">With: {nextAppointment.clinician?.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                <Clock className="h-3 w-3" />
                                <span>{new Date(nextAppointment.appointment_date).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</span>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            {nextAppointment.status === 'scheduled' && <Button size="sm" variant="secondary" onClick={() => handleConfirm(nextAppointment.id)}>Confirm</Button>}
                            <Button size="sm" variant="outline" onClick={() => onEdit(nextAppointment)}><Edit className="mr-2 h-3 w-3"/> Reschedule</Button>
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="destructive"><XCircle className="mr-2 h-3 w-3"/> Cancel</Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                    <AlertDialogTitle>Cancel Appointment?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        This will cancel the appointment. This action can be updated later.
                                    </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                    <AlertDialogCancel>Back</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleCancel(nextAppointment.id)} className="bg-destructive hover:bg-destructive/90">
                                        Confirm Cancellation
                                    </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </div>
                    </div>
                ) : (
                    <p className="text-center text-muted-foreground py-4">No upcoming appointments.</p>
                )}
            </CardContent>
        </Card>
    );
}
