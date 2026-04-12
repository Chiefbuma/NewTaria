'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ClinicalParameter, Goal } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
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
      return <Input disabled readOnly value="" className="h-8" />;
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
            className="h-8"
          />
        );
      case 'choice':
        return (
          <Select onValueChange={setTargetValue} value={targetValue ?? ''} required>
            <SelectTrigger className="h-8">
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
            className="h-8"
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
      <SheetContent className="w-[420px] max-w-[calc(100vw-2rem)] p-0">
        <SheetHeader className="form-header-bar flex items-center justify-between px-4 py-3">
          <SheetTitle>{existingGoal ? 'Edit Goal' : 'Add Goal'}</SheetTitle>
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Goal setup
          </span>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 p-4">
            <InlineField label="Parameter" htmlFor="parameter">
              <Select onValueChange={setClinicalParameterId} value={clinicalParameterId} required>
                <SelectTrigger id="parameter" className="h-8">
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
            </InlineField>

            <InlineField label="Target" htmlFor="targetValue">
              {renderTargetInput()}
            </InlineField>

            <InlineField label="Operator" htmlFor="operator">
              <Select onValueChange={(v) => setTargetOperator(v as any)} value={targetOperator}>
                <SelectTrigger id="operator" className="h-8">
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
              <Input
                id="deadline"
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                required
                className="h-8"
              />
            </InlineField>

            <InlineField label="Notes" htmlFor="notes" alignStart>
              <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-16" />
            </InlineField>
          </div>
          <div className="flex justify-end gap-2 border-t border-border/70 bg-muted/20 px-4 py-3">
            <Button type="button" variant="outline" className="h-8" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90">
              Save
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
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
    <div className={cn('grid grid-cols-[120px_minmax(0,1fr)] gap-3', alignStart ? 'items-start' : 'items-center')}>
      <Label htmlFor={htmlFor} className={cn('text-[11px] font-bold uppercase tracking-wider text-muted-foreground', alignStart ? 'pt-2' : null)}>
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
