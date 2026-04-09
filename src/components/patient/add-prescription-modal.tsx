'use client';

import { useState, useEffect } from 'react';
import type { Prescription, Medication } from '@/lib/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface AddPrescriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (prescription: Omit<Prescription, 'id' | 'patient_id'> & { id?: number }) => void;
  medications: Medication[];
  existingPrescription?: Prescription | null;
}

const emptyPrescription: Omit<Prescription, 'id' | 'patient_id' | 'medication'> = {
    medication_id: 0,
    dosage: '',
    frequency: '',
    start_date: new Date().toISOString().split('T')[0],
    expiry_date: null,
    notes: null,
    status: 'active',
};

export default function AddPrescriptionModal({ isOpen, onClose, onSave, medications, existingPrescription }: AddPrescriptionModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState(emptyPrescription);

  useEffect(() => {
    if (isOpen) {
        if (existingPrescription) {
            setFormData({
                ...existingPrescription,
                start_date: new Date(existingPrescription.start_date).toISOString().split('T')[0],
                expiry_date: existingPrescription.expiry_date ? new Date(existingPrescription.expiry_date).toISOString().split('T')[0] : null,
            });
        } else {
            setFormData(emptyPrescription);
        }
    }
  }, [existingPrescription, isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.id]: e.target.value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.medication_id || !formData.dosage || !formData.frequency) {
      toast({ variant: 'destructive', title: 'Error', description: 'Medication, Dosage, and Frequency are required.' });
      return;
    }
    
    onSave({
        ...existingPrescription,
        ...formData,
        medication_id: Number(formData.medication_id)
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingPrescription ? 'Edit' : 'Add'} Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            <InlineField label="Medication" htmlFor="medication_id">
              <Select value={String(formData.medication_id)} onValueChange={(value) => handleSelectChange('medication_id', value)} required>
                <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {medications.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </InlineField>
            <InlineField label="Dosage" htmlFor="dosage">
                <Input id="dosage" className="h-8" value={formData.dosage} onChange={handleInputChange} required />
            </InlineField>
            <InlineField label="Frequency" htmlFor="frequency">
                <Input id="frequency" className="h-8" value={formData.frequency} onChange={handleInputChange} required />
            </InlineField>
            <InlineField label="Status" htmlFor="status">
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                </Select>
            </InlineField>
            <InlineField label="Start Date" htmlFor="start_date">
                <Input id="start_date" type="date" className="h-8" value={formData.start_date} onChange={handleInputChange} required />
            </InlineField>
            <InlineField label="Expiry Date" htmlFor="expiry_date">
                <Input id="expiry_date" type="date" className="h-8" value={formData.expiry_date || ''} onChange={handleInputChange} />
            </InlineField>
            <InlineField label="Notes" htmlFor="notes" alignStart>
                <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} className="min-h-20" />
            </InlineField>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
            <Button type="submit">Save Prescription</Button>
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
