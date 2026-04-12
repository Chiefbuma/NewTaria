'use client';

import { useMemo, useState } from 'react';
import type { Patient, Prescription, Medication } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pill, PlusCircle, Edit } from 'lucide-react';
import AddPrescriptionSheet from './add-prescription-sheet';
import { useToast } from '@/hooks/use-toast';
import { upsertPrescription as upsertPrescriptionApi, deletePrescription as deletePrescriptionApi } from '@/lib/api-service';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { DataTable } from '@/components/ui/data-table';
import { getPrescriptionColumns } from './prescription-columns';

interface PrescriptionManagementProps {
    patient: Patient;
    prescriptions: Prescription[];
    medications: Medication[];
    onPrescriptionsUpdate: (prescriptions: Prescription[]) => void;
    readOnly?: boolean;
}

export default function PrescriptionManagement({ patient, prescriptions, medications, onPrescriptionsUpdate, readOnly = false }: PrescriptionManagementProps) {
    const { toast } = useToast();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

    const handleSave = async (prescriptionData: Omit<Prescription, 'id' | 'patient_id'> & { id?: number }) => {
        if (readOnly) return;
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
        } catch (error: any) {
            toast({ variant: 'destructive', title: 'Error', description: error.message || 'Failed to save prescription.' });
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

    const columns = useMemo(
        () =>
            getPrescriptionColumns({
                renderEdit: (prescription) => (
                  <AddPrescriptionSheet
                    trigger={
                      <Button variant="ghost" size="icon" className="h-7 w-7">
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                      </Button>
                    }
                    onSave={handleSave}
                    medications={medications}
                    existingPrescription={prescription}
                    align="end"
                    disabled={readOnly}
                  />
                ),
                onDeactivate: (id) => setPendingDeleteId(id),
                readOnly,
            }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [readOnly, medications, prescriptions]
    );

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
                          <AddPrescriptionSheet
                            trigger={
                              <Button size="sm" className="bg-primary hover:bg-primary/90 shadow-md">
                                <PlusCircle className="mr-2 h-4 w-4" /> Add Prescription
                              </Button>
                            }
                            onSave={handleSave}
                            medications={medications}
                            existingPrescription={null}
                            align="end"
                          />
                        )}
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {prescriptions.length > 0 ? (
                         <DataTable
                            columns={columns}
                            data={prescriptions}
                            defaultDensity="compact"
                            enableSearch={false}
                          />
                    ) : (
                        <p className="text-center text-muted-foreground py-12 italic border-2 border-dashed rounded-xl">No active prescriptions recorded.</p>
                    )}
                </CardContent>
            </Card>

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
