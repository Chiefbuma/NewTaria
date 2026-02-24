'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Patient, User } from '@/lib/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, LayoutGrid, Trash2, MoreVertical, FileDown, CheckSquare } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { columns } from '../../app/dashboard/columns';
import Link from 'next/link';
import PatientCard from './patient-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { bulkDeletePatients } from '@/lib/api-service';
import { useToast } from '@/hooks/use-toast';

export default function PatientList({ patients: initialPatients }: { patients: Patient[] }) {
  const [patients, setPatients] = useState(initialPatients);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const { toast } = useToast();
  
  // FIX: Ref-based selection guard to prevent infinite update cycles
  const lastSelectedIdsRef = useRef("");

  useEffect(() => {
      const stored = localStorage.getItem('loggedInUser');
      if (stored) setCurrentUser(JSON.parse(stored));
  }, []);

  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);

  const handleSelectionChange = useCallback((selectedRows: Patient[]) => {
      const ids = selectedRows.map(r => r.id).sort();
      const idsString = ids.join(",");
      
      if (lastSelectedIdsRef.current !== idsString) {
          lastSelectedIdsRef.current = idsString;
          setSelectedIds(ids);
      }
  }, []);

  const handleBulkDelete = async () => {
      if (selectedIds.length === 0) return;
      if (!confirm(`Are you sure you want to delete ${selectedIds.length} patients? This is a soft delete.`)) return;

      try {
          await bulkDeletePatients(selectedIds);
          setPatients(prev => prev.filter(p => !selectedIds.includes(p.id)));
          setSelectedIds([]);
          lastSelectedIdsRef.current = "";
          toast({ title: 'Success', description: 'Selected patients marked as deleted.' });
      } catch (error: any) {
          toast({ variant: 'destructive', title: 'Error', description: error.message });
      }
  };

  const handleExport = () => {
      toast({ title: 'Exporting...', description: 'Patient data export has started.' });
  };

  const canDelete = currentUser?.role === 'admin' || currentUser?.role === 'navigator';

  return (
     <Card className="border-primary/10">
        <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <CardTitle className="text-foreground">All Patients</CardTitle>
                    <CardDescription className="text-muted-foreground">View, search, and manage patient records.</CardDescription>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <AnimatePresence>
                        {selectedIds.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center gap-2"
                            >
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="sm" className="border-primary text-primary">
                                            <CheckSquare className="mr-2 h-4 w-4" />
                                            {selectedIds.length} Selected
                                            <MoreVertical className="ml-2 h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem onClick={handleExport}>
                                            <FileDown className="mr-2 h-4 w-4" /> Export Selected
                                        </DropdownMenuItem>
                                        {canDelete && (
                                            <DropdownMenuItem onClick={handleBulkDelete} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete Selected
                                            </DropdownMenuItem>
                                        )}
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border">
                        <Button 
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setViewMode('table')}
                            aria-label="Table View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            className="h-8 w-8"
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                     <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                        <Link href="/dashboard/register-patient">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Patient
                        </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {viewMode === 'table' ? (
                <DataTable 
                    columns={columns} 
                    data={patients} 
                    onSelectionChange={handleSelectionChange}
                />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                    {patients.map((patient, index) => (
                        <PatientCard key={patient.id} patient={patient} index={index}/>
                    ))}
                </div>
            )}
        </CardContent>
    </Card>
  );
}