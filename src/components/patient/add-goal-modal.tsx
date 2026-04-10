
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
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const selectedParameter = clinicalParameters.find((p) => p.id.toString() === clinicalParameterId);

  useEffect(() => {
    if (existingGoal) {
      const safeDeadline = existingGoal.deadline
        ? new Date(existingGoal.deadline).toISOString().split('T')[0]
        : '';

      setClinicalParameterId(existingGoal.clinical_parameter_id?.toString() ?? '');
      setTargetValue(existingGoal.target_value ?? '');
      setTargetOperator(existingGoal.target_operator ?? '<=');
      setNotes(existingGoal.notes ?? '');
      setDeadline(safeDeadline);
    } else {
      setClinicalParameterId('');
      setTargetValue('');
      setTargetOperator('<=');
      setNotes('');
      setDeadline('');
    }
  }, [existingGoal, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clinicalParameterId || !targetValue || !deadline) {
      toast({
        variant: 'destructive',
        title: 'Missing goal details',
        description: 'Parameter, target value, and deadline are required.',
      });
      return;
    }

    onSave({
      id: existingGoal?.id,
      clinical_parameter_id: parseInt(clinicalParameterId),
      target_value: targetValue,
      target_operator: targetOperator,
      notes,
      deadline: new Date(deadline).toISOString(),
      status: existingGoal?.status || 'active',
    });
  };

  const renderTargetInput = () => {
    if (!selectedParameter) {
      return <Input disabled readOnly value="" className="h-8 border-primary/20" />;
    }

    switch (selectedParameter.type) {
      case 'numeric':
        return (
          <Input
            type="number"
            step="any"
            value={targetValue ?? ''}
            onChange={(e) => setTargetValue(e.target.value)}
            required
            className="h-8 border-primary/20"
          />
        );
      case 'choice':
        return (
          <Select onValueChange={setTargetValue} value={targetValue ?? ''} required>
            <SelectTrigger className="h-8 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedParameter.options?.map((option) => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return (
          <Input
            type="text"
            value={targetValue ?? ''}
            onChange={(e) => setTargetValue(e.target.value)}
            required
            className="h-8 border-primary/20"
          />
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-primary/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{existingGoal ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            <InlineField label="Parameter" htmlFor="parameter">
              <Select onValueChange={setClinicalParameterId} value={clinicalParameterId} required>
                <SelectTrigger id="parameter" className="h-8 border-primary/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {clinicalParameters.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.name} {p.unit ? `(${p.unit})` : ''}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </InlineField>

            <InlineField label="Target Value" htmlFor="targetValue">
              {renderTargetInput()}
            </InlineField>

            <InlineField label="Operator" htmlFor="operator">
              <Select onValueChange={(v) => setTargetOperator(v as any)} value={targetOperator}>
                <SelectTrigger id="operator" className="h-8 border-primary/20">
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
            </InlineField>

            <InlineField label="Deadline" htmlFor="deadline">
              <Input id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} required className="h-8 border-primary/20" />
            </InlineField>

            <InlineField label="Notes" htmlFor="notes" alignStart>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-16 border-primary/20" />
            </InlineField>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-primary/20">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
              {existingGoal ? 'Update Goal' : 'Add Goal'}
            </Button>
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
    <div className={`grid grid-cols-[120px_minmax(0,1fr)] gap-3 ${alignStart ? 'items-start' : 'items-center'}`}>
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
