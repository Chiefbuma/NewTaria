
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
    if (!selectedParameter) return <Input disabled placeholder="Select a parameter first" />;

    switch (selectedParameter.type) {
      case 'numeric':
        return <Input type="number" step="any" value={value} onChange={(e) => setValue(e.target.value)} required className="border-primary/20" />;
      case 'text':
        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} required className="border-primary/20 min-h-[100px]" placeholder="Type assessment findings..." />;
      case 'choice':
        return (
          <Select onValueChange={setValue} value={value} required>
            <SelectTrigger className="border-primary/20">
              <SelectValue placeholder="Select an option" />
            </SelectTrigger>
            <SelectContent>
              {selectedParameter.options?.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      default:
        return <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required className="border-primary/20" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold text-xl">{existingAssessment ? 'Edit' : 'Add'} Assessment</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-5 py-4">
             {!parameter && allParameters && (
                <div className="space-y-2">
                    <Label htmlFor="parameter" className="font-bold">Clinical Parameter</Label>
                     <Select onValueChange={setSelectedParamId} value={selectedParamId}>
                        <SelectTrigger id="parameter" className="border-primary/20">
                            <SelectValue placeholder="Select a health metric" />
                        </SelectTrigger>
                        <SelectContent>
                            {allParameters.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name} {p.unit ? `(${p.unit})` : ''}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {selectedParamId && (
                <>
                    <div className="space-y-2">
                        <div className="flex justify-between items-end">
                            <Label htmlFor="value" className="font-bold text-foreground">Value {selectedParameter?.unit ? `(${selectedParameter.unit})` : ''}</Label>
                            <span className="text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 rounded">{selectedParameter?.type}</span>
                        </div>
                        {renderInput()}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes" className="font-bold text-foreground">Observations / Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="border-primary/20" placeholder="Optional clinical observations..." />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="measuredAt" className="font-bold text-foreground">Date & Time of Assessment</Label>
                        <Input id="measuredAt" type="datetime-local" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} required className="border-primary/20" />
                    </div>
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
