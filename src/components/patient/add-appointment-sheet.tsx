'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Patient, Appointment, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  SlideOver,
  SlideOverContent,
  SlideOverHeader,
  SlideOverTitle,
} from '@/components/ui/slide-over';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

export default function AddAppointmentSheet({
  open,
  onOpenChange,
  patient,
  clinicians,
  onSave,
  existingAppointment,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  clinicians: User[];
  onSave: (data: any) => Promise<void>;
  existingAppointment: Appointment | null;
}) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [title, setTitle] = useState('');
  const [clinicianId, setClinicianId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (open) {
      if (existingAppointment) {
        const localDate = new Date(existingAppointment.appointment_date);
        const yyyy = localDate.getFullYear();
        const mm = String(localDate.getMonth() + 1).padStart(2, '0');
        const dd = String(localDate.getDate()).padStart(2, '0');
        const hh = String(localDate.getHours()).padStart(2, '0');
        const mins = String(localDate.getMinutes()).padStart(2, '0');

        setTitle(existingAppointment.title);
        setClinicianId(String(existingAppointment.clinician_id));
        setAppointmentDate(`${yyyy}-${mm}-${dd}`);
        setAppointmentTime(`${hh}:${mins}`);
        setNotes(existingAppointment.notes || '');
      } else {
        setTitle('Follow-up Consultation');
        setClinicianId(String(patient.primary_clinician_id || ''));
        setAppointmentDate('');
        setAppointmentTime('');
        setNotes('');
      }
    }
  }, [open, existingAppointment, patient]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!title || !clinicianId || !appointmentDate || !appointmentTime) {
      return;
    }

    const [h, m] = appointmentTime.split(':');
    const combinedDateTime = new Date(appointmentDate);
    combinedDateTime.setHours(parseInt(h, 10), parseInt(m, 10));

    setIsSubmitting(true);
    try {
      await onSave({
        id: existingAppointment?.id,
        title,
        clinician_id: Number(clinicianId),
        appointment_date: combinedDateTime.toISOString(),
        notes,
      });
      onOpenChange(false);
    } catch (error) {
      // The parent component will show a toast notification.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SlideOver open={open} onOpenChange={onOpenChange}>
      <SlideOverContent className="w-[520px] max-w-[calc(100vw-2rem)] p-0 flex flex-col">
        <SlideOverHeader className="form-header-bar flex items-center justify-between px-4 py-3">
          <SlideOverTitle>
            {existingAppointment ? 'Edit Appointment' : 'Schedule Appointment'}
          </SlideOverTitle>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {patient.first_name}
          </span>
        </SlideOverHeader>
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            <div className="space-y-1.5">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="clinicianId">Clinician</Label>
              <Select
                value={clinicianId}
                onValueChange={setClinicianId}
                required
              >
                <SelectTrigger id="clinicianId">
                  <SelectValue placeholder="Select a clinician" />
                </SelectTrigger>
                <SelectContent>
                  {clinicians.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="appointmentDate">Date</Label>
                <Input
                  id="appointmentDate"
                  type="date"
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="appointmentTime">Time</Label>
                <Input
                  id="appointmentTime"
                  type="time"
                  value={appointmentTime}
                  onChange={(e) => setAppointmentTime(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-24"
              />
            </div>
          </div>
          <div className="form-footer-bar flex justify-end gap-2 border-t px-4 py-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !title || !clinicianId || !appointmentDate || !appointmentTime}
            >
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save Appointment
            </Button>
          </div>
        </form>
      </SlideOverContent>
    </SlideOver>
  );
}
