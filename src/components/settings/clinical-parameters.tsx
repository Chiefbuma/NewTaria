'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { ClinicalParameter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SlideOver, SlideOverContent } from '@/components/ui/slide-over';
import { SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { fetchClinicalParameters, upsertClinicalParameter, deleteClinicalParameter } from '@/lib/api-service';

interface ClinicalParametersProps {
  initialParameters: ClinicalParameter[];
  onParametersUpdate: (updatedParameters: ClinicalParameter[]) => void;
}

const emptyParameter: Omit<ClinicalParameter, 'id'> = {
  name: '',
  type: 'numeric',
  unit: '',
  options: [],
  category: 'vital_sign',
  allow_self_monitoring: false,
};

export default function ClinicalParameters({ initialParameters, onParametersUpdate }: ClinicalParametersProps) {
  const [parameters, setParameters] = useState<ClinicalParameter[]>(initialParameters);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const refreshParameters = async () => {
      setIsLoading(true);
      try {
          const data = await fetchClinicalParameters();
          setParameters(data);
          onParametersUpdate(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  const saveParameter = async (data: Partial<ClinicalParameter>) => {
    if (!data.name) throw new Error('Parameter name is required.');
    await upsertClinicalParameter(data);
    toast({ title: 'Success', description: 'Parameter saved to database.' });
    await refreshParameters();
  };
  
  const executeDelete = async (id: number) => {
      try {
          await deleteClinicalParameter(id);
          toast({ title: 'Success', description: 'Parameter deactivated.' });
          await refreshParameters();
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  }

  const handleDelete = (id: number) => {
      setConfirmTitle('Deactivate clinical parameter?');
      setConfirmDescription('This will soft-delete the parameter and hide it from active clinical setup lists.');
      setConfirmAction(() => () => executeDelete(id));
  }

  const columns: ColumnDef<ClinicalParameter>[] = [
    { accessorKey: "name", header: "Parameter", cell: ({ row }) => <span className="text-xs font-medium">{row.original.name}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-xs capitalize">{String(row.original.category).replace('_', ' ')}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="text-xs capitalize">{row.original.type}</span> },
    { accessorKey: "unit", header: "Unit", cell: ({ row }) => <span className="text-xs">{row.original.unit || '-'}</span> },
    {
      accessorKey: "allow_self_monitoring",
      header: "Self",
      cell: ({ row }) => (
        <span className="text-[11px] font-semibold text-muted-foreground">
          {row.original.allow_self_monitoring ? 'Yes' : 'No'}
        </span>
      ),
    },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <ClinicalParameterUpsertForm
                  parameter={row.original}
                  onSave={saveParameter}
                  trigger={
                    <Button variant="ghost" size="icon">
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                  }
                />
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        )
    }
  ];

  const toolbarActions = (
    <ClinicalParameterUpsertForm
      parameter={null}
      onSave={saveParameter}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Clinical Parameter
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <DataTable columns={columns} data={parameters} toolbarActions={toolbarActions} />
        )}

      <ConfirmActionDialog
        open={Boolean(confirmAction)}
        onOpenChange={(open) => {
          if (!open) {
            setConfirmAction(null);
            setConfirmTitle('');
            setConfirmDescription('');
          }
        }}
        title={confirmTitle}
        description={confirmDescription}
        confirmLabel="Deactivate"
        onConfirm={async () => {
          await confirmAction?.();
        }}
      />
    </div>
  );
}

function ClinicalParameterUpsertForm({
  trigger,
  parameter,
  onSave,
}: {
  trigger: React.ReactNode;
  parameter: ClinicalParameter | null;
  onSave: (data: Partial<ClinicalParameter>) => Promise<void>;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<Partial<ClinicalParameter>>({ ...emptyParameter });
  const [optionsText, setOptionsText] = useState('');

  const title = parameter?.id ? 'Edit Clinical Parameter' : 'Add Clinical Parameter';

  return (
    <SlideOver
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          const initial = parameter ? { ...parameter } : { ...emptyParameter };
          setDraft(initial);
          setOptionsText(Array.isArray(initial.options) ? initial.options.join(', ') : '');
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SlideOverContent
        className="h-full w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex flex-col p-0 sm:w-[520px] sm:max-w-xl"
      >
        <SheetHeader className="px-4 py-3">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <div className="p-4 flex-1">
          <form
            className="border rounded-md flex flex-col h-full overflow-hidden"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!draft.name?.trim()) {
                toast({ variant: 'destructive', title: 'Error', description: 'Parameter name is required.' });
                return;
              }
              try {
                setIsSubmitting(true);
                const payload: Partial<ClinicalParameter> = {
                  ...draft,
                  id: parameter?.id,
                  name: draft.name.trim(),
                  unit: draft.unit ? String(draft.unit) : '',
                  options:
                    draft.type === 'choice'
                      ? optionsText
                          .split(',')
                          .map((opt) => opt.trim())
                          .filter(Boolean)
                      : [],
                };
                await onSave(payload);
                setOpen(false);
              } catch (err: any) {
                toast({
                  variant: 'destructive',
                  title: 'Error',
                  description: err?.message || 'Unable to save parameter.',
                });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="p-4 flex-1 overflow-y-auto space-y-3">
              <InlineField label="Parameter Name" htmlFor="name">
                <Input
                  id="name"
                  value={draft.name || ''}
                  onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                  className="h-8"
                  required
                />
              </InlineField>

              <InlineField label="Type" htmlFor="type">
                <Select
                  value={String(draft.type || 'numeric')}
                  onValueChange={(value) => setDraft((p) => ({ ...p, type: value as any }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="numeric">Numeric</SelectItem>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="choice">Choice</SelectItem>
                    <SelectItem value="image">Image / Photo</SelectItem>
                    <SelectItem value="voice">Voice Note</SelectItem>
                  </SelectContent>
                </Select>
              </InlineField>

              <InlineField label="Category" htmlFor="category">
                <Select
                  value={String(draft.category || 'vital_sign')}
                  onValueChange={(value) => setDraft((p) => ({ ...p, category: value as any }))}
                >
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vital_sign">Vital Sign</SelectItem>
                    <SelectItem value="lab_result">Lab Result</SelectItem>
                    <SelectItem value="clinical_measurement">Clinical Measurement</SelectItem>
                    <SelectItem value="assessment">Assessment</SelectItem>
                  </SelectContent>
                </Select>
              </InlineField>

              <InlineField label="Self Monitor" htmlFor="allow_self_monitoring">
                <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 bg-muted/10 px-3 py-2">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">Allow member self check-ins</p>
                    <p className="text-[11px] text-muted-foreground">
                      If enabled, members can submit this parameter from their portal.
                    </p>
                  </div>
                  <Switch
                    id="allow_self_monitoring"
                    checked={Boolean(draft.allow_self_monitoring)}
                    onCheckedChange={(checked) => setDraft((p) => ({ ...p, allow_self_monitoring: checked }))}
                  />
                </div>
              </InlineField>

              {draft.type === 'numeric' ? (
                <InlineField label="Unit" htmlFor="unit">
                  <Input
                    id="unit"
                    value={draft.unit || ''}
                    onChange={(e) => setDraft((p) => ({ ...p, unit: e.target.value }))}
                    className="h-8"
                  />
                </InlineField>
              ) : null}

              {draft.type === 'choice' ? (
                <InlineField label="Options" htmlFor="options">
                  <Input
                    id="options"
                    value={optionsText}
                    onChange={(e) => setOptionsText(e.target.value)}
                    placeholder="e.g. Low, Medium, High"
                    className="h-8"
                  />
                </InlineField>
              ) : null}
            </div>

            <SheetFooter className="px-4 py-3 bg-muted/20 border-t">
              <Button type="button" variant="outline" className="h-8" onClick={() => setOpen(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" className="h-8 bg-primary text-primary-foreground hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                  </>
                ) : (
                  'Save'
                )}
              </Button>
            </SheetFooter>
          </form>
        </div>
      </SlideOverContent>
    </SlideOver>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[132px_minmax(0,1fr)] items-center gap-3">
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
