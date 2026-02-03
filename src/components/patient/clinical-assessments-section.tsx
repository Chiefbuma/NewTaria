'use client';
import { useState } from 'react';
import type { Patient, ClinicalParameter } from '@/lib/types';
import { motion } from 'framer-motion';
import { ClipboardList, HeartPulse, Beaker, Ruler } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { clinicalParameters as mockClinicalParameters } from '@/lib/mock-data';

export default function ClinicalAssessments({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const [activeTab, setActiveTab] = useState('vital_sign');
    
    const tabs = [
        { id: 'vital_sign', label: 'Vital Signs', icon: HeartPulse },
        { id: 'lab_result', label: 'Lab Results', icon: Beaker },
        { id: 'clinical_measurement', label: 'Measurements', icon: Ruler },
    ];

    const parametersForTab = mockClinicalParameters.filter(p => p.category === activeTab);

    return (
         <motion.section initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
            <Card>
                <CardHeader>
                     <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
                           <ClipboardList className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Clinical Assessments</CardTitle>
                            <CardDescription>Create new assessment records for tracking over time</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                     <div className="mb-6">
                        <div className="flex space-x-1 bg-muted p-1 rounded-xl">
                        {tabs.map((tab) => (
                            <Button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            variant={activeTab === tab.id ? 'default' : 'ghost'}
                            className="w-full"
                            >
                                <tab.icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </Button>
                        ))}
                        </div>
                    </div>
                     <div className="space-y-4">
                        {parametersForTab.map(param => (
                            <div key={param.id} className="grid grid-cols-2 gap-4 items-center">
                                <label className="text-sm font-medium text-gray-700">{param.name} {param.unit && `(${param.unit})`}</label>
                                <input type="text" placeholder="Enter value" className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                            </div>
                        ))}
                    </div>
                    <Button className="mt-6">Save Assessments</Button>
                </CardContent>
            </Card>
        </motion.section>
    );
}
