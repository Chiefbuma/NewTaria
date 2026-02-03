'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Patient, ClinicalParameter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";


const onboardingSchema = z.object({
  dob: z.string().optional(),
  sex: z.enum(['Male', 'Female', 'Other']).optional(),
  email: z.string().email().optional().or(z.literal('')),
  corporate_id: z.string().optional(),
  date_of_onboarding: z.string().nonempty("Date of onboarding is required."),
  has_glucometer: z.boolean().default(false),
  has_bp_machine: z.boolean().default(false),
  has_tape_measure: z.boolean().default(false),
  brief_medical_history: z.string().optional(),
  years_since_diagnosis: z.coerce.number().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
  emergency_contact_relation: z.string().optional(),
  navigator_id: z.string().optional(),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

interface OnboardingFormProps {
    patient: Patient;
    clinicalParameters: ClinicalParameter[];
}

export default function OnboardingForm({ patient }: OnboardingFormProps) {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);

    const form = useForm<OnboardingFormData>({
        resolver: zodResolver(onboardingSchema),
        defaultValues: {
            date_of_onboarding: new Date().toISOString().split('T')[0],
        },
    });

    const onSubmit = async (data: OnboardingFormData) => {
        setIsLoading(true);

        const payload = {
            ...data,
            status: 'Active',
            age: data.dob ? new Date().getFullYear() - new Date(data.dob).getFullYear() : patient.age,
        };

        try {
            const res = await fetch(`/api/patients/${patient.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update patient.');
            }
            
            toast({
                title: 'Onboarding Complete',
                description: `${patient.first_name} is now an active patient.`,
            });
            
            router.refresh();

        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: (error as Error).message,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle>Clinical Onboarding (Step 2 of 2)</CardTitle>
                <CardDescription>Complete the patient's profile with their medical and personal details.</CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Personal Details</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="dob" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Date of Birth</FormLabel>
                                        <FormControl><Input type="date" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="sex" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Sex</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select sex" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="Male">Male</SelectItem>
                                                <SelectItem value="Female">Female</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="email" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Email</FormLabel>
                                        <FormControl><Input type="email" placeholder="patient@example.com" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                             </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Medical History</h3>
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                               <FormField control={form.control} name="brief_medical_history" render={({ field }) => (
                                    <FormItem className="md:col-span-2">
                                        <FormLabel>Brief Medical History</FormLabel>
                                        <FormControl><Textarea placeholder="e.g., Diagnosed with Type 2 Diabetes..." {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="years_since_diagnosis" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Years Since Diagnosis</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                             </div>
                        </div>

                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Available Equipment</h3>
                            <div className="flex items-center space-x-6">
                                <FormField control={form.control} name="has_glucometer" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Glucometer</FormLabel>
                                        </div>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="has_bp_machine" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>BP Machine</FormLabel>
                                        </div>
                                    </FormItem>
                                )} />
                                 <FormField control={form.control} name="has_tape_measure" render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                                        <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>Tape Measure</FormLabel>
                                        </div>
                                    </FormItem>
                                )} />
                            </div>
                        </div>
                        
                        <div className="space-y-4">
                             <h3 className="font-semibold text-lg">Emergency Contact</h3>
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <FormField control={form.control} name="emergency_contact_name" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Name</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="emergency_contact_phone" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Contact Phone</FormLabel>
                                        <FormControl><Input type="tel" {...field} /></FormControl>
                                    </FormItem>
                                )} />
                                <FormField control={form.control} name="emergency_contact_relation" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Relation</FormLabel>
                                        <FormControl><Input {...field} /></FormControl>
                                    </FormItem>
                                )} />
                             </div>
                        </div>
                        
                        <div className="flex justify-end pt-4">
                            <Button type="submit" disabled={isLoading}>
                               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                               Complete Onboarding
                            </Button>
                        </div>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
