'use client';
import { useState } from 'react';
import type { Patient, ClinicalParameter } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from '@/components/ui/chart';

interface MetricGridProps {
    patient: Patient;
    clinicalParameters: ClinicalParameter[];
}

export default function MetricGrid({ patient, clinicalParameters }: MetricGridProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedParam, setSelectedParam] = useState<ClinicalParameter | null>(null);
    const [assessmentValue, setAssessmentValue] = useState('');
    const [assessmentNotes, setAssessmentNotes] = useState('');
    const [measuredAt, setMeasuredAt] = useState(new Date().toISOString().split('T')[0]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    const handleOpenModal = (param: ClinicalParameter) => {
        setSelectedParam(param);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedParam(null);
        setAssessmentValue('');
        setAssessmentNotes('');
        setMeasuredAt(new Date().toISOString().split('T')[0]);
    };

    const handleSubmit = async () => {
        if (!selectedParam || !assessmentValue) {
            toast({ variant: 'destructive', title: 'Missing Information', description: 'Please provide a value for the assessment.' });
            return;
        }
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/assessments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patient_id: patient.id,
                    clinical_parameter_id: selectedParam.id,
                    value: assessmentValue,
                    notes: assessmentNotes,
                    measured_at: measuredAt,
                }),
            });
            if (!res.ok) throw new Error('Failed to save assessment');
            toast({ title: 'Success', description: 'New assessment recorded.' });
            handleCloseModal();
            router.refresh();
        } catch (error) {
            toast({ variant: 'destructive', title: 'Error', description: 'Could not save assessment.' });
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getMetricHistory = (paramId: number) => {
        return patient.assessments
            ?.filter(a => a.clinical_parameter_id === paramId && a.parameter?.type === 'numeric' && !isNaN(parseFloat(a.value)))
            .map(a => ({
                date: format(new Date(a.measured_at), 'MMM d'),
                value: parseFloat(a.value)
            }))
            .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()) || [];
    };

    return (
        <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clinicalParameters.map(param => {
                    const latestAssessment = patient.assessments
                        ?.filter(a => a.clinical_parameter_id === param.id)
                        .sort((a,b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())[0];
                    
                    const history = getMetricHistory(param.id);
                    
                    const chartConfig = {
                        value: {
                            label: param.unit,
                            color: "hsl(var(--primary))",
                        },
                    } satisfies ChartConfig;


                    return (
                        <Card key={param.id}>
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{param.name}</CardTitle>
                                    <Button size="icon" variant="ghost" className="h-8 w-8" onClick={() => handleOpenModal(param)}>
                                        <PlusCircle className="h-5 w-5" />
                                    </Button>
                                </div>
                                <CardDescription>{param.unit || 'Most recent value'}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {latestAssessment ? (
                                    <div className="space-y-4">
                                        <p className="text-3xl font-bold">
                                            {latestAssessment.value}
                                            {param.unit && <span className="text-lg text-muted-foreground ml-2">{param.unit}</span>}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Recorded on {format(new Date(latestAssessment.measured_at), 'MMMM d, yyyy')}
                                        </p>
                                        {history.length > 1 && param.type === 'numeric' && (
                                             <ChartContainer config={chartConfig} className="h-[100px] w-full">
                                                <LineChart accessibilityLayer data={history} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                                                    <XAxis dataKey="date" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} tickLine={false} axisLine={false} />
                                                    <YAxis hide={true} domain={['dataMin - 5', 'dataMax + 5']} />
                                                    <ChartTooltip
                                                        cursor={false}
                                                        content={<ChartTooltipContent indicator="line" />}
                                                    />
                                                    <Line
                                                        dataKey="value"
                                                        type="monotone"
                                                        stroke="var(--color-value)"
                                                        strokeWidth={2}
                                                        dot={false}
                                                    />
                                                </LineChart>
                                            </ChartContainer>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-muted-foreground text-center py-8">No data recorded.</p>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <Dialog open={isModalOpen} onOpenChange={handleCloseModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Record New Assessment: {selectedParam?.name}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="measured_at">Measurement Date</Label>
                            <Input id="measured_at" type="date" value={measuredAt} onChange={(e) => setMeasuredAt(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="value">Value {selectedParam?.unit && `(${selectedParam.unit})`}</Label>
                            {selectedParam?.type === 'numeric' && <Input id="value" type="number" value={assessmentValue} onChange={e => setAssessmentValue(e.target.value)} />}
                            {selectedParam?.type === 'text' && <Input id="value" value={assessmentValue} onChange={e => setAssessmentValue(e.target.value)} />}
                            {selectedParam?.type === 'choice' && selectedParam.options && (
                                <Select onValueChange={setAssessmentValue} value={assessmentValue}>
                                    <SelectTrigger><SelectValue placeholder="Select an option" /></SelectTrigger>
                                    <SelectContent>
                                        {selectedParam.options.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="notes">Notes (optional)</Label>
                            <Textarea id="notes" value={assessmentNotes} onChange={e => setAssessmentNotes(e.target.value)} />
                        </div>
                    </div>
                    <DialogFooter>
                         <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSubmit} disabled={isSubmitting}>
                            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Assessment
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
