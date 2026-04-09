'use client';

import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { useToast } from '@/hooks/use-toast';

type TextField = {
  key: string;
  label: string;
  type?: 'text' | 'textarea';
  required?: boolean;
};

type ReferenceCatalogManagementProps<T extends { id: number }> = {
  title: string;
  addLabel: string;
  singularLabel: string;
  initialItems: T[];
  fields: TextField[];
  saveItem: (data: Partial<T>) => Promise<T>;
  deleteItem: (id: number) => Promise<void>;
  bulkDeleteItems: (ids: number[]) => Promise<void>;
};

export default function ReferenceCatalogManagement<T extends { id: number }>({
  title,
  addLabel,
  singularLabel,
  initialItems,
  fields,
  saveItem,
  deleteItem,
}: ReferenceCatalogManagementProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems);
  const [currentItem, setCurrentItem] = useState<Partial<T> | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const handleOpenModal = (item?: T) => {
    setCurrentItem(item || ({} as Partial<T>));
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setCurrentItem(null);
    setIsModalOpen(false);
  };

  const executeDelete = async (id: number) => {
    try {
      await deleteItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      toast({ title: `${singularLabel} deactivated`, description: `${singularLabel} has been archived from system setup.` });
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Unable to deactivate', description: error.message });
    }
  };

  const handleDelete = (id: number) => {
    setConfirmTitle(`Deactivate ${singularLabel}?`);
    setConfirmDescription(`This will archive the ${singularLabel.toLowerCase()} and remove it from active system setup lists.`);
    setConfirmAction(() => () => executeDelete(id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentItem) return;

    setIsSubmitting(true);
    try {
      const saved = await saveItem(currentItem);
      setItems((prev) => {
        if (currentItem.id) {
          return prev.map((item) => (item.id === saved.id ? saved : item));
        }
        return [saved, ...prev];
      });
      toast({ title: `${singularLabel} saved`, description: `${singularLabel} is ready to use in onboarding.` });
      handleCloseModal();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Save failed', description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns: ColumnDef<T>[] = [
    {
      id: 'select',
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected() || (table.getIsSomePageRowsSelected() && 'indeterminate')}
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
    ...fields.map(
      (field) =>
        ({
          accessorKey: field.key,
          header: field.label,
          cell: ({ row }) => String(row.original[field.key as keyof T] ?? '-'),
        }) as ColumnDef<T>
    ),
    {
      id: 'actions',
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleOpenModal(row.original)}>
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10"
            onClick={() => handleDelete(row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const toolbarActions = (
    <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 shadow-sm">
      <PlusCircle className="mr-2 h-4 w-4" /> {addLabel}
    </Button>
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={items} toolbarActions={toolbarActions} />

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{currentItem?.id ? `Edit ${singularLabel}` : `Add ${singularLabel}`}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 py-4">
              {fields.map((field) => (
                <InlineField key={field.key} label={field.label} htmlFor={field.key} alignStart={field.type === 'textarea'}>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={String(currentItem?.[field.key as keyof T] ?? '')}
                      onChange={(event) =>
                        setCurrentItem((prev) => ({ ...(prev || {}), [field.key]: event.target.value }))
                      }
                      required={field.required}
                      className="min-h-20"
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={String(currentItem?.[field.key as keyof T] ?? '')}
                      onChange={(event) =>
                        setCurrentItem((prev) => ({ ...(prev || {}), [field.key]: event.target.value }))
                      }
                      required={field.required}
                    />
                  )}
                </InlineField>
              ))}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save {singularLabel}
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
  alignStart = false,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div className={`grid grid-cols-[132px_minmax(0,1fr)] gap-3 ${alignStart ? 'items-start' : 'items-center'}`}>
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
