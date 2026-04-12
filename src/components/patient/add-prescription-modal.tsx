'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Prescription, Medication } from '@/lib/types';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const emptyPrescription: Omit<Prescription, 'id' | 'patient_id' | 'medication'> = {
    medication_id: 0,
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: null,
    notes: null,
    status: 'active',
};

export default function AddPrescriptionModal({
  trigger,
  onSave,
  medications,
  existingPrescription,
  disabled = false,
  align = 'end',
}: {
  trigger: React.ReactNode;
  onSave: (prescription: Omit<Prescription, 'id' | 'patient_id'> & { id?: number }) => Promise<void> | void;
  medications: Medication[];
  existingPrescription?: Prescription | null;
  disabled?: boolean;
  align?: 'start' | 'center' | 'end';
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState(emptyPrescription);
  const frequencyOptions = [
    'Once daily',
    'Twice daily',
    'Three times daily',
    'Four times daily',
    'Every other day',
    'Weekly',
    'Monthly',
    'As needed',
  ] as const;

  const [frequencyChoice, setFrequencyChoice] = useState<string>('');
  const [customFrequency, setCustomFrequency] = useState<string>('');

  useEffect(() => {
    if (open) {
        if (existingPrescription) {
            const existingFrequency = (existingPrescription.frequency || '').trim();
            const known = frequencyOptions.includes(existingFrequency as any);
            setFrequencyChoice(existingFrequency ? (known ? existingFrequency : '__custom__') : '');
            setCustomFrequency(existingFrequency && !known ? existingFrequency : '');
            setFormData({
                ...existingPrescription,
                start_date: new Date(existingPrescription.start_date).toISOString().split('T')[0],
                expiry_date: existingPrescription.expiry_date ? new Date(existingPrescription.expiry_date).toISOString().split('T')[0] : null,
            });
        } else {
            setFrequencyChoice('');
            setCustomFrequency('');
            setFormData(emptyPrescription);
        }
    }
  }, [existingPrescription, open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalFrequency =
      frequencyChoice === '__custom__' ? customFrequency.trim() : frequencyChoice.trim();

    if (!formData.medication_id || !formData.dosage || !finalFrequency) {
      toast({ variant: 'destructive', title: 'Error', description: 'Medication, Dosage, and Frequency are required.' });
      return;
    }
    
    const payload = {
      ...existingPrescription,
      ...formData,
      frequency: finalFrequency,
      medication_id: Number(formData.medication_id),
    } satisfies Omit<Prescription, 'id' | 'patient_id'> & { id?: number };

    (async () => {
      try {
        setIsSubmitting(true);
        await onSave(payload);
        setOpen(false);
      } catch (err: any) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: err?.message || 'Failed to save prescription.',
        });
      } finally {
        setIsSubmitting(false);
      }
    })();
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled}>
        {trigger}
      </PopoverTrigger>
      <PopoverContent
        align={align}
        sideOffset={10}
        className="w-[520px] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-0"
      >
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_24px_55px_-34px_rgba(15,23,42,0.28)]">
          <div className="form-header-bar flex items-center justify-between px-4 py-3">
            <p className="text-sm font-bold">{existingPrescription ? 'Edit Prescription' : 'Add Prescription'}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Medication
            </span>
          </div>

          <form
            onSubmit={(e) => {
              if (isSubmitting) return;
              handleSubmit(e);
            }}
          >
            <div className="space-y-3 p-4">
              <InlineField label="Medication" htmlFor="medication_id">
                <Select
                  value={String(formData.medication_id)}
                  onValueChange={(value) => handleSelectChange('medication_id', value)}
                  required
                >
                  <SelectTrigger className="h-8">
                    <SelectValue placeholder="Select medication" />
                  </SelectTrigger>
                  <SelectContent>
                    {medications.map((m) => (
                      <SelectItem key={m.id} value={String(m.id)}>
                        {m.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InlineField>

              <InlineField label="Dosage" htmlFor="dosage">
                <Input id="dosage" className="h-8" value={formData.dosage} onChange={handleInputChange} required />
              </InlineField>

              <InlineField label="Frequency" htmlFor="frequency" alignStart>
                <div className="space-y-2">
                  <Select
                    value={frequencyChoice}
                    onValueChange={(value) => {
                      setFrequencyChoice(value);
                      if (value !== '__custom__') {
                        setCustomFrequency('');
                        setFormData((prev) => ({ ...prev, frequency: value }));
                      } else {
                        setFormData((prev) => ({ ...prev, frequency: '' }));
                      }
                    }}
                  >
                    <SelectTrigger className="h-8">
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencyOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                      <SelectItem value="__custom__">Other...</SelectItem>
                    </SelectContent>
                  </Select>
                  {frequencyChoice === '__custom__' ? (
                    <Input
                      id="frequency"
                      className="h-8"
                      placeholder="Enter frequency"
                      value={customFrequency}
                      onChange={(e) => setCustomFrequency(e.target.value)}
                      required
                    />
                  ) : null}
                </div>
              </InlineField>

              <InlineField label="Status" htmlFor="status">
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="discontinued">Discontinued</SelectItem>
                  </SelectContent>
                </Select>
              </InlineField>

              <InlineField label="Start Date" htmlFor="start_date">
                <Input
                  id="start_date"
                  type="date"
                  className="h-8"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  required
                />
              </InlineField>

              <InlineField label="Expiry Date" htmlFor="expiry_date">
                <Input
                  id="expiry_date"
                  type="date"
                  className="h-8"
                  value={formData.expiry_date || ''}
                  onChange={handleInputChange}
                />
              </InlineField>

              <InlineField label="Notes" htmlFor="notes" alignStart>
                <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} className="min-h-20" />
              </InlineField>
            </div>

            <div className="flex justify-end gap-2 border-t border-border/70 bg-muted/20 px-4 py-3">
              <Button type="button" variant="outline" className="h-8" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
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
