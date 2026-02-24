'use client';
import { useState } from 'react';
import type { Patient, Prescription } from '@/lib/types';
import { motion } from 'framer-motion';
import { Pill } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export default function MedicationUseSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const prescriptions = patient.prescriptions;

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md">
                           <Pill className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Current Medications</CardTitle>
                            <CardDescription className="text-muted-foreground">Active treatment regimen</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="pt-6">
                    {prescriptions.length > 0 ? (
                         <div className="overflow-x-auto rounded-xl border border-border">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Medication</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Dosage</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Frequency</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {prescriptions.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-foreground">{p.medication?.name || 'Unknown'}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{p.dosage}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{p.frequency}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                    {p.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                         </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8 italic">No prescriptions found in record.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}