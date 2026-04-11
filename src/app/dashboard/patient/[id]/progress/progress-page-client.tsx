'use client';

import { useState, type ElementType } from 'react';
import type { Patient, ClinicalParameter, User, Appointment } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, CalendarClock, ClipboardList, Target, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AllNotesCard from './all-notes-card';
import ProgressDashboard from './progress-dashboard';
import AppointmentsCard from '@/components/patient/appointments-card';
import PatientMedicationsCard from '@/components/patient/patient-medications-card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { canManageAppointments, canManageAssessments, isPartnerRole, isPatientRole } from '@/lib/role-utils';
import { format } from 'date-fns';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatAppointmentDateTime } from '@/lib/date-format';

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

    const isPatientView = isPatientRole(currentUser?.role);
    const canManageAppts = canManageAppointments(currentUser?.role);
    const canManagePatientAssessments = canManageAssessments(currentUser?.role);
    const checkInMode: 'patient' | 'staff' | 'none' = isPatientView ? 'patient' : (canManagePatientAssessments ? 'staff' : 'none');
    const allAssessments = patient.assessments.filter((a) => a.deleted_at == null);
    const activeGoals = patient.goals.filter((goal) => goal.status === 'active');
    const completedGoals = patient.goals.filter((goal) => goal.status === 'completed');
    const notesCount = allAssessments.filter((assessment) => assessment.notes?.trim()).length;
    const nextAppointment = [...patient.appointments]
        .filter((appointment) => new Date(appointment.appointment_date) > new Date() && appointment.status !== 'cancelled')
        .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0] || null;

    const handleAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
        setPatient(prev => ({ ...prev, appointments: updatedAppointments }));
    };

    if (isPatientView) {
        return (
            <>
                <div className="space-y-6">
                    <Card className="overflow-hidden border-border/60 bg-card shadow-[0_24px_55px_-34px_rgba(15,23,42,0.18)]">
                        <CardContent className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[1.35fr_0.85fr]">
                            <div className="space-y-5">
                                <div className="space-y-3">
                                    <div className="flex flex-wrap items-center gap-2">
                                        <Badge variant="secondary">Patient Portal</Badge>
                                        <Badge variant="outline" className="border-primary/20 bg-white/70 text-primary">
                                            {patient.status || 'Active'}
                                        </Badge>
                                    </div>
                                    <div>
                                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                                            Welcome back, {patient.first_name}
                                        </h1>
                                        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                                            This dashboard helps you follow your goals, see recent check-ins, and understand how your care journey is progressing.
                                        </p>
                                    </div>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-3">
                                    <HeroStat icon={Target} label="Active goals" value={String(activeGoals.length)} />
                                    <HeroStat icon={TrendingUp} label="Assessments" value={String(allAssessments.length)} />
                                    <HeroStat icon={ClipboardList} label="Care notes" value={String(notesCount)} />
                                </div>
                            </div>

                            <div className="rounded-[1.75rem] border border-primary/10 bg-white/90 p-5 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.26)]">
                                <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <CalendarClock className="h-4 w-4 text-primary" />
                                    Your Next Appointment
                                </div>
                                {nextAppointment ? (
                                    <div className="mt-4 space-y-3">
                                        <div>
                                            <p className="text-lg font-semibold text-primary">{nextAppointment.title}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {nextAppointment.clinician?.name ? `With ${nextAppointment.clinician.name}` : 'Care team follow-up'}
                                            </p>
                                        </div>
                                        <div className="rounded-2xl bg-muted/40 p-4">
                                            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Scheduled for</p>
                                            <p className="mt-1 text-sm font-medium text-foreground">
                                                {formatAppointmentDateTime(nextAppointment.appointment_date)}
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-4 rounded-2xl bg-muted/40 p-4">
                                        <p className="text-sm text-muted-foreground">
                                            No upcoming appointment is scheduled right now. Your care team will update you when the next check-in is booked.
                                        </p>
                                    </div>
                                )}

                                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                                    <MiniSummary label="Completed goals" value={String(completedGoals.length)} />
                                    <MiniSummary label="Updated" value={format(new Date(), 'MMM d, yyyy')} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                        <div className="grid grid-cols-1 items-start gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
                        <div className="space-y-6">
                            <PatientInfoCard patient={patient} />
                            <AllNotesCard assessments={allAssessments} clinicalParameters={clinicalParameters} />
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

function HeroStat({
    icon: Icon,
    label,
    value,
}: {
    icon: ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-primary/10 bg-white/80 p-4 shadow-[0_18px_45px_-34px_rgba(15,23,42,0.3)]">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Icon className="h-3.5 w-3.5 text-primary" />
                {label}
            </div>
            <p className="mt-3 text-2xl font-bold text-foreground">{value}</p>
        </div>
    );
}

function MiniSummary({
    label,
    value,
}: {
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-primary/10 bg-muted/30 p-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
        </div>
    );
}

// Global date filtering removed: each goal visual auto-ranges to its own available assessment history.
