'use client';

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText, CalendarCheck } from 'lucide-react';
import Link from 'next/link';

export default function ActivityFeed({ patients }: { patients: Patient[] }) {
  const pendingPatients = patients.filter(p => p.status === 'Pending').slice(0, 5);
  
  const upcomingAppointments = patients
    .flatMap(p => p.appointments.map(a => ({ ...a, patientName: `${p.first_name} ${p.surname || ''}`, patientId: p.id })))
    .filter(a => new Date(a.appointment_date) > new Date())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activities</CardTitle>
        <CardDescription>A summary of pending tasks and upcoming events.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Pending Onboarding
          </h4>
          {pendingPatients.length > 0 ? (
            <ul className="space-y-3">
              {pendingPatients.map(patient => (
                <li key={patient.id} className="text-sm">
                  <Link href={`/patient/${patient.id}`} className="font-medium text-primary hover:underline">
                    Complete onboarding for {patient.first_name} {patient.surname || ''}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No pending onboardings.</p>
          )}
        </div>
        <div>
          <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
            <CalendarCheck className="h-4 w-4" />
            Upcoming Assessments
          </h4>
          {upcomingAppointments.length > 0 ? (
            <ul className="space-y-3">
              {upcomingAppointments.map(appointment => (
                <li key={appointment.id} className="text-sm">
                  <Link href={`/patient/${appointment.patientId}`} className="font-medium hover:underline">
                    {appointment.title} for {appointment.patientName}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    {new Date(appointment.appointment_date).toLocaleString('en-US', { month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No upcoming assessments.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
