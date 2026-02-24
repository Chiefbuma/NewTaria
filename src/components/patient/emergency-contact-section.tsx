'use client';
import { useState } from 'react';
import type { Patient } from '@/lib/types';
import { motion } from 'framer-motion';
import { Phone, User, Heart } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const DetailItem = ({ label, value, icon: Icon }: { label: string, value: string | null | undefined, icon: any }) => (
    <div className="flex items-center gap-3">
        <div className="p-2 bg-muted/50 rounded-lg">
            <Icon className="h-4 w-4 text-primary" />
        </div>
        <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
            <p className="font-semibold text-foreground">{value || '-'}</p>
        </div>
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
        // Mock save for now as primary focus was visibility
        console.log("Saving emergency contact:", formData);
        onUpdate();
        setEditing(false);
    };

    return (
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
            <Card className="border-border">
                <CardHeader className="flex flex-row items-center justify-between border-b bg-muted/30">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md">
                           <Phone className="text-white h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-foreground">Emergency Contact</CardTitle>
                            <CardDescription className="text-muted-foreground">Primary emergency details</CardDescription>
                        </div>
                    </div>
                    <Button onClick={() => setEditing(!editing)} variant="outline" size="sm" className="border-primary/30 hover:border-primary">
                        {editing ? 'Cancel' : 'Edit'}
                    </Button>
                </CardHeader>
                <CardContent className="pt-6">
                    {editing ? (
                         <div className="space-y-4">
                             <div className="space-y-2">
                                 <Label className="text-foreground">Contact Name</Label>
                                 <Input value={formData.emergency_contact_name} onChange={e => setFormData({...formData, emergency_contact_name: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-foreground">Contact Phone</Label>
                                 <Input type="tel" value={formData.emergency_contact_phone} onChange={e => setFormData({...formData, emergency_contact_phone: e.target.value})} />
                             </div>
                             <div className="space-y-2">
                                 <Label className="text-foreground">Relationship</Label>
                                 <Input value={formData.emergency_contact_relation} onChange={e => setFormData({...formData, emergency_contact_relation: e.target.value})} />
                             </div>
                             <Button onClick={handleSave} className="w-full">Save Changes</Button>
                         </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <DetailItem label="Contact Name" value={patient.emergency_contact_name} icon={User} />
                            <DetailItem label="Contact Phone" value={patient.emergency_contact_phone} icon={Phone} />
                            <DetailItem label="Relationship" value={patient.emergency_contact_relation} icon={Heart} />
                        </div>
                    )}
                </CardContent>
            </Card>
        </motion.div>
    );
}