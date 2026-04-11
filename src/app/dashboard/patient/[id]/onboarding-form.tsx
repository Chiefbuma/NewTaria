
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
import { isPartnerRole } from '@/lib/role-utils';

interface OnboardingFormProps {
    patient: Patient;
    initialPartners: Partner[];
    currentUser: User | null;
}

export default function OnboardingForm({ patient, initialPartners, currentUser }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [partners, setPartners] = useState<Partner[]>(initialPartners);
    const [formData, setFormData] = useState<Partial<Patient>>({ 
        ...patient,
        date_of_onboarding: patient.date_of_onboarding ? new Date(patient.date_of_onboarding).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
     });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (currentUser) {
            setFormData(prev => ({
                ...prev,
                navigator_id: currentUser.id,
                emr_number: `EMR/TAR/${patient.id}`,
                ...(isPartnerRole(currentUser.role) && currentUser.partner_id ? { partner_id: currentUser.partner_id } : {}),
            }));
        }
        // Fetch fresh partners
        fetch('/api/partners').then(res => res.json()).then((list: Partner[]) => {
            if (isPartnerRole(currentUser?.role) && currentUser?.partner_id) {
                setPartners(list.filter((p) => Number(p.id) === Number(currentUser.partner_id)));
                return;
            }
            setPartners(list);
        });
    }, [currentUser, patient.id]);
    
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
        <div className="mx-auto w-full max-w-4xl">
            <PatientHeader patient={patient} />
            <form onSubmit={handleSubmit}>
                <div className="space-y-6">
                    {/* Patient Bio Section */}
                    <Card className="border-primary/10">
                        <CardHeader className="form-header-bar items-center">
                            <CardTitle className="text-center text-foreground">Patient Bio</CardTitle>
                            <CardDescription className="pt-2 text-muted-foreground">Capture basic demographic information.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 px-4 pt-6 sm:px-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="dob">Date of Birth</Label>
                                <Input id="dob" type="date" value={formData.dob || ''} onChange={handleInputChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="gender">Gender</Label>
                                <Select value={formData.gender || ''} onValueChange={(v) => handleSelectChange('gender', v)} required>
                                    <SelectTrigger className="border-primary/20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <Label htmlFor="phone">Phone Number</Label>
                                <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} required />
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="border-primary/10">
                        <CardHeader className="form-header-bar items-center">
                            <CardTitle className="text-center text-foreground">Medical History</CardTitle>
                            <CardDescription className="pt-2 text-muted-foreground">Capture clinical history and primary diagnosis.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 pt-6 sm:px-6">
                            <div className="space-y-2">
                                <Label htmlFor="primary_diagnosis">Primary Diagnosis</Label>
                                <Select value={formData.primary_diagnosis || ''} onValueChange={(v) => handleSelectChange('primary_diagnosis', v)} required>
                                    <SelectTrigger className="border-primary/20 font-semibold"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Hypertension">Hypertension</SelectItem>
                                        <SelectItem value="Diabetes">Diabetes</SelectItem>
                                        <SelectItem value="Hypertension and Diabetes">Hypertension and Diabetes</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="brief_medical_history">Brief Medical History</Label>
                                <Textarea id="brief_medical_history" value={formData.brief_medical_history || ''} onChange={handleInputChange} />
                            </div>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <CardHeader className="form-header-bar items-center">
                            <CardTitle className="text-center text-foreground">Lifestyle & Environment</CardTitle>
                            <CardDescription className="pt-2 text-muted-foreground">Understand the patient's daily life and environment.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 px-4 pt-6 sm:px-6">
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
                        <CardHeader className="form-header-bar items-center">
                            <CardTitle className="text-center text-foreground">Emergency Contact & Administrative</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 gap-4 px-4 pt-6 sm:px-6">
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
                                    <SelectTrigger className="border-primary/20"><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="spouse">Spouse</SelectItem>
                                        <SelectItem value="sibling">Sibling</SelectItem>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="child">Child</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
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
                                <Select
                                    value={String(formData.partner_id || 'null')}
                                    onValueChange={(value) => handleSelectChange('partner_id', value)}
                                    disabled={isPartnerRole(currentUser?.role)}
                                >
                                    <SelectTrigger className="border-primary/20"><SelectValue placeholder="Select partner" /></SelectTrigger>
                                    <SelectContent>
                                        {isPartnerRole(currentUser?.role) ? (
                                            currentUser?.partner_id ? (
                                                <SelectItem value={String(currentUser.partner_id)}>{currentUser.partner_name || 'Your Partner'}</SelectItem>
                                            ) : (
                                                <SelectItem value="null">No partner linked</SelectItem>
                                            )
                                        ) : (
                                            <>
                                                <SelectItem value="null">None</SelectItem>
                                                {partners.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                            </>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    
                    <Card className="border-primary/10">
                        <CardHeader className="form-header-bar items-center">
                            <CardTitle className="text-center text-foreground">Equipment & Consent</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 px-4 pt-6 sm:px-6">
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

                    <div className="flex justify-stretch sm:justify-end">
                        <Button type="submit" disabled={isSubmitting} className="w-full bg-primary px-8 font-bold shadow-lg hover:bg-primary/90 sm:w-auto">
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Onboarding & Activate Patient
                        </Button>
                    </div>
                </div>
            </form>
        </div>
    );
}
