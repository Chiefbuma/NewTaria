'use client';

import type React from 'react';
import { useState, useEffect } from 'react';
import type { Clinic } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { SlideOver, SlideOverContent } from '@/components/ui/slide-over';
import { SheetHeader, SheetTitle, SheetFooter, SheetTrigger, SheetClose } from '@/components/ui/sheet';
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
    { accessorKey: "name", header: "Clinic Name" },
    { accessorKey: "location", header: "Location" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <ClinicUpsertForm
                  clinic={row.original}
                  saveClinic={saveClinic}
                  onSaved={(saved) => {
                    applySavedClinic(saved);
                    toast({ title: 'Success', description: 'Clinic saved successfully.' });
                  }}
                  trigger={
                    <Button variant="outline" size="sm">
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </Button>
                  }
                />
            </div>
        )
    }
  ];

  const toolbarActions = (
    <ClinicUpsertForm
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
    <div className="space-y-4">
        {isLoading ? (
            <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <DataTable columns={columns} data={clinics} toolbarActions={toolbarActions} />
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

function ClinicUpsertForm({
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
  const [location, setLocation] = useState('');

  const title = clinic?.id ? 'Edit Clinic' : 'Add Clinic';

  return (
    <SlideOver
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(clinic?.name || '');
          setLocation(clinic?.location || '');
        }
      }}
    >
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SlideOverContent className="h-full w-[440px] max-w-[calc(100vw-2rem)] p-0">
        <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        <form
            className="h-full flex flex-col"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              try {
                setIsSubmitting(true);
                const saved = await saveClinic({ id: clinic?.id, name: name.trim(), location: location.trim() });
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save clinic.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-1.5">
                <Label>Clinic Name</Label>
                <Input value={name} onChange={(e) => setName(e.target.value)} className="h-10" required />
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} className="h-10" />
              </div>
            </div>
            <SheetFooter className="px-4 py-3 bg-background border-t absolute bottom-0 left-0 right-0">
                <SheetClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting}>
                        Cancel
                    </Button>
                </SheetClose>
              <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving
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
