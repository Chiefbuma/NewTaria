
'use client';

import { useState, useEffect } from 'react';
import type { Medication } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

export default function MedicationManagement() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMed, setCurrentMed] = useState<Partial<Medication> | null>(null);
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
  const handleOpenModal = (med?: Medication) => {
    setCurrentMed(med || { name: '', dosage: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentMed?.name) return;
    
    setIsSubmitting(true);
    try {
        const method = currentMed.id ? 'PUT' : 'POST';
        const res = await fetch('/api/medications', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentMed)
        });
        
        if (!res.ok) throw new Error('Failed to save medication');
        const saved = await res.json();

        if (currentMed.id) {
            setMedications(prev => prev.map(m => m.id === saved.id ? saved : m));
        } else {
            setMedications(prev => [saved, ...prev]);
        }
        
        toast({ title: 'Success', description: 'Medication saved successfully.' });
        setIsModalOpen(false);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsSubmitting(false);
    }
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
    {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && "indeterminate")}
            onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    { accessorKey: "name", header: "Name" },
    { accessorKey: "dosage", header: "Default Dosage" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(row.original)}><Edit className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => handleDelete(row.original.id)}><Trash2 className="h-4 w-4" /></Button>
            </div>
        )
    }
  ];

  const toolbarActions = (
    <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 shadow-sm">
      <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
    </Button>
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
          <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
          <DataTable columns={columns} data={medications} toolbarActions={toolbarActions} />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentMed?.id ? 'Edit' : 'Add'} Medication</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 py-4">
              <InlineField label="Medication Name" htmlFor="name">
                <Input id="name" value={currentMed?.name || ''} onChange={(e) => setCurrentMed(p => ({...p!, name: e.target.value}))} required />
              </InlineField>
              <InlineField label="Typical Dosage" htmlFor="dosage">
                <Input id="dosage" value={currentMed?.dosage || ''} onChange={(e) => setCurrentMed(p => ({...p!, dosage: e.target.value}))} />
              </InlineField>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Medication
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

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
