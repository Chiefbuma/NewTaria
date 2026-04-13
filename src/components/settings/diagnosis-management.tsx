'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Diagnosis } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SlideOver, SlideOverContent } from '@/components/ui/slide-over';
import { SheetHeader, SheetTitle, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

export default function DiagnosisManagement() {
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const loadDiagnoses = async () => {
      try {
          const res = await fetch('/api/diagnoses');
          const data = await res.json();
          setDiagnoses(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => { loadDiagnoses(); }, []);

  const saveDiagnosis = async (data: Partial<Diagnosis>): Promise<Diagnosis> => {
    if (!data.name) throw new Error('Diagnosis name is required.');
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/diagnoses', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to save diagnosis.');
    }
    return res.json();
  };

  const applySavedDiagnosis = (saved: Diagnosis) => {
    setDiagnoses((prev) => {
      const exists = prev.some((d) => d.id === saved.id);
      return exists ? prev.map((d) => (d.id === saved.id ? saved : d)) : [saved, ...prev];
    });
  };

  const executeDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/diagnoses?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          setDiagnoses(prev => prev.filter(d => d.id !== id));
          toast({ title: 'Success', description: 'Diagnosis deactivated.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  };

  const handleDelete = (id: number) => {
      setConfirmTitle('Deactivate diagnosis?');
      setConfirmDescription('This will soft-delete the diagnosis and remove it from active diagnosis lists.');
      setConfirmAction(() => () => executeDelete(id));
  };

  const columns: ColumnDef<Diagnosis>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "code", header: "Code" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <DiagnosisUpsertForm
                  diagnosis={row.original}
                  saveDiagnosis={saveDiagnosis}
                  onSaved={(saved) => {
                    applySavedDiagnosis(saved);
                    toast({ title: 'Success', description: 'Diagnosis saved successfully.' });
                  }}
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
    <DiagnosisUpsertForm
      saveDiagnosis={saveDiagnosis}
      onSaved={(saved) => {
        applySavedDiagnosis(saved);
        toast({ title: 'Success', description: 'Diagnosis saved successfully.' });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Diagnosis
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <DataTable columns={columns} data={diagnoses} toolbarActions={toolbarActions} />
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

function DiagnosisUpsertForm({
  trigger,
  diagnosis,
  saveDiagnosis,
  onSaved,
}: {
  trigger: React.ReactNode;
  diagnosis?: Diagnosis;
  saveDiagnosis: (data: Partial<Diagnosis>) => Promise<Diagnosis>;
  onSaved: (saved: Diagnosis) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const title = diagnosis?.id ? 'Edit Diagnosis' : 'Add Diagnosis';

  return (
    <SlideOver
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(diagnosis?.name || '');
          setCode(diagnosis?.code || '');
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SlideOverContent
        className="h-full w-[440px] max-w-[calc(100vw-2rem)] overflow-y-auto p-0"
      >
        <SheetHeader className="px-4 py-3">
            <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
          <form
            className="flex flex-col"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim() || !code.trim()) return;
              try {
                setIsSubmitting(true);
                const saved = await saveDiagnosis({
                  id: diagnosis?.id,
                  name: name.trim(),
                  code: code.trim(),
                });
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save diagnosis.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-3 p-4">
              <InlineField label="Diagnosis Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8" required />
              </InlineField>
              <InlineField label="Diagnosis Code" htmlFor="code">
                <Input id="code" value={code} onChange={(e) => setCode(e.target.value)} className="h-8" required />
              </InlineField>
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
