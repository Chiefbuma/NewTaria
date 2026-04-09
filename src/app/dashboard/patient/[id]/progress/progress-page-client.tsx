'use client';

import { useState } from 'react';
import type { Patient, ClinicalParameter, User, Appointment } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar } from 'lucide-react';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AllNotesCard from './all-notes-card';
import ProgressDashboard from './progress-dashboard';
import AppointmentsCard from '@/components/patient/appointments-card';
import AddAppointmentModal from '@/components/patient/add-appointment-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { isPatientRole } from '@/lib/role-utils';
import { format, subMonths, startOfDay, endOfDay } from 'date-fns';

export default function ProgressPageClient({ 
    patient: initialPatient, 
    clinicalParameters,
    clinicians,
    currentUser,
}: { 
    patient: Patient,
    clinicalParameters: ClinicalParameter[],
    clinicians: User[],
    currentUser: User | null
}) {
    const { toast } = useToast();
    const [patient, setPatient] = useState(initialPatient);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

    // Default to last 6 months
    const [fromDate, setFromDate] = useState(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
    const [toDate, setToDate] = useState(format(new Date(), 'yyyy-MM-dd'));

    const isPatientView = isPatientRole(currentUser?.role);

    const handleAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
        setPatient(prev => ({ ...prev, appointments: updatedAppointments }));
    };

    const handleOpenAppointmentModal = (appointment?: Appointment) => {
        setEditingAppointment(appointment || null);
        setIsAppointmentModalOpen(true);
    };

    const handleSaveAppointment = (appointmentData: Omit<Appointment, 'id' | 'patient_id'> & { id?: number }) => {
        const clinician = clinicians.find(c => c.id === Number(appointmentData.clinician_id));
        const fullAppointmentData = { ...appointmentData, clinician };

        const updatedAppointments = editingAppointment
            ? patient.appointments.map(a => a.id === editingAppointment.id ? { ...a, ...fullAppointmentData, id: a.id, patient_id: patient.id } : a)
            : [...patient.appointments, { ...fullAppointmentData, id: Date.now(), patient_id: patient.id } as Appointment];

        handleAppointmentsUpdate(updatedAppointments as Appointment[]);
        setIsAppointmentModalOpen(false);
        setEditingAppointment(null);
        toast({ title: 'Success', description: 'Appointment saved.' });
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    <PatientInfoCard patient={patient} />
                    {!isPatientView && (
                        <AppointmentsCard 
                            patient={patient}
                            onSchedule={() => handleOpenAppointmentModal()}
                            onEdit={handleOpenAppointmentModal}
                            onUpdate={handleAppointmentsUpdate}
                        />
                    )}
                    
                    <AllNotesCard assessments={patient.assessments} clinicalParameters={clinicalParameters} />
                </div>
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6">
                        <div className="flex items-center gap-4">
                            {!isPatientView && (
                                <Button asChild variant="outline" size="icon" className="border-primary/20">
                                    <Link href={`/dashboard/patient/${patient.id}`}>
                                        <ArrowLeft className="h-4 w-4" />
                                        <span className="sr-only">Back to Patient Details</span>
                                    </Link>
                                </Button>
                            )}
                            <div>
                                <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">
                                    {isPatientView ? 'Your Health Progress' : 'Progress Dashboard'}
                                </h1>
                                <p className="text-muted-foreground">
                                    {isPatientView ? 'Tracking your journey to wellness' : `Visualizing progress for ${patient.first_name} ${patient.surname || ''}`}
                                </p>
                            </div>
                        </div>

                        {/* Advanced Filters */}
                        <div className="flex flex-wrap items-end gap-4 p-4 bg-muted/30 rounded-2xl border border-primary/10">
                            <div className="space-y-1.5">
                                <Label htmlFor="fromDate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> From Date
                                </Label>
                                <Input 
                                    id="fromDate" 
                                    type="date" 
                                    className="h-9 w-[150px] bg-background border-primary/20 text-sm focus:border-primary"
                                    value={fromDate}
                                    onChange={(e) => setFromDate(e.target.value)}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="toDate" className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground ml-1 flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> To Date
                                </Label>
                                <Input 
                                    id="toDate" 
                                    type="date" 
                                    className="h-9 w-[150px] bg-background border-primary/20 text-sm focus:border-primary"
                                    value={toDate}
                                    onChange={(e) => setToDate(e.target.value)}
                                />
                            </div>
                            <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-9 text-xs text-muted-foreground hover:text-primary"
                                onClick={() => {
                                    setFromDate(format(subMonths(new Date(), 6), 'yyyy-MM-dd'));
                                    setToDate(format(new Date(), 'yyyy-MM-dd'));
                                }}
                            >
                                Reset Range
                            </Button>
                        </div>
                  </div>
                  
                  <ProgressDashboard 
                    patient={patient} 
                    clinicalParameters={clinicalParameters} 
                    fromDate={startOfDay(new Date(fromDate))}
                    toDate={endOfDay(new Date(toDate))}
                  />
                </div>
            </div>
            
            {isAppointmentModalOpen && (
                <AddAppointmentModal
                    isOpen={isAppointmentModalOpen}
                    onClose={() => setIsAppointmentModalOpen(false)}
                    onSave={handleSaveAppointment}
                    patient={patient}
                    clinicians={clinicians}
                    existingAppointment={editingAppointment}
                />
            )}
        </>
    );
}
