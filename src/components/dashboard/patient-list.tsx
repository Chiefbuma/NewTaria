'use client';

import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { PlusCircle, List, LayoutGrid } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { columns } from '../../app/dashboard/columns';
import Link from 'next/link';
import PatientCard from './patient-card';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function PatientList({ patients }: { patients: Patient[] }) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
     <Card>
        <CardHeader>
            <div className="flex items-center justify-between">
                <div>
                    <CardTitle>All Patients</CardTitle>
                    <CardDescription>View, search, and manage patient records.</CardDescription>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border">
                        <Button 
                            variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            onClick={() => setViewMode('table')}
                            aria-label="Table View"
                        >
                            <List className="h-4 w-4" />
                        </Button>
                        <Button 
                            variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                            size="icon" 
                            onClick={() => setViewMode('grid')}
                            aria-label="Grid View"
                        >
                            <LayoutGrid className="h-4 w-4" />
                        </Button>
                    </div>
                     <Button asChild>
                        <Link href="/dashboard/register-patient">
                            <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
                        </Link>
                    </Button>
                </div>
            </div>
        </CardHeader>
        <CardContent>
            {viewMode === 'table' ? (
                <DataTable columns={columns} data={patients} />
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
