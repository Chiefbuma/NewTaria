'use client';

import { useState, useEffect } from 'react';
import type { Appointment, Patient, User } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (appointment: Omit<Appointment, 'id' | 'patient_id'> & { id?: number }) => void;
  patient: Patient;
  clinicians: User[];
  existingAppointment?: Appointment | null;
}

const getLocalDateTimeString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export default function AddAppointmentModal({ isOpen, onClose, onSave, patient, clinicians, existingAppointment }: AddAppointmentModalProps) {
  const { toast } = useToast();
  
  const getInitialState = () => {
      const defaultStartDate = new Date();
      defaultStartDate.setHours(defaultStartDate.getHours() + 1, 0, 0, 0); // Next hour
      const defaultEndDate = new Date(defaultStartDate.getTime() + 30 * 60000); // 30 mins later
      
      if (existingAppointment) {
          return {
              id: existingAppointment.id,
              title: existingAppointment.title,
              description: existingAppointment.description || '',
              clinician_id: String(existingAppointment.clinician_id),
              appointment_date: getLocalDateTimeString(new Date(existingAppointment.appointment_date)),
              end_date: existingAppointment.end_date ? getLocalDateTimeString(new Date(existingAppointment.end_date)) : '',
              status: existingAppointment.status,
          };
      }
      return {
          id: undefined,
          title: 'Follow-up',
          description: '',
          clinician_id: clinicians.length > 0 ? String(clinicians[0].id) : '',
          appointment_date: getLocalDateTimeString(defaultStartDate),
          end_date: getLocalDateTimeString(defaultEndDate),
          status: 'scheduled' as const,
      };
  };

  const [formData, setFormData] = useState(getInitialState());

  useEffect(() => {
    if (isOpen) {
        setFormData(getInitialState());
    }
  }, [isOpen, existingAppointment, clinicians]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.appointment_date || !formData.clinician_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Title, Clinician and Appointment Date are required.' });
      return;
    }
    
    onSave({
        id: formData.id,
        title: formData.title,
        description: formData.description,
        appointment_date: new Date(formData.appointment_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        clinician_id: Number(formData.clinician_id),
        status: formData.status,
        cancellation_reason: null,
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingAppointment ? 'Edit' : 'Schedule'} Appointment for {patient.first_name}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            <InlineField label="Title" htmlFor="title">
              <Input id="title" className="h-8" value={formData.title} onChange={handleInputChange} required />
            </InlineField>
            <InlineField label="Start Time" htmlFor="appointment_date">
                <Input id="appointment_date" type="datetime-local" className="h-8" value={formData.appointment_date} onChange={handleInputChange} required />
            </InlineField>
            <InlineField label="End Time" htmlFor="end_date">
                <Input id="end_date" type="datetime-local" className="h-8" value={formData.end_date} onChange={handleInputChange} />
            </InlineField>
            <InlineField label="Clinician" htmlFor="clinician_id">
                <Select value={String(formData.clinician_id)} onValueChange={(value) => handleSelectChange('clinician_id', value)} required>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                    {clinicians.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </InlineField>
            <InlineField label="Status" htmlFor="status">
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </InlineField>
            <InlineField label="Notes / Description" htmlFor="description" alignStart>
                <Textarea id="description" value={formData.description} onChange={handleInputChange} className="min-h-20" />
            </InlineField>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save Appointment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
  alignStart = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[132px_minmax(0,1fr)] gap-3 ${alignStart ? 'items-start' : 'items-center'}`}>
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
