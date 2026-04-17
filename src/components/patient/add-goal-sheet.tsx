'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ClinicalParameter, Goal } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

export default function AddGoalSheet({
  trigger,
  onSave,
  clinicalParameters,
  existingGoal,
  disabled = false,
}: {
  trigger: React.ReactNode;
  onSave: (goal: Omit<Goal, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => void;
  clinicalParameters: ClinicalParameter[];
  existingGoal?: Goal | null;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [clinicalParameterId, setClinicalParameterId] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetOperator, setTargetOperator] = useState<'<' | '<=' | '=' | '>=' | '>'>('<=');
  const [notes, setNotes] = useState('');
  const [deadline, setDeadline] = useState('');
  const { toast } = useToast();

  const selectedParameter = useMemo(
    () => clinicalParameters.find((p) => p.id.toString() === clinicalParameterId),
    [clinicalParameters, clinicalParameterId]
  );

  useEffect(() => {
    if (!open) return;
    if (existingGoal) {
      const safeDeadline = existingGoal.deadline ? new Date(existingGoal.deadline).toISOString().split('T')[0] : '';
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
  }, [existingGoal, open]);

  const renderTargetInput = () => {
    if (!selectedParameter) {
      return <Input disabled readOnly value="" className="h-10" />;
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
            className="h-10"
          />
        );
      case 'choice':
        return (
          <Select onValueChange={setTargetValue} value={targetValue ?? ''} required>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedParameter.options?.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
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
            className="h-10"
          />
        );
    }
  };

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
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={disabled}>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] p-0 sm:w-[420px] sm:max-w-md">
        <SheetHeader className="px-4 py-3 border-b">
          <SheetTitle>{existingGoal ? 'Edit Goal' : 'Add Goal'}</SheetTitle>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 p-4">
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Parameter</Label>
                <Select onValueChange={setClinicalParameterId} value={clinicalParameterId} required>
                    <SelectTrigger className="h-10">
                        <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                    {clinicalParameters.map((p) => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} {p.unit ? `(${p.unit})` : ''}
                        </SelectItem>
                    ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Target</Label>
                {renderTargetInput()}
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Operator</Label>
                <Select onValueChange={(v) => setTargetOperator(v as any)} value={targetOperator}>
                    <SelectTrigger className="h-10">
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

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Deadline</Label>
                <Input
                    id="deadline"
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    required
                    className="h-10"
                />
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Notes</Label>
                <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-24" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex justify-end gap-2">
                <SheetClose asChild>
                    <Button type="button" variant="outline">
                        Cancel
                    </Button>
                </SheetClose>
                <Button type="submit">
                    Save
                </Button>
            </div>
        </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
