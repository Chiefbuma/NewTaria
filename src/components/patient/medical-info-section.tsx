'use client';
import { useState } from 'react';
import type { Patient, Diagnosis, Corporate } from '@/lib/types';
import { motion } from 'framer-motion';
import { Stethoscope } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { corporates as mockCorporates, diagnoses as mockDiagnoses } from '@/lib/mock-data';

const DetailItem = ({ label, value }: { label: string, value: string | undefined }) => (
    <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-foreground">{value || '-'}</p>
    </div>
);

export default function MedicalInfoSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        diagnoses: patient.diagnoses.map(d => d.id),
        corporate_id: patient.corporate_id || '',
        date_of_diagnosis: patient.date_of_diagnosis || '',
    });
    
    const [selectedDiagnosisId, setSelectedDiagnosisId] = useState('');

    const handleAddDiagnosis = () => {
        if (selectedDiagnosisId && !formData.diagnoses.includes(parseInt(selectedDiagnosisId))) {
            setFormData(prev => ({ ...prev, diagnoses: [...prev.diagnoses, parseInt(selectedDiagnosisId)] }));
            setSelectedDiagnosisId('');
        }
    };
    
    const handleRemoveDiagnosis = (idToRemove: number) => {
        setFormData(prev => ({ ...prev, diagnoses: prev.diagnoses.filter(id => id !== idToRemove) }));
    };

    const handleSave = () => {
        // In a real app, you'd make an API call. Here, we'll just update the parent state.
        // This is a simplified mock update.
        console.log("Saving medical info:", formData);
        onUpdate();
        setEditing(false);
    };

    const getDiagnosisName = (id: number) => mockDiagnoses.find(d => d.id === id)?.name;

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
                    <Button onClick={() => setEditing(!editing)} variant="outline">
                        {editing ? 'Cancel' : 'Edit'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {editing ? (
                         <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Diagnoses</label>
                                <div className="flex gap-2">
                                    <select value={selectedDiagnosisId} onChange={(e) => setSelectedDiagnosisId(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                        <option value="">Select Diagnosis</option>
                                        {mockDiagnoses.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                    </select>
                                    <Button onClick={handleAddDiagnosis}>Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.diagnoses.map(id => (
                                        <Badge key={id} variant="secondary" className="flex items-center gap-2">
                                            {getDiagnosisName(id)}
                                            <button onClick={() => handleRemoveDiagnosis(id)} className="text-red-500 hover:text-red-700">&times;</button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Corporate Partner</label>
                                <select value={formData.corporate_id} onChange={(e) => setFormData({...formData, corporate_id: parseInt(e.target.value)})} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                                    <option value="">None</option>
                                    {mockCorporates.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Date of Diagnosis</label>
                                <input type="date" value={formData.date_of_diagnosis} onChange={(e) => setFormData({...formData, date_of_diagnosis: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg"/>
                            </div>
                            <Button onClick={handleSave}>Save Changes</Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            <DetailItem label="Diagnoses" value={patient.diagnoses.map(d => d.name).join(', ') || 'No diagnoses recorded'} />
                            <DetailItem label="Corporate Partner" value={patient.corporate_name} />
                            <DetailItem label="Date of Diagnosis" value={patient.date_of_diagnosis ? new Date(patient.date_of_diagnosis).toLocaleDateString() : 'N/A'} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
