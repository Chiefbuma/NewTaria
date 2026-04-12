'use client';

import type React from 'react';
import { useState } from 'react';
import type { Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter, SheetTrigger } from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

interface PartnerManagementProps {
  initialPartners: Partner[];
  onPartnersUpdate: (updatedPartners: Partner[]) => void;
}

export default function PartnerManagement({ initialPartners, onPartnersUpdate }: PartnerManagementProps) {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const savePartner = async (data: Partial<Partner>): Promise<Partner> => {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/partners', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const payload = await res.json().catch(() => ({}));
      throw new Error(payload?.error || 'Failed to save payer.');
    }
    return res.json();
  };

  const applySavedPartner = (saved: Partner) => {
    setPartners((prev) => {
      const exists = prev.some((p) => p.id === saved.id);
      const updated = exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [saved, ...prev];
      onPartnersUpdate(updated);
      return updated;
    });
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
    { accessorKey: "name", header: "Payer Name" },
    {
        id: "actions",
        cell: ({ row }) => (
            <div className="flex justify-end gap-2">
                <PartnerUpsertSheet
                  partner={row.original}
                  savePartner={savePartner}
                  onSaved={(saved) => {
                    applySavedPartner(saved);
                    toast({ title: 'Success', description: 'Payer saved successfully.' });
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
    <PartnerUpsertSheet
      savePartner={savePartner}
      onSaved={(saved) => {
        applySavedPartner(saved);
        toast({ title: 'Success', description: 'Payer saved successfully.' });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Payer
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={partners} toolbarActions={toolbarActions} />

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

function PartnerUpsertSheet({
  trigger,
  partner,
  savePartner,
  onSaved,
}: {
  trigger: React.ReactNode;
  partner?: Partner;
  savePartner: (data: Partial<Partner>) => Promise<Partner>;
  onSaved: (saved: Partner) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');

  const title = partner?.id ? 'Edit Payer' : 'Add Payer';

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setName(partner?.name || '');
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
             {partner?.id ? 'Update the details for this payer.' : 'Add a new payer to the system.'}
          </SheetDescription>
        </SheetHeader>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (!name.trim()) return;
              try {
                setIsSubmitting(true);
                const saved = await savePartner({ id: partner?.id, name: name.trim() });
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Error', description: err?.message || 'Unable to save payer.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-3 p-4">
              <InlineField label="Payer Name" htmlFor="name">
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
