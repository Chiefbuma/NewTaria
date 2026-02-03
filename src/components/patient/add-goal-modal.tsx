'use client';

import { useState, useEffect } from 'react';
import type { Goal, ClinicalParameter } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (goal: Omit<Goal, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => void;
  clinicalParameters: ClinicalParameter[];
  existingGoal?: Goal | null;
}

export default function AddGoalModal({ isOpen, onClose, onSave, clinicalParameters, existingGoal }: AddGoalModalProps) {
    const [clinicalParameterId, setClinicalParameterId] = useState('');
    const [targetValue, setTargetValue] = useState('');
    const [targetOperator, setTargetOperator] = useState<'<' | '<=' | '=' | '>=' | '>'>('<=');
    const [notes, setNotes] = useState('');
    const [deadline, setDeadline] = useState('');
    const [status, setStatus] = useState<'active' | 'completed' | 'cancelled'>('active');

    useEffect(() => {
        if (existingGoal) {
            setClinicalParameterId(existingGoal.clinical_parameter_id.toString());
            setTargetValue(existingGoal.target_value);
            setTargetOperator(existingGoal.target_operator);
            setNotes(existingGoal.notes || '');
            setDeadline(new Date(existingGoal.deadline).toISOString().split('T')[0]);
            setStatus(existingGoal.status);
        } else {
            // Reset form for new goal
            setClinicalParameterId('');
            setTargetValue('');
            setTargetOperator('<=');
            setNotes('');
            setDeadline('');
            setStatus('active');
        }
    }, [existingGoal]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalParameterId) {
        alert('Please select a parameter.');
        return;
    }
    
    onSave({
        id: existingGoal?.id,
        clinical_parameter_id: parseInt(clinicalParameterId),
        target_value: targetValue,
        target_operator: targetOperator,
        notes: notes,
        deadline: new Date(deadline).toISOString(),
        status: status,
    });
  };

  const numericParameters = clinicalParameters.filter(p => p.type === 'numeric');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingGoal ? 'Edit' : 'Add'} Patient Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parameter">Parameter</Label>
              <Select onValueChange={setClinicalParameterId} value={clinicalParameterId} required>
                <SelectTrigger id="parameter">
                  <SelectValue placeholder="Select a numeric parameter" />
                </SelectTrigger>
                <SelectContent>
                  {numericParameters.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="operator">Condition</Label>
                    <Select onValueChange={(v) => setTargetOperator(v as any)} value={targetOperator}>
                        <SelectTrigger id="operator">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="<=">Less than or equal to</SelectItem>
                            <SelectItem value="<">Less than</SelectItem>
                            <SelectItem value="=">Equal to</SelectItem>
                            <SelectItem value=">=">Greater than or equal to</SelectItem>
                             <SelectItem value=">">Greater than</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="targetValue">Target Value</Label>
                    <Input id="targetValue" type="number" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required />
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="deadline">Deadline</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>

             <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select onValueChange={(v) => setStatus(v as any)} value={status}>
                    <SelectTrigger id="status"><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
