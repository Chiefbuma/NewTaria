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

export default function PatientList({ patients, onAddPatientClick }: { patients: Patient[], onAddPatientClick: (patient: Patient) => void }) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Button 
                variant={viewMode === 'table' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('table')}
            >
                <List className="h-4 w-4" />
            </Button>
            <Button 
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'} 
                size="icon" 
                onClick={() => setViewMode('grid')}
            >
                <LayoutGrid className="h-4 w-4" />
            </Button>
        </div>
        <Button asChild>
          <Link href="/register">
            <PlusCircle className="mr-2 h-4 w-4" /> Add New Patient
          </Link>
        </Button>
      </div>
      
      {viewMode === 'table' ? (
        <DataTable columns={columns} data={patients} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {patients.map((patient, index) => (
                <PatientCard key={patient.id} patient={patient} index={index}/>
            ))}
        </div>
      )}
    </motion.div>
  );
}
