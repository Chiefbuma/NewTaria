'use client';
import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { Phone } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';

const DetailItem = ({ label, value }: { label: string, value: string | null | undefined }) => (
    <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="font-semibold text-foreground">{value || '-'}</p>
    </div>
);

export default function EmergencyContactSection({ patient, onUpdate }: { patient: Patient, onUpdate: () => void }) {
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        emergency_contact_name: patient.emergency_contact_name || '',
        emergency_contact_phone: patient.emergency_contact_phone || '',
        emergency_contact_relation: patient.emergency_contact_relation || '',
    });

    const handleSave = () => {
        // Mock save
        console.log("Saving emergency contact:", formData);
        onUpdate();
        setEditing(false);
    };

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                           <Phone className="text-white" />
                        </div>
                        <div>
                            <CardTitle>Emergency Contact</CardTitle>
                            <CardDescription>Emergency contact information</CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => setEditing(!editing)} variant="outline">
                        {editing ? 'Cancel' : 'Edit'}
                    </Button>
                </CardHeader>
                <CardContent>
                    {editing ? (
                         <div className="space-y-4">
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                                 <input type="text" value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                                 <input type="tel" value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                             </div>
                             <div>
                                 <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
                                 <input type="text" value={formData.emergency_contact_relation} onChange={e => setFormData({...formData, emergency_contact_relation: e.target.value})} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                             </div>
                             <Button onClick={handleSave}>Save Changes</Button>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailItem label="Contact Name" value={patient.emergency_contact_name} />
                            <DetailItem label="Contact Phone" value={patient.emergency_contact_phone} />
                            <DetailItem label="Relationship" value={patient.emergency_contact_relation} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}
