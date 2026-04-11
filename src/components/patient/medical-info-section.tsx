'use client';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';

const DetailItem = ({ label, value }: { label: string, value: string | undefined }) => (
    <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-foreground">{value || '-'}</p>
    </div>
);

export default function MedicalInfoSection({ patient }: { patient: Patient }) {
    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Stethoscope className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Medical Information</CardTitle>
                            <CardDescription>Diagnoses and medical history</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 gap-4">
                        <DetailItem label="Primary Diagnosis" value={patient.primary_diagnosis || patient.diagnosis || 'N/A'} />
                        <DetailItem label="Corporate Partner" value={patient.corporate_name} />
                        <DetailItem label="Date of Diagnosis" value={patient.date_of_diagnosis ? new Date(patient.date_of_diagnosis).toLocaleDateString() : 'N/A'} />
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
