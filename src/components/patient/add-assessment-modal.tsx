
'use client';

import { useState, useEffect } from 'react';
import type { Assessment, ClinicalParameter } from '@/lib/types';
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

interface AddAssessmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'>) => void;
  parameter: ClinicalParameter | null;
  existingAssessment?: Assessment | null;
  allParameters?: ClinicalParameter[];
}

const getLocalDateTimeString = (date: Date) => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

export default function AddAssessmentModal({ isOpen, onClose, onSave, parameter, existingAssessment, allParameters }: AddAssessmentModalProps) {
  const [selectedParamId, setSelectedParamId] = useState<string | undefined>(parameter?.id.toString());
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [measuredAt, setMeasuredAt] = useState(getLocalDateTimeString(new Date()));
  const { toast } = useToast();

  const selectedParameter = allParameters?.find(p => p.id.toString() === selectedParamId) || parameter;

  useEffect(() => {
    if (existingAssessment) {
        setSelectedParamId(existingAssessment.clinical_parameter_id.toString());
        setValue(existingAssessment.value);
        setNotes(existingAssessment.notes || '');
        setMeasuredAt(getLocalDateTimeString(new Date(existingAssessment.measured_at)));
    } else if (parameter) {
        setSelectedParamId(parameter.id.toString());
        setValue('');
        setNotes('');
        setMeasuredAt(getLocalDateTimeString(new Date()));
    }
  }, [existingAssessment, parameter, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedParamId || !value) {
        toast({ variant: 'destructive', title: 'Error', description: 'Parameter and Value are required.'})
        return;
    }
    
    onSave({
        clinical_parameter_id: parseInt(selectedParamId, 10),
        value,
        notes,
        measured_at: measuredAt,
        is_normal: null 
    });
  };

  const renderInput = () => {
    if (!selectedParameter) return <Input disabled readOnly value="" className="h-8 border-primary/20" />;

    switch (selectedParameter.type) {
      case 'numeric':
        return <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required className="h-8 border-primary/20" />;
      case 'text':
        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} required className="border-primary/20 min-h-20" />;
      case 'choice':
        return (
          <Select onValueChange={setValue} value={value} required>
            <SelectTrigger className="h-8 border-primary/20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {selectedParameter.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required className="h-8 border-primary/20" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="border-primary/20 sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{existingAssessment ? 'Edit' : 'Add'} Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
             {!parameter && allParameters && (
                <InlineField label="Clinical Parameter" htmlFor="parameter">
                     <Select onValueChange={setSelectedParamId} value={selectedParamId}>
                        <SelectTrigger id="parameter" className="h-8 border-primary/20">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {allParameters.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name} {p.unit ? `(${p.unit})` : ''}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </InlineField>
            )}
            {selectedParamId && (
                <>
                    <InlineField label={`Value${selectedParameter?.unit ? ` (${selectedParameter.unit})` : ''}`} htmlFor="value" alignStart={selectedParameter?.type === 'text'}>
                        {renderInput()}
                    </InlineField>
                    <InlineField label="Observations / Notes" htmlFor="notes" alignStart>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="border-primary/20 min-h-20" />
                    </InlineField>
                    <InlineField label="Assessment Date" htmlFor="measuredAt">
                        <Input id="measuredAt" type="datetime-local" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} required className="h-8 border-primary/20" />
                    </InlineField>
                </>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="border-primary/20">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-primary hover:bg-primary/90">
                {existingAssessment ? 'Update Record' : 'Save Assessment'}
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
    <div className={`grid grid-cols-[132px_minmax(0,1fr)] gap-3 ${alignStart ? 'items-start' : 'items-center'}`}>
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
