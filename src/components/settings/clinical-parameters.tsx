
'use client';

import { useState, useEffect } from 'react';
import type { ClinicalParameter } from '@/lib/types';
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
import { Checkbox } from "@/components/ui/checkbox";
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
  category: 'vital_sign'
};

export default function ClinicalParameters({ initialParameters, onParametersUpdate }: ClinicalParametersProps) {
  const [parameters, setParameters] = useState<ClinicalParameter[]>(initialParameters);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentParameter, setCurrentParameter] = useState<Partial<ClinicalParameter> | null>(null);
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
  const handleOpenModal = (parameter?: ClinicalParameter) => {
    setCurrentParameter(parameter || { ...emptyParameter });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentParameter(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentParameter) return;
    setCurrentParameter({ ...currentParameter, [e.target.name]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    if (!currentParameter) return;
    setCurrentParameter({ ...currentParameter, [name]: value });
  };
  
  const handleOptionsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!currentParameter) return;
      setCurrentParameter({ ...currentParameter, options: e.target.value.split(',').map(opt => opt.trim()) });
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParameter || !currentParameter.name) return;
    
    setIsSubmitting(true);
    try {
        await upsertClinicalParameter(currentParameter);
        toast({ title: 'Success', description: 'Parameter saved to database.' });
        await refreshParameters();
        handleCloseModal();
    } catch (e: any) {
        toast({ variant: 'destructive', title: 'Error', description: e.message });
    } finally {
        setIsSubmitting(false);
    }
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
    { accessorKey: "name", header: "Parameter", cell: ({ row }) => <span className="text-xs font-medium">{row.original.name}</span> },
    { accessorKey: "category", header: "Category", cell: ({ row }) => <span className="text-xs capitalize">{String(row.original.category).replace('_', ' ')}</span> },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="text-xs capitalize">{row.original.type}</span> },
    { accessorKey: "unit", header: "Unit", cell: ({ row }) => <span className="text-xs">{row.original.unit || '-'}</span> },
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
      <PlusCircle className="mr-2 h-4 w-4" /> Add Clinical Parameter
    </Button>
  );

  return (
    <div className="space-y-4">
      {isLoading ? (
          <div className="flex justify-center rounded-md border border-primary/10 p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
          <DataTable columns={columns} data={parameters} toolbarActions={toolbarActions} />
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentParameter?.id ? 'Edit' : 'Add'} Clinical Parameter</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-3 py-4">
              <InlineField label="Parameter Name" htmlFor="name">
                <Input id="name" name="name" value={currentParameter?.name || ''} onChange={handleChange} required />
              </InlineField>
              <InlineField label="Type" htmlFor="type">
                <Select name="type" value={currentParameter?.type || 'numeric'} onValueChange={(value) => handleSelectChange('type', value)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="numeric">Numeric</SelectItem>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="choice">Choice</SelectItem>
                    </SelectContent>
                </Select>
              </InlineField>
              <InlineField label="Category" htmlFor="category">
                <Select name="category" value={currentParameter?.category || 'vital_sign'} onValueChange={(v) => handleSelectChange('category', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                        <SelectItem value="vital_sign">Vital Sign</SelectItem>
                        <SelectItem value="lab_result">Lab Result</SelectItem>
                        <SelectItem value="clinical_measurement">Clinical Measurement</SelectItem>
                        <SelectItem value="assessment">Assessment</SelectItem>
                    </SelectContent>
                </Select>
              </InlineField>
              {currentParameter?.type === 'numeric' && (
                <InlineField label="Unit" htmlFor="unit">
                    <Input id="unit" name="unit" value={currentParameter?.unit || ''} onChange={handleChange} />
                </InlineField>
              )}
              {currentParameter?.type === 'choice' && (
                <InlineField label="Options" htmlFor="options">
                    <Input id="options" name="options" value={Array.isArray(currentParameter?.options) ? currentParameter.options.join(', ') : ''} onChange={handleOptionsChange} />
                </InlineField>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {currentParameter?.id ? 'Save Changes' : 'Create Parameter'}
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
