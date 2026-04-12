'use client';
import { useState } from 'react';
import type { Patient, Appointment, User } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarCheck, Clock, CalendarPlus, Edit, XCircle, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatAppointmentDateTime } from '@/lib/date-format';
import { updateAppointmentStatus, upsertAppointment } from '@/lib/api-service';
import AddAppointmentSheet from '@/components/patient/add-appointment-sheet';
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
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

export default function AppointmentsCard({
  patient,
  clinicians,
  onUpdate,
  readOnly = false,
}: {
  patient: Patient;
  clinicians: User[];
  onUpdate: (appointments: Appointment[]) => void;
  readOnly?: boolean;
}) {
    const { toast } = useToast();
    const [pendingStatusId, setPendingStatusId] = useState<number | null>(null);
    
    const upcomingAppointments = patient.appointments
        .filter(a => new Date(a.appointment_date) > new Date() && a.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
    
    const nextAppointment = upcomingAppointments[0];

    const handleSave = async (appointmentData: Omit<Appointment, 'id' | 'patient_id'> & { id?: number }) => {
      if (readOnly) return;
      const saved = await upsertAppointment({ ...appointmentData, patient_id: patient.id });
      const clinician = clinicians.find((c) => c.id === Number(appointmentData.clinician_id));
      const fullAppt: Appointment = {
        ...saved,
        clinician: clinician ?? saved.clinician,
      };

      const updatedAppointments = appointmentData.id
        ? patient.appointments.map((a) => (a.id === appointmentData.id ? fullAppt : a))
        : [fullAppt, ...patient.appointments];

      onUpdate(updatedAppointments);
      toast({ title: 'Success', description: 'Appointment saved.' });
    };

    const handleCancel = async (appointmentId: number) => {
        try {
            setPendingStatusId(appointmentId);
            await updateAppointmentStatus(appointmentId, 'cancelled');
            const updatedAppointments = patient.appointments.map(a => 
                a.id === appointmentId ? { ...a, status: 'cancelled' as const } : a
            );
            onUpdate(updatedAppointments);
            toast({ title: "Success", description: "Appointment cancelled." });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to cancel appointment.' });
        } finally {
            setPendingStatusId(null);
        }
    }
    
    const handleConfirm = async (appointmentId: number) => {
        try {
            setPendingStatusId(appointmentId);
            await updateAppointmentStatus(appointmentId, 'confirmed');
            const updatedAppointments = patient.appointments.map(a => 
                a.id === appointmentId ? { ...a, status: 'confirmed' as const } : a
            );
            onUpdate(updatedAppointments);
            toast({ title: "Success", description: "Appointment confirmed." });
        } catch (e: any) {
            toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to confirm appointment.' });
        } finally {
            setPendingStatusId(null);
        }
    }

    return (
        <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardHeader className="bg-muted/30 pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <CardTitle className="flex items-center gap-2 text-base">
                            <CalendarCheck className="h-4 w-4" />
                            <span>Appointments</span>
                        </CardTitle>
                        <CardDescription className="text-xs">Manage upcoming appointments.</CardDescription>
                    </div>
                    <AddAppointmentSheet
                      trigger={
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button size="icon" variant="ghost" className="h-8 w-8" disabled={readOnly}>
                                <CalendarPlus className="h-4 w-4" />
                                <span className="sr-only">Schedule Appointment</span>
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Schedule Appointment</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      }
                      onSave={handleSave}
                      patient={patient}
                      clinicians={clinicians}
                      existingAppointment={null}
                      align="end"
                      disabled={readOnly}
                    />
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
                                <span>{formatAppointmentDateTime(nextAppointment.appointment_date)}</span>
                            </div>
                        </div>
                        <div className="flex flex-wrap justify-end gap-2">
                            {nextAppointment.status === 'scheduled' && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="icon"
                                      variant="secondary"
                                      className="h-8 w-8"
                                      onClick={() => handleConfirm(nextAppointment.id)}
                                      disabled={pendingStatusId === nextAppointment.id}
                                    >
                                      <Check className="h-4 w-4" />
                                      <span className="sr-only">Confirm</span>
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent><p>Confirm</p></TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                            <AddAppointmentSheet
                              trigger={
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button size="icon" variant="outline" className="h-8 w-8" disabled={readOnly}>
                                        <Edit className="h-4 w-4" />
                                        <span className="sr-only">Reschedule</span>
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>Reschedule</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              }
                              onSave={handleSave}
                              patient={patient}
                              clinicians={clinicians}
                              existingAppointment={nextAppointment}
                              align="end"
                              disabled={readOnly}
                            />
                             <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button size="icon" variant="destructive" className="h-8 w-8" disabled={pendingStatusId === nextAppointment.id}>
                                      <XCircle className="h-4 w-4" />
                                      <span className="sr-only">Cancel</span>
                                    </Button>
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
