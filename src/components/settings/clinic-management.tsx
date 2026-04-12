'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Clinic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

export default function ClinicManagement() {
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const loadClinics = async () => {
      try {
          const res = await fetch('/api/clinics');
          const data = await res.json();
          setClinics(data);
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => { loadClinics(); }, []);

  const saveClinic = async (data: Partial<Clinic>): Promise<Clinic> => {
    if (!data.name) throw new Error('Clinic name is required.');
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/clinics', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to save clinic.');
    }
    return res.json();
  };

  const applySavedClinic = (saved: Clinic) => {
    setClinics((prev) => {
      const exists = prev.some((c) => c.id === saved.id);
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [saved, ...prev];
    });
  };

  const executeDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/clinics?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          setClinics(prev => prev.filter(c => c.id !== id));
          toast({ title: 'Success', description: 'Clinic deactivated.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  };

  const handleDelete = (id: number) => {
      setConfirmTitle('Deactivate clinic?');
      setConfirmDescription('This will soft-delete the clinic and remove it from active clinic lists.');
      setConfirmAction(() => () => executeDelete(id));
  };

  const columns: ColumnDef<Clinic>[] = [
    { accessorKey: "name", header: "Name" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <ClinicUpsertSheet
                  clinic={row.original}
                  saveClinic={saveClinic}
                  onSaved={(saved) => {
                    applySavedClinic(saved);
                    toast({ title: 'Success', description: 'Clinic saved successfully.' });
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
    <ClinicUpsertSheet
      saveClinic={saveClinic}
      onSaved={(saved) => {
        applySavedClinic(saved);
        toast({ title: 'Success', description: 'Clinic saved successfully.' });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Clinic
        </Button>
      }
    />
  );

  return (
    <div className="flex gap-8 items-start">
        <div className="w-64 flex-shrink-0 space-y-4">
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                <p className="text-sm font-medium text-muted-foreground">Total Clinics</p>
                <p className="text-3xl font-bold tracking-tight">{clinics.length}</p>
            </div>
        </div>
        <div className="flex-1 space-y-4">
            {isLoading ? (
                <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : (
                <DataTable columns={columns} data={clinics} toolbarActions={toolbarActions} />
            )}
        </div>

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

function ClinicUpsertSheet({
  trigger,
  clinic,
  saveClinic,
  onSaved,
}: {
  trigger: React.ReactNode;
  clinic?: Clinic;
  saveClinic: (data: Partial<Clinic>) => Promise<Clinic>;
  onSaved: (saved: Clinic) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');

  const title = clinic?.id ? 'Edit Clinic' : 'Add Clinic';

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(clinic?.name || '');
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent
        className="w-[440px] max-w-[calc(100vw-2rem)] max-h-[85vh] overflow-y-auto p-0"
      >
        <SheetHeader className="px-4 py-3">
            <SheetTitle>{title}</SheetTitle>
            <SheetDescription>
                {clinic?.id ? 'Update the details for this clinic.' : 'Add a new clinic to the system.'}
            </SheetDescription>
        </SheetHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              try {
                setIsSubmitting(true);
                const saved = await saveClinic({ id: clinic?.id, name: name.trim() });
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save clinic.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-3 p-4">
              <InlineField label="Clinic Name" htmlFor="name">
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="h-8" required />
              </InlineField>
            </div>
            <SheetFooter className="px-4 py-3">
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
      </SheetContent>
    </Sheet>
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
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
