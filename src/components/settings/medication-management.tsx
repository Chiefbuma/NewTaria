'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Medication } from '@/lib/types';
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

export default function MedicationManagement() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const loadMedications = async () => {
      try {
          const res = await fetch('/api/medications');
          const data = await res.json();
          setMedications(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => { loadMedications(); }, []);

  const saveMedication = async (data: Partial<Medication>): Promise<Medication> => {
    if (!data.name) throw new Error('Medication name is required.');
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/medications', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to save medication.');
    }
    return res.json();
  };

  const applySavedMedication = (saved: Medication) => {
    setMedications((prev) => {
      const exists = prev.some((m) => m.id === saved.id);
      return exists ? prev.map((m) => (m.id === saved.id ? saved : m)) : [saved, ...prev];
    });
  };

  const executeDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          setMedications(prev => prev.filter(m => m.id !== id));
          toast({ title: 'Success', description: 'Medication deactivated.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  };

  const handleDelete = (id: number) => {
      setConfirmTitle('Deactivate medication?');
      setConfirmDescription('This will soft-delete the medication and remove it from active medication catalogs.');
      setConfirmAction(() => () => executeDelete(id));
  };

  const columns: ColumnDef<Medication>[] = [
    { accessorKey: "name", header: "Name" },
    { accessorKey: "dosage", header: "Default Dosage" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <MedicationUpsertForm
                  medication={row.original}
                  saveMedication={saveMedication}
                  onSaved={(saved) => {
                    applySavedMedication(saved);
                    toast({ title: 'Success', description: 'Medication saved successfully.' });
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
    <MedicationUpsertForm
      saveMedication={saveMedication}
      onSaved={(saved) => {
        applySavedMedication(saved);
        toast({ title: 'Success', description: 'Medication saved successfully.' });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <DataTable columns={columns} data={medications} toolbarActions={toolbarActions} />
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

function MedicationUpsertForm({
  trigger,
  medication,
  saveMedication,
  onSaved,
}: {
  trigger: React.ReactNode;
  medication?: Medication;
  saveMedication: (data: Partial<Medication>) => Promise<Medication>;
  onSaved: (saved: Medication) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');

  const title = medication?.id ? 'Edit Medication' : 'Add Medication';

  return (
    <SlideOver
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(medication?.name || '');
          setDosage(medication?.dosage || '');
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
              if (!name.trim()) return;
              try {
                setIsSubmitting(true);
                const saved = await saveMedication({
                  id: medication?.id,
                  name: name.trim(),
                  dosage: dosage.trim(),
                });
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save medication.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-3 p-4">
              <InlineField label="Medication Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8" required />
              </InlineField>
              <InlineField label="Typical Dosage" htmlFor="dosage">
                <Input id="dosage" value={dosage} onChange={(e) => setDosage(e.target.value)} className="h-8" />
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
'''