'use client';

import { useState } from 'react';
import type { Patient, Prescription, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, PlusCircle, Loader2 } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { getPrescriptionColumns } from './prescription-columns';
import AddPrescriptionModal from './add-prescription-modal';
import { useToast } from '@/hooks/use-toast';
import { upsertPrescription as upsertPrescriptionApi, deletePrescription as deletePrescriptionApi } from '@/lib/api-service';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';

interface PrescriptionManagementProps {
    patient: Patient;
    prescriptions: Prescription[];
    medications: Medication[];
    onPrescriptionsUpdate: (prescriptions: Prescription[]) => void;
    readOnly?: boolean;
}

export default function PrescriptionManagement({ patient, prescriptions, medications, onPrescriptionsUpdate, readOnly = false }: PrescriptionManagementProps) {
    const { toast } = useToast();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null);
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    
    const handleAddClick = () => {
        if (readOnly) return;
        setEditingPrescription(null);
        setIsModalOpen(true);
    }

    const handleEditClick = (prescription: Prescription) => {
        if (readOnly) return;
        setEditingPrescription(prescription);
        setIsModalOpen(true);
    }

    const handleSave = async (prescriptionData: Omit<Prescription, 'id' | 'patient_id'> & { id?: number }) => {
        if (readOnly) return;
        setIsSubmitting(true);
        try {
            const saved = await upsertPrescriptionApi({
                ...prescriptionData,
                patient_id: patient.id
            });
            
            const medication = medications.find(m => m.id === prescriptionData.medication_id);
            const fullPrescription = { ...saved, medication } as Prescription;

            let updatedPrescriptions;
            if (prescriptionData.id) {
                updatedPrescriptions = prescriptions.map(p => p.id === prescriptionData.id ? fullPrescription : p);
            } else {
                updatedPrescriptions = [fullPrescription, ...prescriptions];
            }

            onPrescriptionsUpdate(updatedPrescriptions);
            toast({ title: 'Success', description: 'Prescription saved to database.' });
            setIsModalOpen(false);
            setEditingPrescription(null);
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save prescription.' });
        } finally {
            setIsSubmitting(false);
        }
    }

    const handleDelete = async (id: number) => {
        if (readOnly) return;
        try {
            await deletePrescriptionApi(id);
            const updatedPrescriptions = prescriptions.filter(p => p.id !== id);
            onPrescriptionsUpdate(updatedPrescriptions);
            toast({ title: 'Success', description: 'Prescription deactivated.' });
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to delete prescription.' });
        }
    }

    const columns = getPrescriptionColumns({
        onEdit: handleEditClick,
        onDelete: (id) => setPendingDeleteId(id),
    });

    return (
        <>
            <Card className="border-primary/10 shadow-sm overflow-hidden">
                <CardHeader className="bg-muted/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl"><Pill className="h-5 w-5 text-primary" />Medications</CardTitle>
                            <CardDescription>Manage patient's prescriptions.</CardDescription>
                        </div>
                        {!readOnly && (
                            <Button onClick={handleAddClick} size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {prescriptions.length > 0 ? (
                         <DataTable columns={columns} data={prescriptions} />
                    ) : (
                        <p className="text-center text-muted-foreground py-12 italic border-2 border-dashed rounded-xl">No active prescriptions recorded.</p>
                    )}
                </CardContent>
            </Card>

            {isModalOpen && !readOnly && (
                <AddPrescriptionModal 
                    isOpen={isModalOpen}
                    onClose={() => { if (!isSubmitting) { setIsModalOpen(false); setEditingPrescription(null); } }}
                    onSave={handleSave}
                    medications={medications}
                    existingPrescription={editingPrescription}
                />
            )}

            <ConfirmActionDialog
                open={pendingDeleteId !== null}
                onOpenChange={(open) => {
                    if (!open) setPendingDeleteId(null);
                }}
                title="Deactivate prescription?"
                description="This will soft-delete the prescription and remove it from the active medication list."
                confirmLabel="Deactivate"
                onConfirm={async () => {
                    if (pendingDeleteId !== null) {
                        await handleDelete(pendingDeleteId);
                    }
                }}
            />
        </>
    );
}
