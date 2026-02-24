'use client';

import { useState, useEffect } from 'react';
import type { Patient, ClinicalParameter, User, Appointment } from '@/lib/types';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AllNotesCard from './all-notes-card';
import ProgressDashboard from './progress-dashboard';
import AppointmentsCard from '@/components/patient/appointments-card';
import AddAppointmentModal from '@/components/patient/add-appointment-modal';
import { useToast } from '@/hooks/use-toast';

export default function ProgressPageClient({ 
    patient: initialPatient, 
    clinicalParameters,
    clinicians,
}: { 
    patient: Patient,
    clinicalParameters: ClinicalParameter[],
    clinicians: User[]
}) {
    const { toast } = useToast();
    const [patient, setPatient] = useState(initialPatient);
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const stored = localStorage.getItem('loggedInUser');
        if (stored) setCurrentUser(JSON.parse(stored));
    }, []);

    const isPatientView = currentUser?.role === 'user';

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
                    
                    {/* Patients see a chat button instead of clinical appointment management */}
                    {isPatientView ? (
                        <Card className="border-primary/20 bg-primary/5">
                            <CardHeader className="p-4">
                                <CardTitle className="text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" />Provider Support</CardTitle>
                            </CardHeader>
                            <CardContent className="p-4 pt-0">
                                <p className="text-xs text-muted-foreground mb-4">Have questions about your progress? Chat with your health navigator.</p>
                                <Button asChild className="w-full bg-primary hover:bg-primary/90 shadow-md">
                                    <Link href="/dashboard/messages">Open Chat</Link>
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
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
                  <ProgressDashboard patient={patient} clinicalParameters={clinicalParameters} />
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
