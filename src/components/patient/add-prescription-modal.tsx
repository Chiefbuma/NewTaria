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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{existingPrescription ? 'Edit' : 'Add'} Prescription</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="medication_id">Medication</Label>
              <Select value={String(formData.medication_id)} onValueChange={(value) => handleSelectChange('medication_id', value)} required>
                <SelectTrigger><SelectValue placeholder="Select Medication" /></SelectTrigger>
                <SelectContent>
                  {medications.map(m => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="dosage">Dosage</Label>
                <Input id="dosage" value={formData.dosage} onChange={handleInputChange} placeholder="e.g., 500mg" required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="frequency">Frequency</Label>
                <Input id="frequency" value={formData.frequency} onChange={handleInputChange} placeholder="e.g., Twice daily" required />
            </div>
             <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleSelectChange('status', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="discontinued">Discontinued</SelectItem>
                    </SelectContent>
                </Select>
            </div>
            <div className="space-y-2">
                <Label htmlFor="start_date">Start Date</Label>
                <Input id="start_date" type="date" value={formData.start_date} onChange={handleInputChange} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="expiry_date">Expiry Date</Label>
                <Input id="expiry_date" type="date" value={formData.expiry_date || ''} onChange={handleInputChange} />
            </div>
             <div className="space-y-2 md:col-span-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea id="notes" value={formData.notes || ''} onChange={handleInputChange} placeholder="e.g., Take with food" />
            </div>
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
