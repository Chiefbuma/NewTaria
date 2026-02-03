'use client';
import { useState } from 'react';
import type { Patient, Prescription } from '@/lib/types';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { medications as mockMedications } from '@/lib/mock-data';

export default function MedicationUseSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const [prescriptions, setPrescriptions] = useState(patient.prescriptions);

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Pill className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Current Medications</CardTitle>
                            <CardDescription>Patient's current medication regimen</CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => {}} variant="outline">Add Prescription</Button>
                </CardHeader>
                <CardContent>
                    {prescriptions.length > 0 ? (
                         <div className="overflow-x-auto rounded-xl border">
                            <table className="min-w-full divide-y divide-gray-200/60">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Medication</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Dosage</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200/60">
                                    {prescriptions.map((p) => (
                                        <tr key={p.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{mockMedications.find(m => m.id === p.medication_id)?.name}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.dosage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{p.frequency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 capitalize">{p.status}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No prescriptions found.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
