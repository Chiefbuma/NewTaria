'use client';
import type { Patient } from '@/lib/types';
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
                         <div className="space-y-3">
                            <div className="grid gap-3 sm:hidden">
                                {prescriptions.map((p) => (
                                    <div key={p.id} className="rounded-2xl border border-border bg-card p-3 shadow-sm">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="min-w-0">
                                                <div className="truncate text-sm font-semibold text-foreground">
                                                    {p.medication?.name || 'Unknown'}
                                                </div>
                                                <div className="mt-1 text-[11px] text-muted-foreground">
                                                    {p.dosage} • Exp: {p.expiry_date ? new Date(p.expiry_date).toLocaleDateString() : 'N/A'}
                                                </div>
                                            </div>
                                            <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                {p.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="hidden overflow-x-auto rounded-xl border border-border sm:block">
                            <table className="min-w-full divide-y divide-border">
                                <thead className="bg-muted/50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Medication</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Dosage</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Frequency</th>
                                        <th className="px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-card divide-y divide-border">
                                    {prescriptions.map((p) => (
                                        <tr key={p.id} className="hover:bg-muted/30 transition-colors">
                                            <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-foreground">{p.medication?.name || 'Unknown'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{p.dosage}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-muted-foreground">{p.frequency}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm">
                                                <Badge variant={p.status === 'active' ? 'default' : 'secondary'} className="capitalize">
                                                    {p.status}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            </div>
                         </div>
                    ) : (
                        <p className="text-center text-muted-foreground py-8 italic">No prescriptions found in record.</p>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
