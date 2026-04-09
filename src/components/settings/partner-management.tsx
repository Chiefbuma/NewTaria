'use client';

import { useState } from 'react';
import type { Partner } from '@/lib/types';
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

interface PartnerManagementProps {
  initialPartners: Partner[];
  onPartnersUpdate: (updatedPartners: Partner[]) => void;
}

export default function PartnerManagement({ initialPartners, onPartnersUpdate }: PartnerManagementProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentPartner, setCurrentPartner] = useState<Partial<Partner> | null>(null);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (partner?: Partner) => {
    setCurrentPartner(partner || { name: '' });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPartner?.name) return;
    
    setIsSubmitting(true);
    try {
        const method = currentPartner.id ? 'PUT' : 'POST';
        const res = await fetch('/api/partners', {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(currentPartner)
        });
        
        if (!res.ok) throw new Error('Failed to save partner');
        const saved = await res.json();

        let updated;
        if (currentPartner.id) {
            updated = partners.map(p => p.id === saved.id ? saved : p);
        } else {
            updated = [saved, ...partners];
        }
        
        setPartners(updated);
        onPartnersUpdate(updated);
        toast({ title: 'Success', description: 'Payer saved successfully.' });
        setIsModalOpen(false);
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsSubmitting(false);
    }
  };

  const executeDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/partners?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete partner');
          const updated = partners.filter(p => p.id !== id);
          setPartners(updated);
          onPartnersUpdate(updated);
          toast({ title: 'Success', description: 'Payer deactivated.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  };

  const handleDelete = (id: number) => {
      setConfirmTitle('Deactivate payer?');
      setConfirmDescription('This will soft-delete the payer and remove it from active partner lists.');
      setConfirmAction(() => () => executeDelete(id));
  };

  const columns: ColumnDef<Partner>[] = [
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
    { accessorKey: "name", header: "Payer Name" },
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
      <PlusCircle className="mr-2 h-4 w-4" /> Add Payer
    </Button>
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={partners} toolbarActions={toolbarActions} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentPartner?.id ? 'Edit' : 'Add'} Payer</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 py-4">
              <InlineField label="Payer Name" htmlFor="name">
                <Input id="name" value={currentPartner?.name || ''} onChange={(e) => setCurrentPartner(p => ({...p!, name: e.target.value}))} required />
              </InlineField>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Payer
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
