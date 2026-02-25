'use client';

import { useState, useCallback, useRef } from 'react';
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
import { PlusCircle, Edit, Trash2, Loader2, CheckSquare, MoreVertical } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentParameter, setCurrentParameter] = useState<Partial<ClinicalParameter> | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const lastSelectedIdsRef = useRef("");

  const handleSelectionChange = useCallback((selectedRows: ClinicalParameter[]) => {
      const ids = selectedRows.map(r => r.id).sort();
      const idsString = ids.join(",");
      if (lastSelectedIdsRef.current !== idsString) {
          lastSelectedIdsRef.current = idsString;
          setSelectedIds(ids);
      }
  }, []);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentParameter || !currentParameter.name) return;
    
    setIsSubmitting(true);
    setTimeout(() => {
        let updated;
        if (currentParameter.id) {
            updated = parameters.map(p => p.id === currentParameter!.id ? (currentParameter as ClinicalParameter) : p);
        } else {
            const newParam = { id: Date.now(), ...emptyParameter, ...currentParameter } as ClinicalParameter;
            updated = [...parameters, newParam];
        }
        
        setParameters(updated);
        onParametersUpdate(updated);
        toast({ title: 'Success', description: 'Parameter saved.' });
        setIsSubmitting(false);
        handleCloseModal();
    }, 500);
  };
  
  const handleDelete = (id: number) => {
      const updated = parameters.filter(p => p.id !== id);
      setParameters(updated);
      onParametersUpdate(updated);
      toast({ title: 'Success', description: 'Parameter removed.' });
  }

  const handleBulkDelete = () => {
      if (selectedIds.length === 0) return;
      if (!confirm(`Delete ${selectedIds.length} parameters?`)) return;
      
      const updated = parameters.filter(p => !selectedIds.includes(p.id));
      setParameters(updated);
      onParametersUpdate(updated);
      setSelectedIds([]);
      lastSelectedIdsRef.current = "";
      toast({ title: 'Success', description: 'Selected parameters removed.' });
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
    { accessorKey: "name", header: "Parameter" },
    { accessorKey: "type", header: "Type", cell: ({ row }) => <span className="capitalize">{row.original.type}</span> },
    { accessorKey: "unit", header: "Unit", cell: ({ row }) => row.original.unit || '-' },
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <AnimatePresence>
            {selectedIds.length > 0 && (
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm" className="border-primary text-primary">
                                <CheckSquare className="mr-2 h-4 w-4" />
                                {selectedIds.length} Selected
                                <MoreVertical className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="start">
                            <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </motion.div>
            )}
        </AnimatePresence>
        <div className="flex-1" />
        <Button onClick={() => handleOpenModal()} className="bg-primary hover:bg-primary/90 shadow-sm">
          <PlusCircle className="mr-2 h-4 w-4" /> Add Parameter
        </Button>
      </div>

      <div className="rounded-md border border-primary/10">
        <DataTable columns={columns} data={parameters} onSelectionChange={handleSelectionChange} />
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentParameter?.id ? 'Edit' : 'Add'} Clinical Parameter</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Parameter Name</Label>
                <Input id="name" name="name" value={currentParameter?.name || ''} onChange={handleChange} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select name="type" value={currentParameter?.type || ''} onValueChange={(value) => handleSelectChange('type', value)}>
                        <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="numeric">Numeric</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                            <SelectItem value="choice">Choice</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select name="category" value={currentParameter?.category || ''} onValueChange={(v) => handleSelectChange('category', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="vital_sign">Vital Sign</SelectItem>
                            <SelectItem value="lab_result">Lab Result</SelectItem>
                            <SelectItem value="clinical_measurement">Clinical Measurement</SelectItem>
                            <SelectItem value="assessment">Assessment</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
              </div>
              {currentParameter?.type === 'numeric' && (
                <div className="space-y-2">
                    <Label htmlFor="unit">Unit</Label>
                    <Input id="unit" name="unit" value={currentParameter?.unit || ''} onChange={handleChange} placeholder="e.g., kg, bpm, mg/dL" />
                </div>
              )}
               {currentParameter?.type === 'choice' && (
                <div className="space-y-2">
                    <Label htmlFor="options">Options (comma-separated)</Label>
                    <Input id="options" name="options" value={Array.isArray(currentParameter?.options) ? currentParameter.options.join(', ') : ''} onChange={handleOptionsChange} placeholder="Option 1, Option 2" />
                </div>
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
    </div>
  );
}
