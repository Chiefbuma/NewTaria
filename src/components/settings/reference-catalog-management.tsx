'use client';

import type React from 'react';
import { useState } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Edit, Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  const [confirmAction, setConfirmAction] = useState<null | (() => Promise<void>)>(null);
  const [confirmTitle, setConfirmTitle] = useState('');
  const [confirmDescription, setConfirmDescription] = useState('');
  const { toast } = useToast();

  const applySavedItem = (saved: T) => {
    setItems((prev) => {
      const exists = prev.some((item) => item.id === saved.id);
      return exists ? prev.map((item) => (item.id === saved.id ? saved : item)) : [saved, ...prev];
    });
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

  const columns: ColumnDef<T>[] = [
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
          <ReferenceItemUpsertPopover
            singularLabel={singularLabel}
            fields={fields}
            saveItem={saveItem}
            item={row.original}
            onSaved={(saved) => {
              applySavedItem(saved);
              toast({ title: `${singularLabel} saved`, description: `${singularLabel} is ready to use in onboarding.` });
            }}
            trigger={
              <Button variant="ghost" size="icon">
                <Edit className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
            }
          />
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
    <ReferenceItemUpsertPopover
      singularLabel={singularLabel}
      fields={fields}
      saveItem={saveItem}
      item={null}
      onSaved={(saved) => {
        applySavedItem(saved);
        toast({ title: `${singularLabel} saved`, description: `${singularLabel} is ready to use in onboarding.` });
      }}
      trigger={
        <Button className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> {addLabel}
        </Button>
      }
    />
  );

  return (
    <div className="space-y-4">
      <DataTable columns={columns} data={items} toolbarActions={toolbarActions} />

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

function ReferenceItemUpsertPopover<T extends { id: number }>({
  trigger,
  item,
  fields,
  singularLabel,
  saveItem,
  onSaved,
}: {
  trigger: React.ReactNode;
  item: T | null;
  fields: TextField[];
  singularLabel: string;
  saveItem: (data: Partial<T>) => Promise<T>;
  onSaved: (saved: T) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [draft, setDraft] = useState<Partial<T>>({});

  const title = item?.id ? `Edit ${singularLabel}` : `Add ${singularLabel}`;

  return (
    <Popover
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) {
          setDraft(item ? ({ ...item } as Partial<T>) : ({} as Partial<T>));
        }
      }}
    >
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] max-h-[85vh] overflow-y-auto p-0 sm:w-[520px] sm:max-w-xl"
      >
        <div className="overflow-hidden rounded-2xl border border-border/70 bg-background shadow-[0_24px_55px_-34px_rgba(15,23,42,0.28)]">
          <div className="form-header-bar flex items-center justify-between px-4 py-3">
            <p className="text-sm font-bold">{title}</p>
            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Setup</span>
          </div>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const missing = fields.find((f) => f.required && !String(draft?.[f.key as keyof T] ?? '').trim());
              if (missing) {
                toast({ variant: 'destructive', title: 'Missing field', description: `${missing.label} is required.` });
                return;
              }
              try {
                setIsSubmitting(true);
                const saved = await saveItem(draft);
                onSaved(saved);
                setOpen(false);
              } catch (err: any) {
                toast({ variant: 'destructive', title: 'Save failed', description: err?.message || 'Unable to save.' });
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div className="space-y-3 p-4">
              {fields.map((field) => (
                <InlineField key={field.key} label={field.label} htmlFor={field.key} alignStart={field.type === 'textarea'}>
                  {field.type === 'textarea' ? (
                    <Textarea
                      id={field.key}
                      value={String(draft?.[field.key as keyof T] ?? '')}
                      onChange={(event) => setDraft((prev) => ({ ...(prev || {}), [field.key]: event.target.value }))}
                      required={field.required}
                      className="min-h-20"
                    />
                  ) : (
                    <Input
                      id={field.key}
                      value={String(draft?.[field.key as keyof T] ?? '')}
                      onChange={(event) => setDraft((prev) => ({ ...(prev || {}), [field.key]: event.target.value }))}
                      required={field.required}
                      className="h-8"
                    />
                  )}
                </InlineField>
              ))}
            </div>
            <div className="flex justify-end gap-2 border-t border-border/70 bg-muted/20 px-4 py-3">
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
            </div>
          </form>
        </div>
      </PopoverContent>
    </Popover>
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
