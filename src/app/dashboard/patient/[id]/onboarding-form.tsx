
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, User, Partner } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import PatientHeader from './patient-header';
import { activatePatient } from '@/lib/api-service';

interface OnboardingFormProps {
    patient: Patient;
    initialPartners: Partner[];
}

export default function OnboardingForm({ patient, initialPartners }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [formData, setFormData] = useState<Partial<Patient>>({ 
        ...patient,
        date_of_onboarding: patient.date_of_onboarding ? new Date(patient.date_of_onboarding).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
     });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('loggedInUser');
        if (storedUser) {
            const user: User = JSON.parse(storedUser);
            setCurrentUser(user);
            setFormData(prev => ({
                ...prev,
                navigator_id: user.id,
                emr_number: `EMR/TAR/${patient.id}`
            }));
        }
        // Fetch fresh partners
        fetch('/api/partners').then(res => res.json()).then(setPartners);
    }, [patient.id]);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSelectChange = (name: string, value: string) => {
        const processedValue = value === 'null' ? null : value;
        setFormData({ ...formData, [name]: processedValue });
    };
    
    const handleSwitchChange = (name: string, checked: boolean) => {
        setFormData({ ...formData, [name]: checked });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            await activatePatient(patient.id, formData);
            toast({
                title: 'Onboarding Complete',
                description: `${patient.first_name} is now marked as Active.`,
            });
            router.refresh();
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to complete onboarding.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <PatientHeader patient={patient} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    <Card className="border-primary/10">
                        <CardHeader className="items-center">
                            <div className="bg-muted px-4 py-2 rounded-lg border border-primary/10">
                                <CardTitle className="text-center text-primary">Medical History</CardTitle>
                            </div>
                            <CardDescription className="pt-2">Capture important medical history and diagnoses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="brief_medical_history">Brief Medical History</Label>
                                <Textarea id="brief_medical_history" value={formData.brief_medical_history || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid grid-cols-1 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="years_since_diagnosis">Years Since Primary Diagnosis</Label>
                                    <Input id="years_since_diagnosis" type="number" value={formData.years_since_diagnosis || ''} onChange={handleInputChange} />
                                </div>
                                 <div className="space-y-2">
                                    <Label htmlFor="past_medical_interventions">Past Medical Interventions</Label>
                                    <Input id="past_medical_interventions" value={formData.past_medical_interventions || ''} onChange={handleInputChange} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="relevant_family_history">Relevant Family History</Label>
                                <Textarea id="relevant_family_history" value={formData.relevant_family_history || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                        <CardHeader className="items-center">
                             <div className="bg-muted px-4 py-2 rounded-lg border border-primary/10">
                                <CardTitle className="text-center text-primary">Lifestyle & Environment</CardTitle>
                            </div>
                            <CardDescription className="pt-2">Understand the patient's daily life and environment.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="dietary_restrictions">Dietary Restrictions or Preferences</Label>
                                <Textarea id="dietary_restrictions" value={formData.dietary_restrictions || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="allergies_intolerances">Allergies or Intolerances</Label>
                                <Textarea id="allergies_intolerances" value={formData.allergies_intolerances || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lifestyle_factors">Lifestyle Factors</Label>
                                <Textarea id="lifestyle_factors" value={formData.lifestyle_factors || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="physical_limitations">Physical Limitations</Label>
                                <Textarea id="physical_limitations" value={formData.physical_limitations || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="psychosocial_factors">Psychosocial Factors</Label>
                                <Textarea id="psychosocial_factors" value={formData.psychosocial_factors || ''} onChange={handleInputChange} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                        <CardHeader className="items-center">
                             <div className="bg-muted px-4 py-2 rounded-lg border border-primary/10">
                                <CardTitle className="text-center text-primary">Emergency Contact & Administrative</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_name">Emergency Contact Name</Label>
                                <Input id="emergency_contact_name" value={formData.emergency_contact_name || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_phone">Emergency Contact Phone</Label>
                                <Input id="emergency_contact_phone" type="tel" value={formData.emergency_contact_phone || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emergency_contact_relation">Relation</Label>
                                <Select value={formData.emergency_contact_relation || ''} onValueChange={(value) => handleSelectChange('emergency_contact_relation', value)}>
                                    <SelectTrigger className="border-primary/20"><SelectValue placeholder="Select a relation" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emr_number">EMR Number</Label>
                                <Input id="emr_number" value={formData.emr_number || ''} readOnly className="bg-muted" />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="navigator_name">Navigator</Label>
                                <Input id="navigator_name" value={currentUser?.name || ''} readOnly className="bg-muted" />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="partner_id">Assign Partner</Label>
                                <Select value={String(formData.partner_id || 'null')} onValueChange={(value) => handleSelectChange('partner_id', value)}>
                                    <SelectTrigger className="border-primary/20"><SelectValue placeholder="Select a partner" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None</SelectItem>
                                        {partners.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-primary/10">
                        <CardHeader className="items-center">
                            <div className="bg-muted px-4 py-2 rounded-lg border border-primary/10">
                                <CardTitle className="text-center text-primary">Equipment & Consent</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col space-y-4 items-start">
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_weighing_scale" checked={formData.has_weighing_scale || false} onCheckedChange={(checked) => handleSwitchChange('has_weighing_scale', checked)} />
                                    <Label htmlFor="has_weighing_scale">Weighing Scale</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_glucometer" checked={formData.has_glucometer || false} onCheckedChange={(checked) => handleSwitchChange('has_glucometer', checked)} />
                                    <Label htmlFor="has_glucometer">Glucometer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_bp_machine" checked={formData.has_bp_machine || false} onCheckedChange={(checked) => handleSwitchChange('has_bp_machine', checked)} />
                                    <Label htmlFor="has_bp_machine">BP Machine</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_tape_measure" checked={formData.has_tape_measure || false} onCheckedChange={(checked) => handleSwitchChange('has_tape_measure', checked)} />
                                    <Label htmlFor="has_tape_measure">Tape Measure</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-4 pt-4">
                               <div className="space-y-2">
                                    <Label htmlFor="date_of_onboarding">Date of Onboarding</Label>
                                    <Input id="date_of_onboarding" type="date" value={formData.date_of_onboarding || ''} onChange={handleInputChange} required />
                                </div>
                           </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90 shadow-lg px-8">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Onboarding & Activate Patient
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
