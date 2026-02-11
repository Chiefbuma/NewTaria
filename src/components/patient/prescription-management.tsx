'use client';

import { useState } from 'react';
import type { Patient, Prescription, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, PlusCircle } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { getPrescriptionColumns } from './prescription-columns';
import AddPrescriptionModal from './add-prescription-modal';
import { useToast } from '@/hooks/use-toast';

interface PrescriptionManagementProps {
    patient: Patient;
    prescriptions: Prescription[];
    medications: Medication[];
    onPrescriptionsUpdate: (prescriptions: Prescription[]) => void;
}

export default function PrescriptionManagement({ patient, prescriptions, medications, onPrescriptionsUpdate }: PrescriptionManagementProps) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    
    const handleAddClick = () => {
        setEditingPrescription(null);
        setIsModalOpen(true);
    }

    const handleEditClick = (prescription: Prescription) => {
        setEditingPrescription(prescription);
        setIsModalOpen(true);
    }

    const handleSave = (prescriptionData: Omit<Prescription, 'id' | 'patient_id'> & { id?: number }) => {
        let updatedPrescriptions;
        const medication = medications.find(m => m.id === prescriptionData.medication_id);

        if (prescriptionData.id) {
            // Update existing
            updatedPrescriptions = prescriptions.map(p => 
                p.id === prescriptionData.id ? { ...p, ...prescriptionData, medication } : p
            );
        } else {
            // Add new
            const newPrescription: Prescription = {
                id: Date.now(), // mock id
                patient_id: patient.id,
                ...prescriptionData,
                medication
            } as Prescription;
            updatedPrescriptions = [...prescriptions, newPrescription];
        }
        onPrescriptionsUpdate(updatedPrescriptions);
        toast({ title: 'Success', description: 'Prescription saved.' });
        setIsModalOpen(false);
        setEditingPrescription(null);
    }

    const handleDelete = (id: number) => {
        const updatedPrescriptions = prescriptions.filter(p => p.id !== id);
        onPrescriptionsUpdate(updatedPrescriptions);
        toast({ title: 'Success', description: 'Prescription deleted.' });
    }

    const columns = getPrescriptionColumns({
        onEdit: handleEditClick,
        onDelete: handleDelete,
    });

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2"><Pill />Medications</CardTitle>
                            <CardDescription>Manage patient's prescriptions.</CardDescription>
                        </div>
                        <Button onClick={handleAddClick}>
                            <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {prescriptions.length > 0 ? (
                         <DataTable columns={columns} data={prescriptions} />
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No prescriptions recorded.</p>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && (
                <AddPrescriptionModal 
                    isOpen={isModalOpen}
                    onClose={() => { setIsModalOpen(false); setEditingPrescription(null); }}
                    onSave={handleSave}
                    medications={medications}
                    existingPrescription={editingPrescription}
                />
            )}
        </>
    );
}
