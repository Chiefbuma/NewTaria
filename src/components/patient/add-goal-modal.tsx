
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

    const selectedParameter = clinicalParameters.find(p => p.id.toString() === clinicalParameterId);

    useEffect(() => {
        if (existingGoal) {
            setClinicalParameterId(existingGoal.clinical_parameter_id.toString());
            setTargetValue(existingGoal.target_value);
            setTargetOperator(existingGoal.target_operator);
            setNotes(existingGoal.notes || '');
            setDeadline(new Date(existingGoal.deadline).toISOString().split('T')[0]);
            setStatus(existingGoal.status);
        } else {
            setClinicalParameterId('');
            setTargetValue('');
            setTargetOperator('<=');
            setNotes('');
            setDeadline('');
            setStatus('active');
        }
    }, [existingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalParameterId) return;
    
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

  const renderTargetInput = () => {
    if (!selectedParameter) return <Input disabled placeholder="Select parameter first" />;

    switch (selectedParameter.type) {
      case 'numeric':
        return <Input type="number" step="any" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required className="border-primary/20" />;
      case 'choice':
        return (
          <Select onValueChange={setTargetValue} value={targetValue} required>
            <SelectTrigger className="border-primary/20">
              <SelectValue placeholder="Select target" />
            </SelectTrigger>
            <SelectContent>
              {selectedParameter.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input type="text" value={targetValue} onChange={(e) => setTargetValue(e.target.value)} required className="border-primary/20" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-primary/20">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold">{existingGoal ? 'Edit' : 'Add'} Patient Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="parameter" className="font-bold">Parameter</Label>
              <Select onValueChange={setClinicalParameterId} value={clinicalParameterId} required>
                <SelectTrigger id="parameter" className="border-primary/20">
                  <SelectValue placeholder="Select from clinical parameters" />
                </SelectTrigger>
                <SelectContent>
                  {clinicalParameters.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} {p.unit ? `(${p.unit})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="operator" className="font-bold">Operator</Label>
                    <Select onValueChange={(v) => setTargetOperator(v as any)} value={targetOperator}>
                        <SelectTrigger id="operator" className="border-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="=">Equal to</SelectItem>
                            <SelectItem value="<=">At or below</SelectItem>
                            <SelectItem value="<">Below</SelectItem>
                            <SelectItem value=">=">At or above</SelectItem>
                             <SelectItem value=">">Above</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="targetValue" className="font-bold">Target Value</Label>
                    {renderTargetInput()}
                </div>
            </div>

             <div className="space-y-2">
                <Label htmlFor="deadline" className="font-bold">Deadline</Label>
                <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="border-primary/20" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes" className="font-bold">Notes</Label>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="border-primary/20" />
            </div>

             <div className="space-y-2">
                <Label htmlFor="status" className="font-bold">Status</Label>
                <Select onValueChange={(v) => setStatus(v as any)} value={status}>
                    <SelectTrigger id="status" className="border-primary/20"><SelectValue /></SelectTrigger>
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
              <Button type="button" variant="outline" className="border-primary/20">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90">Save Goal</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
