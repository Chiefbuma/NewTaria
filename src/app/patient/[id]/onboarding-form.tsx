'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, User, Corporate, Payer } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchUsers, fetchCorporates, fetchPayers } from '@/lib/data';
import PatientHeader from './patient-header';

interface OnboardingFormProps {
    patient: Patient;
}

export default function OnboardingForm({ patient }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Patient>>({ 
        ...patient,
        consent_date: patient.consent_date ? new Date(patient.consent_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        date_of_onboarding: patient.date_of_onboarding ? new Date(patient.date_of_onboarding).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
     });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [navigators, setNavigators] = useState<User[]>([]);
    const [corporates, setCorporates] = useState<Corporate[]>([]);
    const [payers, setPayers] = useState<Payer[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [navData, corpData, payerData] = await Promise.all([
                    fetchUsers(),
                    fetchCorporates(),
                    fetchPayers()
                ]);
                setNavigators(navData.filter((u: User) => u.role === 'navigator'));
                setCorporates(corpData);
                setPayers(payerData);
            } catch (error) {
                toast({ variant: 'destructive', title: 'Error', description: 'Failed to load necessary data.' });
            }
        };
        fetchData();
    }, [toast]);
    
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
        
        await new Promise(resolve => setTimeout(resolve, 500));

        toast({
            title: 'Onboarding Complete (Mock)',
            description: `${patient.first_name} is now marked as Active. This will not persist on page refresh.`,
        });
        
        router.refresh(); 
        setIsSubmitting(false);
    };

    return (
        <div className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
            <PatientHeader patient={patient} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle>Medical History</CardTitle>
                            <CardDescription>Capture important medical history and diagnoses.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="brief_medical_history">Brief Medical History</Label>
                                <Textarea id="brief_medical_history" value={formData.brief_medical_history || ''} onChange={handleInputChange} placeholder="e.g. Diagnosed with Type 2 Diabetes in 2020..."/>
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <Textarea id="relevant_family_history" value={formData.relevant_family_history || ''} onChange={handleInputChange} placeholder="e.g. Father has history of heart disease..."/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Lifestyle & Environment</CardTitle>
                            <CardDescription>Understand the patient's daily life and environment.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                                <Textarea id="lifestyle_factors" value={formData.lifestyle_factors || ''} onChange={handleInputChange} placeholder="e.g. Smoker, exercises 3x/week, stressful job..." />
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="physical_limitations">Physical Limitations</Label>
                                <Textarea id="physical_limitations" value={formData.physical_limitations || ''} onChange={handleInputChange} />
                            </div>
                             <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="psychosocial_factors">Psychosocial Factors</Label>
                                <Textarea id="psychosocial_factors" value={formData.psychosocial_factors || ''} onChange={handleInputChange} placeholder="e.g. Lives alone, strong family support..."/>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Emergency Contact & Administrative</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                <Input id="emergency_contact_relation" value={formData.emergency_contact_relation || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="emr_number">EMR Number</Label>
                                <Input id="emr_number" value={formData.emr_number || ''} onChange={handleInputChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="navigator_id">Assign Navigator</Label>
                                <Select value={String(formData.navigator_id || '')} onValueChange={(value) => handleSelectChange('navigator_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a navigator" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">Unassigned</SelectItem>
                                        {navigators.map(n => <SelectItem key={n.id} value={String(n.id)}>{n.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="corporate_id">Assign Corporate</Label>
                                <Select value={String(formData.corporate_id || 'null')} onValueChange={(value) => handleSelectChange('corporate_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a corporate" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None</SelectItem>
                                        {corporates.map(c => <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                             <div className="space-y-2">
                                <Label htmlFor="payer_id">Assign Payer</Label>
                                <Select value={String(formData.payer_id || 'null')} onValueChange={(value) => handleSelectChange('payer_id', value)}>
                                    <SelectTrigger><SelectValue placeholder="Select a payer" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="null">None</SelectItem>
                                        {payers.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader>
                            <CardTitle>Equipment & Consent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_weighing_scale" checked={formData.has_weighing_scale || false} onCheckedChange={(checked) => handleSwitchChange('has_weighing_scale', checked)} />
                                    <Label htmlFor="has_weighing_scale">Has Weighing Scale</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_glucometer" checked={formData.has_glucometer || false} onCheckedChange={(checked) => handleSwitchChange('has_glucometer', checked)} />
                                    <Label htmlFor="has_glucometer">Has Glucometer</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_bp_machine" checked={formData.has_bp_machine || false} onCheckedChange={(checked) => handleSwitchChange('has_bp_machine', checked)} />
                                    <Label htmlFor="has_bp_machine">Has BP Machine</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Switch id="has_tape_measure" checked={formData.has_tape_measure || false} onCheckedChange={(checked) => handleSwitchChange('has_tape_measure', checked)} />
                                    <Label htmlFor="has_tape_measure">Has Tape Measure</Label>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                               <div className="space-y-2">
                                    <Label htmlFor="date_of_onboarding">Date of Onboarding</Label>
                                    <Input id="date_of_onboarding" type="date" value={formData.date_of_onboarding || ''} onChange={handleInputChange} required />
                                </div>
                               <div className="space-y-2">
                                    <Label htmlFor="consent_date">Consent Date</Label>
                                    <Input id="consent_date" type="date" value={formData.consent_date || ''} onChange={handleInputChange} required />
                                </div>
                           </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-4">
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Onboarding & Activate Patient
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
