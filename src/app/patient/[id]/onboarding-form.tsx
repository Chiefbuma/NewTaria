'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, User, Corporate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { fetchUsers, fetchCorporates } from '@/lib/data';

interface OnboardingFormProps {
    patient: Patient;
}

export default function OnboardingForm({ patient }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [formData, setFormData] = useState<Partial<Patient>>({ 
        ...patient,
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
        consent_date: patient.consent_date ? new Date(patient.consent_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
     });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [navigators, setNavigators] = useState<User[]>([]);
    const [corporates, setCorporates] = useState<Corporate[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [navData, corpData] = await Promise.all([
                    fetchUsers(),
                    fetchCorporates()
                ]);
                setNavigators(navData.filter((u: User) => u.role === 'navigator'));
                setCorporates(corpData);
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
        
        const submissionData = {
            ...formData,
            status: 'Active',
            date_of_onboarding: new Date().toISOString().split('T')[0],
        };

        try {
            const res = await fetch(`/api/patients/${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submissionData),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to complete onboarding.');
            }

            toast({
                title: 'Onboarding Complete',
                description: `${patient.first_name} is now an active patient.`,
            });
            router.refresh(); 

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Onboarding Error',
                description: (error as Error).message,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Demographics (Step 2 of 2)</CardTitle>
                        <CardDescription>Complete the patient's profile with their demographic information.</CardDescription>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" value={formData.first_name || ''} onChange={handleInputChange} required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="middle_name">Middle Name</Label>
                            <Input id="middle_name" value={formData.middle_name || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="surname">Surname</Label>
                            <Input id="surname" value={formData.surname || ''} onChange={handleInputChange} required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" type="date" value={formData.dob || ''} onChange={handleInputChange} />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" value={formData.age || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="sex">Sex</Label>
                            <Select value={formData.sex || ''} onValueChange={(value) => handleSelectChange('sex', value)}>
                                <SelectTrigger id="sex"><SelectValue placeholder="Select sex" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="space-y-2 md:col-span-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" type="email" value={formData.email || ''} onChange={handleInputChange} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="phone">Phone</Label>
                            <Input id="phone" type="tel" value={formData.phone || ''} onChange={handleInputChange} />
                        </div>
                    </CardContent>
                </Card>
                
                <Card>
                    <CardHeader>
                        <CardTitle>Medical & Lifestyle</CardTitle>
                        <CardDescription>Capture important medical history and lifestyle factors.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="space-y-2">
                             <Label htmlFor="brief_medical_history">Brief Medical History</Label>
                            <Textarea id="brief_medical_history" value={formData.brief_medical_history || ''} onChange={handleInputChange} placeholder="e.g. Diagnosed with Type 2 Diabetes in 2020..."/>
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="years_since_diagnosis">Years Since Diagnosis (if applicable)</Label>
                            <Input id="years_since_diagnosis" type="number" value={formData.years_since_diagnosis || ''} onChange={handleInputChange} />
                        </div>
                        <div className="flex items-center space-x-4">
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
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Emergency & Administrative</CardTitle>
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
                            <Label htmlFor="emergency_contact_relation">Emergency Contact Relation</Label>
                            <Input id="emergency_contact_relation" value={formData.emergency_contact_relation || ''} onChange={handleInputChange} />
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
                            <Label htmlFor="consent_date">Consent Date</Label>
                            <Input id="consent_date" type="date" value={formData.consent_date || ''} onChange={handleInputChange} required />
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
    );
}
