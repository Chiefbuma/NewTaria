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

export default function AddAssessmentModal({ isOpen, onClose, onSave, parameter, existingAssessment, allParameters }: AddAssessmentModalProps) {
  const [selectedParamId, setSelectedParamId] = useState<string | undefined>(parameter?.id.toString());
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().slice(0, 10)); // Default to date only
  const { toast } = useToast();

  const selectedParameter = allParameters?.find(p => p.id.toString() === selectedParamId) || parameter;

  useEffect(() => {
    if (existingAssessment) {
        setSelectedParamId(existingAssessment.clinical_parameter_id.toString());
        setValue(existingAssessment.value);
        setNotes(existingAssessment.notes || '');
        setMeasuredAt(new Date(existingAssessment.measured_at).toISOString().slice(0, 10));
    } else if (parameter) {
        setSelectedParamId(parameter.id.toString());
        setValue('');
        setNotes('');
        setMeasuredAt(new Date().toISOString().slice(0, 10));
    }
  }, [existingAssessment, parameter, isOpen]); // Rerun on open

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
        measured_at: new Date(measuredAt).toISOString(),
        is_normal: null // This can be calculated on the backend or based on ranges
    });
  };

  const renderInput = () => {
    if (!selectedParameter) return null;

    switch (selectedParameter.type) {
      case 'numeric':
        return <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} required />;
      case 'text':
        return <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required />;
      case 'choice':
        return (
          <Select onValueChange={setValue} value={value} required>
            <SelectTrigger>
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
        return <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingAssessment ? 'Edit' : 'Add'} Assessment for {selectedParameter?.name || '...'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4 py-4">
             {!parameter && allParameters && (
                <div className="space-y-2">
                    <Label htmlFor="parameter">Parameter</Label>
                     <Select onValueChange={setSelectedParamId} value={selectedParamId}>
                        <SelectTrigger id="parameter">
                            <SelectValue placeholder="Select a clinical parameter" />
                        </SelectTrigger>
                        <SelectContent>
                            {allParameters.map(p => (
                                <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
            {selectedParamId && (
                <>
                    <div className="space-y-2">
                        <Label htmlFor="value">Value {selectedParameter?.unit ? `(${selectedParameter.unit})` : ''}</Label>
                        {renderInput()}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="notes">Notes</Label>
                        <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="measuredAt">Date of Assessment</Label>
                        <Input id="measuredAt" type="date" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} required />
                    </div>
                </>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit">Save Assessment</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
