'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Assessment, ClinicalParameter } from '@/lib/types';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const getLocalDateString = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

export default function AddAssessmentModal({
  trigger,
  onSave,
  parameter,
  existingAssessment,
  allParameters,
  disabled = false,
}: {
  trigger: React.ReactNode;
  onSave: (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => void;
  parameter: ClinicalParameter | null;
  existingAssessment?: Assessment | null;
  allParameters?: ClinicalParameter[];
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [selectedParamId, setSelectedParamId] = useState<string | undefined>(parameter?.id.toString());
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [measuredAt, setMeasuredAt] = useState(getLocalDateString(new Date()));
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const selectedParameter = useMemo(
    () => allParameters?.find((p) => p.id.toString() === selectedParamId) || parameter,
    [allParameters, parameter, selectedParamId]
  );

  const valueLabel =
    selectedParameter?.type === 'image'
      ? 'Photo'
      : selectedParameter?.type === 'voice'
      ? 'Voice Note'
      : `Value${selectedParameter?.unit ? ` (${selectedParameter.unit})` : ''}`;

  useEffect(() => {
    if (!open) return;
    if (existingAssessment) {
      setSelectedParamId(existingAssessment.clinical_parameter_id.toString());
      setValue(existingAssessment.value);
      setNotes(existingAssessment.notes || '');
      setMeasuredAt(getLocalDateString(new Date(existingAssessment.measured_at)));
      return;
    }
    if (parameter) {
      setSelectedParamId(parameter.id.toString());
    } else {
      setSelectedParamId(undefined);
    }
    setValue('');
    setNotes('');
    setMeasuredAt(getLocalDateString(new Date()));
  }, [existingAssessment, parameter, open]);

  const uploadFile = async (file: File, kind: 'image' | 'voice') => {
    const formData = new FormData();
    formData.set('kind', kind);
    formData.set('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: formData });
    if (!res.ok) {
      let msg = `Upload failed (${res.status})`;
      try {
        const data = await res.json();
        msg = data?.error || msg;
      } catch {
        /* ignore */
      }
      throw new Error(msg);
    }
    return res.json() as Promise<{ url: string }>;
  };

  const handleFileChange = async (file: File | null) => {
    if (!selectedParameter) return;
    if (!file) return;
    if (selectedParameter.type !== 'image' && selectedParameter.type !== 'voice') return;

    try {
      setIsUploading(true);
      const result = await uploadFile(file, selectedParameter.type);
      setValue(result.url);
      toast({ title: 'Uploaded', description: 'File attached.' });
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Upload failed',
        description: e?.message || 'Could not upload file.',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const renderInput = () => {
    if (!selectedParameter) return <Input disabled readOnly value="" className="h-8" />;

    switch (selectedParameter.type) {
      case 'numeric':
        return (
          <Input
            type="number"
            step="any"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            required
            className="h-8"
          />
        );
      case 'text':
        return <Textarea value={value} onChange={(e) => setValue(e.target.value)} required className="min-h-20" />;
      case 'choice':
        return (
          <Select onValueChange={setValue} value={value} required>
            <SelectTrigger className="h-8">
              <SelectValue placeholder="Select" />
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
      case 'image':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="image/*"
              capture="environment"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="h-9"
              disabled={isUploading}
            />
            {value ? (
              <div className="rounded-md border border-border/70 bg-muted/20 p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={value} alt="Uploaded assessment" className="max-h-48 w-full rounded object-contain" />
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Upload a photo (or use camera capture on mobile).
              </p>
            )}
          </div>
        );
      case 'voice':
        return (
          <div className="space-y-2">
            <Input
              type="file"
              accept="audio/*"
              capture="user"
              onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
              className="h-9"
              disabled={isUploading}
            />
            {value ? (
              <div className="rounded-md border border-border/70 bg-muted/20 p-2">
                <audio controls src={value} className="w-full" />
              </div>
            ) : (
              <p className="text-[11px] text-muted-foreground">
                Upload a voice note (or use microphone capture on mobile).
              </p>
            )}
          </div>
        );
      default:
        return <Input type="text" value={value} onChange={(e) => setValue(e.target.value)} required className="h-8" />;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isUploading) {
      toast({ variant: 'destructive', title: 'Please wait', description: 'File is still uploading.' });
      return;
    }
    if (!selectedParamId || !value) {
      toast({ variant: 'destructive', title: 'Error', description: 'Parameter and Value are required.' });
      return;
    }

    onSave({
      id: existingAssessment?.id,
      clinical_parameter_id: parseInt(selectedParamId, 10),
      value,
      notes,
      measured_at: measuredAt,
      is_normal: null,
    });
    setOpen(false);
  };

  const isMultiline = selectedParameter?.type === 'text' || selectedParameter?.type === 'image' || selectedParameter?.type === 'voice';

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild disabled={disabled}>
        {trigger}
      </SheetTrigger>
      <SheetContent className="w-[440px] max-w-[calc(100vw-2rem)]" side="right">
        <SheetHeader>
          <SheetTitle>{existingAssessment ? 'Edit Assessment' : 'Add Assessment'}</SheetTitle>
          <SheetDescription>
            Record a new clinical measurement for the patient.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-3 py-4">
            {!parameter && allParameters ? (
              <InlineField label="Parameter" htmlFor="parameter">
                <Select onValueChange={setSelectedParamId} value={selectedParamId}>
                  <SelectTrigger id="parameter" className="h-8">
                    <SelectValue placeholder="Select parameter" />
                  </SelectTrigger>
                  <SelectContent>
                    {allParameters.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name} {p.unit ? `(${p.unit})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </InlineField>
            ) : null}

            {selectedParamId ? (
              <>
                <InlineField label={valueLabel} htmlFor="value" alignStart={Boolean(isMultiline)}>
                  {renderInput()}
                </InlineField>
                <InlineField label="Notes" htmlFor="notes" alignStart>
                  <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} className="min-h-20" />
                </InlineField>
                <InlineField label="Date" htmlFor="measuredAt">
                  <Input
                    id="measuredAt"
                    type="date"
                    value={measuredAt}
                    onChange={(e) => setMeasuredAt(e.target.value)}
                    required
                    className="h-8"
                  />
                </InlineField>
              </>
            ) : null}
          </div>

          <SheetFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isUploading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isUploading}>
              Save
            </Button>
          </SheetFooter>
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
    <div className={cn('grid grid-cols-[132px_minmax(0,1fr)] gap-3', alignStart ? 'items-start' : 'items-center')}>
      <Label htmlFor={htmlFor} className={cn('text-right text-sm text-muted-foreground', alignStart ? 'pt-2' : '')}>
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
