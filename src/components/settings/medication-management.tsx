'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Medication, User } from '@/lib/types';
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
import { PlusCircle, Edit, Trash2, Loader2, CheckSquare, MoreVertical, FileDown } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { DataTable } from '../ui/data-table';
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { motion, AnimatePresence } from 'framer-motion';

export default function MedicationManagement() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentMed, setCurrentMed] = useState<Partial<Medication> | null>(null);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const { toast } = useToast();
  const lastSelectedIdsRef = useRef("");

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

  const handleSelectionChange = useCallback((selectedRows: Medication[]) => {
      const ids = selectedRows.map(r => r.id).sort();
      const idsString = ids.join(",");
      if (lastSelectedIdsRef.current !== idsString) {
          lastSelectedIdsRef.current = idsString;
          setSelectedIds(ids);
      }
  }, []);

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

  const handleDelete = async (id: number) => {
      try {
          const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
          if (!res.ok) throw new Error('Failed to delete');
          setMedications(prev => prev.filter(m => m.id !== id));
          toast({ title: 'Success', description: 'Medication removed.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
  };

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (!confirm(`Permanently remove ${selectedIds.length} medications from active view?`)) return;

      try {
          const res = await fetch('/api/medications/bulk-delete', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds })
          });
          if (!res.ok) throw new Error('Bulk delete failed');
          setMedications(prev => prev.filter(m => !selectedIds.includes(m.id)));
          setSelectedIds([]);
          lastSelectedIdsRef.current = "";
          toast({ title: 'Success', description: 'Selected medications removed.' });
      } catch (e: any) {
          toast({ variant: 'destructive', title: 'Error', description: e.message });
      }
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
          <PlusCircle className="mr-2 h-4 w-4" /> Add Medication
        </Button>
      </div>

      <div className="rounded-md border border-primary/10">
        {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
        ) : (
            <DataTable columns={columns} data={medications} onSelectionChange={handleSelectionChange} />
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{currentMed?.id ? 'Edit' : 'Add'} Medication</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Medication Name</Label>
                <Input id="name" value={currentMed?.name || ''} onChange={(e) => setCurrentMed(p => ({...p!, name: e.target.value}))} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dosage">Typical Dosage</Label>
                <Input id="dosage" value={currentMed?.dosage || ''} onChange={(e) => setCurrentMed(p => ({...p!, dosage: e.target.value}))} placeholder="e.g., 500mg" />
              </div>
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
    </div>
  );
}
