'use client';

import { useState } from 'react';
import type { Patient, ClinicalParameter, User, Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AllNotesCard from './all-notes-card';
import ProgressDashboard from './progress-dashboard';
import AppointmentsCard from '@/components/patient/appointments-card';
import PatientMedicationsCard from '@/components/patient/patient-medications-card';
import { canManageAppointments, canManageAssessments, isPartnerRole, isPatientRole } from '@/lib/role-utils';

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
    const [patient, setPatient] = useState(initialPatient);

    const isPatientView = isPatientRole(currentUser?.role);
    const canManageAppts = canManageAppointments(currentUser?.role);
    const canManagePatientAssessments = canManageAssessments(currentUser?.role);
    const checkInMode: 'patient' | 'staff' | 'none' = isPatientView ? 'patient' : (canManagePatientAssessments ? 'staff' : 'none');
    const allAssessments = patient.assessments.filter((a) => a.deleted_at == null);
    
    const handleAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
        setPatient(prev => ({ ...prev, appointments: updatedAppointments }));
    };

    if (isPatientView) {
        return (
            <>
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Welcome back, {patient.first_name}
                        </h1>
                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                            This dashboard helps you follow your goals, see recent check-ins, and understand how your care journey is progressing.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <PatientInfoCard patient={patient} />
                            <AllNotesCard assessments={allAssessments} clinicalParameters={clinicalParameters} />
                             <AppointmentsCard 
                                patient={patient}
                                clinicians={clinicians}
                                onUpdate={handleAppointmentsUpdate}
                            />
                            <PatientMedicationsCard patient={patient} />
                        </div>
                        <div className="space-y-6">
                            <ProgressDashboard 
                                patient={patient} 
                                clinicalParameters={clinicalParameters} 
                                patientView
                                onAssessmentsUpdate={(assessments) => setPatient((prev) => ({ ...prev, assessments }))}
                                checkInMode={checkInMode}
                                currentUserId={currentUser?.id ?? null}
                            />
                        </div>
                    </div>
                </div>
            </>
        );
    }

    const isPartnerView = isPartnerRole(currentUser?.role);

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
                <div className="lg:col-span-1 space-y-6">
                    {isPartnerView ? (
                        <div className="flex items-center gap-2">
                            <Button asChild variant="ghost" size="icon" className="h-9 w-9">
                                <Link href="/dashboard/registry" aria-label="Back to registry">
                                    <ArrowLeft className="h-4 w-4" />
                                </Link>
                            </Button>
                            <Button asChild variant="outline" className="w-full">
                                <Link href={`/dashboard/patient/${patient.id}#edit`}>Edit Member Details</Link>
                            </Button>
                        </div>
                    ) : null}
                    <PatientInfoCard patient={patient} />
                    {canManageAppts && (
                        <AppointmentsCard 
                            patient={patient}
                            clinicians={clinicians}
                            onUpdate={handleAppointmentsUpdate}
                        />
                    )}
                    
                    <AllNotesCard assessments={patient.assessments} clinicalParameters={clinicalParameters} />
                    <PatientMedicationsCard patient={patient} />
                </div>
                <div className="lg:col-span-3 space-y-6">
                  <ProgressDashboard 
                    patient={patient} 
                    clinicalParameters={clinicalParameters} 
                    patientView={false}
                    onAssessmentsUpdate={(assessments) => setPatient((prev) => ({ ...prev, assessments }))}
                    checkInMode={checkInMode}
                    currentUserId={currentUser?.id ?? null}
                  />
                </div>
            </div>
            
        </>
    );
}
