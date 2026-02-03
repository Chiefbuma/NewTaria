'use client';
import { useState } from 'react';
import { Patient, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Target } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';

interface GoalListProps {
    patient: Patient;
    clinicalParameters: ClinicalParameter[];
}

export default function GoalList({ patient, clinicalParameters }: GoalListProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const [formData, setFormData] = useState({
        clinical_parameter_id: '',
        target_value: '',
        target_operator: 'less_than',
        deadline: '',
        notes: ''
    });

    const handleOpenModal = () => setIsModalOpen(true);
    const handleCloseModal = () => setIsModalOpen(false);
    
    const handleFormChange = (field: string, value: string) => {
        setFormData(prev => ({...prev, [field]: value}));
    };

    const handleSubmit = async () => {
        if (!formData.clinical_parameter_id || !formData.target_value || !formData.deadline) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please fill out all required fields.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/goals', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    patient_id: patient.id,
                    status: 'active'
                }),
            });
            if (!res.ok) throw new Error('Failed to save goal');
            toast({ title: 'Success', description: 'New health goal has been set.' });
            handleCloseModal();
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save goal.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const numericParams = clinicalParameters.filter(p => p.type === 'numeric');

    return (
        <>
            <Card>
                <CardHeader>
                     <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>Active Health Goals</CardTitle>
                            <CardDescription>Current health targets for this patient.</CardDescription>
                        </div>
                        <Button onClick={handleOpenModal}>
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Set New Goal
                        </Button>
                    </div>
                </CardHeader>
                <CardContent>
                    {patient.goals && patient.goals.length > 0 ? (
                        <div className="space-y-4">
                            {patient.goals.map(goal => (
                                <div key={goal.id} className="flex items-start gap-4 p-4 border rounded-lg">
                                    <div className="bg-primary/10 text-primary p-3 rounded-full">
                                        <Target className="h-6 w-6"/>
                                    </div>
                                    <div>
                                        <p className="font-semibold">{goal.parameter?.name}</p>
                                        <p className="text-muted-foreground">
                                            Target: {goal.target_operator.replace('_', ' ')} {goal.target_value} {goal.parameter?.unit}
                                        </p>
                                        <p className="text-sm text-muted-foreground">Deadline: {format(new Date(goal.deadline), "MMMM d, yyyy")}</p>
                                         {goal.notes && <p className="text-sm mt-2">{goal.notes}</p>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-muted-foreground">
                            <p>No active health goals.</p>
                            <p className="text-sm">Click "Set New Goal" to get started.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Set New Health Goal</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Metric to Track</Label>
                            <Select onValueChange={(val) => handleFormChange('clinical_parameter_id', val)} value={formData.clinical_parameter_id}>
                                <SelectTrigger><SelectValue placeholder="Select a numeric metric" /></SelectTrigger>
                                <SelectContent>
                                    {numericParams.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}
                                </SelectContent>
                            </Select>
                        </div>
                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Target Operator</Label>
                                 <Select onValueChange={(val) => handleFormChange('target_operator', val)} value={formData.target_operator}>
                                    <SelectTrigger><SelectValue /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="less_than">Less Than</SelectItem>
                                        <SelectItem value="greater_than">Greater Than</SelectItem>
                                        <SelectItem value="equal_to">Equal To</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Target Value</Label>
                                <Input type="number" value={formData.target_value} onChange={e => handleFormChange('target_value', e.target.value)} />
                            </div>
                         </div>
                          <div className="space-y-2">
                            <Label>Deadline</Label>
                            <Input type="date" value={formData.deadline} onChange={e => handleFormChange('deadline', e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Notes (optional)</Label>
                            <Textarea value={formData.notes} onChange={e => handleFormChange('notes', e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={handleCloseModal}>Cancel</Button>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Goal
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
