'use client';
import type { Patient, Appointment } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export function UpcomingAppointmentsSection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  const upcomingAppointment = patient.appointments
    ?.filter(a => new Date(a.appointment_date) > new Date())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())[0];

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center shadow-lg">
            <Calendar className="text-white" />
          </div>
          <CardTitle>Next Appointment</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {upcomingAppointment ? (
            <div className="space-y-2">
                <h3 className="font-semibold">{upcomingAppointment.title}</h3>
                <p className="text-sm text-muted-foreground">{formatDateTime(upcomingAppointment.appointment_date)}</p>
                <p className="text-sm">{upcomingAppointment.notes}</p>
                <Badge>{upcomingAppointment.status}</Badge>
            </div>
        ) : (
            <p className="text-center text-muted-foreground py-4">No upcoming appointments.</p>
        )}
      </CardContent>
    </Card>
  );
}
