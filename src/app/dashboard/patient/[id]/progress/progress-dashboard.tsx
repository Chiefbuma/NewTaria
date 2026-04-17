
'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Patient, ClinicalParameter, Assessment, Goal } from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Target, FileText, Plus, Loader2, Pencil, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { createAssessment, createPatientAssessment, deletePatientAssessment, updatePatientAssessment } from '@/lib/api-service';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

const ParameterDonutChart = ({ assessments, parameter, goal }: { assessments: Assessment[], parameter: ClinicalParameter, goal?: Goal | null }) => {
    
    const data = useMemo(() => {
        if (parameter.type === 'choice') {
            // Calculate distribution of choices
            const distribution: Record<string, number> = {};
            assessments.forEach(a => {
                distribution[a.value] = (distribution[a.value] || 0) + 1;
            });
            
            const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];
            
            return Object.entries(distribution).map(([name, value], idx) => ({
                name,
                value,
                fill: COLORS[idx % COLORS.length]
            }));
        }

        if (!goal) {
            const normal = assessments.filter(a => a.is_normal === true).length;
            const abnormal = assessments.filter(a => a.is_normal === false).length;
            
            const result = [];
            if (normal > 0) result.push({ name: 'Normal', value: normal, fill: 'hsl(var(--chart-2))' });
            if (abnormal > 0) result.push({ name: 'Abnormal', value: abnormal, fill: 'hsl(var(--chart-5))' });
            return result;
        }

        const checkTargetMet = (assessmentValue: string, goal: Goal) => {
            const current = parseFloat(assessmentValue);
            const target = parseFloat(goal.target_value);
            if (isNaN(current) || isNaN(target)) return assessmentValue === goal.target_value;

            switch (goal.target_operator) {
                case '<': return current < target;
                case '<=': return current <= target;
                case '=': return current === target;
                case '>=': return current >= target;
                case '>': return current > target;
                default: return false;
            }
        };

        const onTrackCount = assessments.filter(a => checkTargetMet(a.value, goal)).length;
        const needsImprovementCount = assessments.length - onTrackCount;
        
        const result = [];
        if (onTrackCount > 0) result.push({ name: 'Achieved/On Track', value: onTrackCount, fill: 'hsl(var(--chart-2))' });
        if (needsImprovementCount > 0) result.push({ name: 'Off Track', value: needsImprovementCount, fill: 'hsl(var(--chart-5))' });
        
        return result;

    }, [assessments, goal, parameter]);

    const title = parameter.type === 'choice' ? 'Distribution' : (goal ? 'Goal Achievement' : 'Status Overview');
    const chartConfig = {
        value: { label: 'Assessments', color: 'hsl(var(--primary))' }
    };

    if (data.length === 0) return null;
    
    return (
        <Card className="h-full flex flex-col border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><Target className="h-4 w-4 text-primary"/>{title}</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center pt-0">
                <div className="w-full aspect-square max-h-[180px]">
                    <ChartContainer config={chartConfig} className="h-full w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    dataKey="value"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    innerRadius="60%"
                                    outerRadius="90%"
                                    paddingAngle={5}
                                    stroke="none"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    content={<ChartTooltipContent hideLabel />}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </ChartContainer>
                </div>
                <div className="mt-4 space-y-1 w-full">
                    {data.map((entry, index) => (
                        <div key={index} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.fill }} />
                                <span className="text-muted-foreground font-medium">{entry.name}</span>
                            </div>
                            <span className="font-bold text-foreground">
                                {((entry.value / data.reduce((acc, curr) => acc + curr.value, 0)) * 100).toFixed(0)}%
                            </span>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    )
}

const ParameterTextTable = ({ assessments, parameter }: { assessments: Assessment[]; parameter: ClinicalParameter }) => {
    const latestAssessments = assessments
        .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
        .slice(0, 4);

    return (
        <Card className="h-full border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><FileText className="h-4 w-4 text-primary"/>Recent Entries</CardTitle>
            </CardHeader>
            <CardContent>
                {latestAssessments.length > 0 ? (
                    <div className="space-y-3">
                        {latestAssessments.map((a) => (
                            <div key={a.id} className="p-3 bg-muted/50 rounded-lg border border-primary/5">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        {format(new Date(a.measured_at), 'MMM dd, yyyy')}
                                    </span>
                                </div>
                                {parameter.type === 'image' ? (
                                  <a href={a.value} target="_blank" rel="noreferrer" className="block">
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={a.value} alt="Assessment upload" className="mt-1 max-h-[220px] w-full rounded-md object-contain" />
                                  </a>
                                ) : parameter.type === 'voice' ? (
                                  <audio controls src={a.value} className="mt-1 w-full" />
                                ) : (
                                  <p className="text-sm text-foreground leading-relaxed">{a.value}</p>
                                )}
                                {a.notes && <p className="text-[10px] text-muted-foreground mt-1 italic">"{a.notes}"</p>}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex min-h-[200px] items-center justify-center">
                        <p className="text-xs text-muted-foreground">No entries in the selected date range.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

const ParameterLineChart = ({ assessments, parameter, goal }: { assessments: Assessment[], parameter: ClinicalParameter, goal?: Goal | null }) => {
    const chartData = useMemo(() => {
        const dailySummary: { [date: string]: { sum: number, count: number } } = {};

        assessments.forEach(assessment => {
            const dateKey = format(new Date(assessment.measured_at), 'yyyy-MM-dd');
            const value = parseFloat(assessment.value);
            
            if (!isNaN(value)) {
                if (!dailySummary[dateKey]) {
                    dailySummary[dateKey] = { sum: 0, count: 0 };
                }
                dailySummary[dateKey].sum += value;
                dailySummary[dateKey].count += 1;
            }
        });
        
        return Object.entries(dailySummary)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, data]) => ({
                date: format(new Date(date), 'MMM dd'),
                fullDate: format(new Date(date), 'MMMM dd, yyyy'),
                value: parseFloat((data.sum / data.count).toFixed(2)),
            }));

    }, [assessments]);

    const targetValue = useMemo(() => {
        if (!goal) return null;
        const t = parseFloat(goal.target_value);
        return Number.isFinite(t) ? t : null;
    }, [goal]);

    const yDomain = useMemo((): [number, number] | undefined => {
        if (chartData.length === 0) return undefined;
        const values = chartData.map((d) => d.value);
        const minValue = Math.min(...values, targetValue ?? Infinity);
        const maxValue = Math.max(...values, targetValue ?? -Infinity);

        // Give the chart a little breathing room; fall back to +/-1 when flat.
        const span = maxValue - minValue;
        const pad = span > 0 ? span * 0.12 : 1;
        return [minValue - pad, maxValue + pad];
    }, [chartData, targetValue]);

    const chartConfig = {
        value: { label: parameter.name, color: 'hsl(var(--primary))' }
    };

    return (
        <Card className="h-full flex flex-col border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"><BarChart className="h-4 w-4 text-primary"/>Trend Analysis</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 pt-4">
                {chartData.length > 0 ? (
                    <div className="h-full min-h-[200px]">
                        <ChartContainer config={chartConfig} className="h-full w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsla(var(--muted-foreground), 0.1)" />
                                    <XAxis 
                                        dataKey="date" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                                    />
                                    <YAxis 
                                        domain={yDomain}
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                                    />
                                    <Tooltip content={<ChartTooltipContent labelKey="fullDate" />} />
                                    {targetValue !== null && (
                                        <ReferenceLine
                                            y={targetValue}
                                            stroke="hsla(var(--muted-foreground), 0.55)"
                                            strokeDasharray="4 4"
                                            ifOverflow="extendDomain"
                                            label={{
                                                value: `Target ${goal?.target_operator ?? ''} ${goal?.target_value ?? ''}`.trim(),
                                                position: 'insideTopRight',
                                                fill: 'hsla(var(--muted-foreground), 0.9)',
                                                fontSize: 10,
                                            }}
                                        />
                                    )}
                                    <Line 
                                        type="monotone" 
                                        dataKey="value" 
                                        name={parameter.name} 
                                        stroke="hsl(var(--primary))" 
                                        strokeWidth={3} 
                                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                                        activeDot={{ r: 6 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </ChartContainer>
                    </div>
                ) : (
                    <div className="h-full flex items-center justify-center min-h-[200px]">
                        <p className="text-xs text-muted-foreground">Insufficient data for trend analysis.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

function todayYmd() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function SelfMonitorSheet({
  parameter,
  goal,
  patientId,
  mode,
  intent = 'create',
  existingAssessment,
  onCreated,
  onUpdated,
}: {
  parameter: ClinicalParameter;
  goal: Goal;
  patientId: number;
  mode: 'patient' | 'staff';
  intent?: 'create' | 'edit';
  existingAssessment?: Assessment | null;
  onCreated: (assessment: Assessment) => void;
  onUpdated?: (assessment: Assessment) => void;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(existingAssessment?.value ?? '');
  const [notes, setNotes] = useState(existingAssessment?.notes ?? '');
  const [date, setDate] = useState(() => {
    if (!existingAssessment?.measured_at) return todayYmd();
    const d = new Date(existingAssessment.measured_at);
    if (Number.isNaN(d.getTime())) return todayYmd();
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (intent === 'edit' && existingAssessment) {
      setValue(existingAssessment.value ?? '');
      setNotes(existingAssessment.notes ?? '');
      const d = new Date(existingAssessment.measured_at);
      const pad = (n: number) => String(n).padStart(2, '0');
      setDate(
        Number.isNaN(d.getTime())
          ? todayYmd()
          : `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      );
      return;
    }
    // Create: reset to a clean form when opening.
    setValue('');
    setNotes('');
    setDate(todayYmd());
  }, [open, intent, existingAssessment?.id]);

  const uploadFile = async (file: File, kind: 'image' | 'voice') => {
    const formData = new FormData();
    formData.set('kind', kind);
    formData.set('file', file);
    const res = await fetch('/api/uploads', { method: 'POST', body: formData });
    if (!res.ok) {
      let msg = `Upload failed (${res.status})`;
      try {
        const data = await res.json();
        msg = data?.error || msg;
      } catch { /* ignore */ }
      throw new Error(msg);
    }
    return res.json() as Promise<{ url: string }>;
  };

  const handleFileChange = async (file: File | null) => {
    if (!file) return;
    if (parameter.type !== 'image' && parameter.type !== 'voice') return;

    try {
      setIsUploading(true);
      const result = await uploadFile(file, parameter.type);
      setValue(result.url);
      toast({ title: 'Uploaded', description: 'Attachment ready to submit.' });
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Upload failed', description: e?.message || 'Could not upload file.' });
    } finally {
      setIsUploading(false);
    }
  };

  const submit = async () => {
    if (isUploading) return;
    if (!date || !value.trim()) {
      toast({ variant: 'destructive', title: 'Missing details', description: 'Please enter a value and a date.' });
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingAssessment?.id && mode === 'patient') {
        const updated = await updatePatientAssessment({
          id: existingAssessment.id,
          value: value.trim(),
          measured_at: date,
          notes: notes.trim() ? notes.trim() : null,
        });
        onUpdated?.(updated);
        toast({ title: 'Updated', description: 'Your latest check-in has been updated.' });
      } else {
        const created =
          mode === 'patient'
            ? await createPatientAssessment({
                clinical_parameter_id: parameter.id,
                value: value.trim(),
                measured_at: date, // date-only (no time)
                notes: notes.trim() ? notes.trim() : null,
              })
            : await createAssessment({
                patient_id: patientId,
                clinical_parameter_id: parameter.id,
                value: value.trim(),
                measured_at: date, // date-only (no time)
                notes: notes.trim() ? notes.trim() : null,
                is_normal: null,
              });
        onCreated(created);
        toast({ title: 'Saved', description: 'Your check-in has been recorded.' });
      }
      setOpen(false);
      setValue('');
      setNotes('');
      setDate(todayYmd());
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Could not save assessment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const valueLabel =
    parameter.type === 'image' ? 'Photo' :
    parameter.type === 'voice' ? 'Voice note' :
    'Value';

  const renderValueInput = () => {
    if (parameter.type === 'numeric') {
      return <Input type="number" step="any" className="h-10" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    if (parameter.type === 'choice') {
      return (
        <Select value={value} onValueChange={setValue}>
          <SelectTrigger className="h-10">
            <SelectValue placeholder="Select..." />
          </SelectTrigger>
          <SelectContent>
            {(parameter.options ?? []).map((opt) => (
              <SelectItem key={opt} value={opt}>{opt}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    }
    if (parameter.type === 'text') {
      return <Textarea className="min-h-24" value={value} onChange={(e) => setValue(e.target.value)} />;
    }
    if (parameter.type === 'image') {
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            disabled={isUploading}
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {value ? (
            <div className="rounded-md border border-border bg-muted/20 p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={value} alt="Uploaded photo" className="max-h-44 w-full rounded object-contain" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Upload a photo (or use camera capture on mobile).</p>
          )}
        </div>
      );
    }
    if (parameter.type === 'voice') {
      return (
        <div className="space-y-2">
          <Input
            type="file"
            accept="audio/*"
            capture="user"
            disabled={isUploading}
            onChange={(e) => handleFileChange(e.target.files?.[0] ?? null)}
          />
          {value ? (
            <div className="rounded-md border border-border bg-muted/20 p-2">
              <audio controls src={value} className="w-full" />
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Upload a voice note (or use microphone capture on mobile).</p>
          )}
        </div>
      );
    }
    return <Input className="h-10" value={value} onChange={(e) => setValue(e.target.value)} />;
  };

  const triggerLabel = intent === 'edit' ? 'Edit latest check-in' : 'Add check-in';
  const TriggerIcon = intent === 'edit' ? Pencil : Plus;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="icon"
          variant="outline"
          className="h-8 w-8 rounded-xl"
          title={triggerLabel}
        >
          <TriggerIcon className="h-4 w-4" />
          <span className="sr-only">{triggerLabel}</span>
        </Button>
      </SheetTrigger>
      <SheetContent className="h-full w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] overflow-y-auto p-4 sm:w-[540px] sm:max-w-xl sm:p-6">
        <SheetHeader className="mb-4">
          <SheetTitle>{intent === 'edit' ? 'Edit latest check-in' : 'Add check-in'}</SheetTitle>
            <p className="text-sm text-muted-foreground">
                Target: {goal.target_operator} {goal.target_value}
            </p>
        </SheetHeader>
        
        <div className="space-y-4 pb-24">
            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Date</Label>
                <Input type="date" className="h-10" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">{valueLabel}</Label>
                {renderValueInput()}
            </div>

            <div className="space-y-1.5">
                <Label className="text-sm font-medium">Notes (optional)</Label>
                <Textarea className="min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} />
            </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex justify-end gap-2">
                <SheetClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting || isUploading}>
                        Cancel
                    </Button>
                </SheetClose>
                <Button type="button" onClick={submit} disabled={isSubmitting || isUploading || !value.trim() || !date}>
                    {(isSubmitting || isUploading) ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save
                </Button>
            </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default function ProgressDashboard({ 
    patient, 
    clinicalParameters,
    patientView = false,
    onAssessmentsUpdate,
    checkInMode = 'staff',
    currentUserId,
}: { 
    patient: Patient, 
    clinicalParameters: ClinicalParameter[],
    patientView?: boolean,
    onAssessmentsUpdate?: (assessments: Assessment[]) => void,
    checkInMode?: 'patient' | 'staff' | 'none',
    currentUserId?: number | null,
}) {
    const { toast } = useToast();
    const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);
    
    const trackedParameters = useMemo(() => {
        const latestGoalByParameter = new Map<number, Goal>();

        patient.goals
            .filter((goal) => goal.deleted_at === null || goal.deleted_at === undefined)
            .forEach((goal) => {
                if (!latestGoalByParameter.has(goal.clinical_parameter_id)) {
                    latestGoalByParameter.set(goal.clinical_parameter_id, goal);
                }
            });

        return Array.from(latestGoalByParameter.entries())
            .map(([parameterId, goal]) => {
                const parameter = clinicalParameters.find((item) => item.id === parameterId);
                if (!parameter) return null;

                const assessments = patient.assessments
                    .filter((assessment) => assessment.clinical_parameter_id === parameterId && (assessment.deleted_at == null))
                    .sort((a, b) => new Date(a.measured_at).getTime() - new Date(b.measured_at).getTime());

                return { parameter, goal, assessments };
            })
            .filter((item): item is { parameter: ClinicalParameter; goal: Goal; assessments: Assessment[] } => !!item);
    }, [patient.goals, patient.assessments, clinicalParameters]);


    return (
        <div className={patientView ? "space-y-6" : "space-y-10"}>
            {trackedParameters.length > 0 ? (
                trackedParameters.map(({ parameter, assessments, goal }) => {
                    const latestMine =
                      checkInMode === 'patient' && currentUserId
                        ? [...patient.assessments]
                            .filter(
                              (a) =>
                                a.deleted_at == null &&
                                a.clinical_parameter_id === parameter.id &&
                                Number(a.created_by_user_id ?? 0) === Number(currentUserId)
                            )
                            .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
                            [0] ?? null
                        : null;
                    const canShowCheckInControls =
                      checkInMode !== 'none' &&
                      (checkInMode !== 'patient' || Boolean(parameter.allow_self_monitoring));
                    return (
                        <Card key={parameter.id} className="overflow-hidden border-primary/10 shadow-[0_24px_50px_-34px_rgba(15,23,42,0.22)]">
                            <CardHeader className="bg-muted/30">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-xl font-bold tracking-tight text-foreground">{parameter.name}</h2>
                                        {parameter.unit && (
                                            <span className="rounded-md border border-primary/20 bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                                                {parameter.unit}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {canShowCheckInControls ? (
                                        <div className="flex items-center gap-1.5">
                                          <SelfMonitorSheet
                                            parameter={parameter}
                                            goal={goal}
                                            patientId={patient.id}
                                            mode={checkInMode === 'patient' ? 'patient' : 'staff'}
                                            onCreated={(created) => {
                                              const updated = [...patient.assessments, created];
                                              onAssessmentsUpdate?.(updated);
                                            }}
                                          />
                                          {checkInMode === 'patient' && latestMine ? (
                                            <>
                                              <SelfMonitorSheet
                                                intent="edit"
                                                parameter={parameter}
                                                goal={goal}
                                                patientId={patient.id}
                                                mode="patient"
                                                existingAssessment={latestMine}
                                                onCreated={() => {}}
                                                onUpdated={(updatedRow) => {
                                                  const updated = patient.assessments.map((a) => a.id === updatedRow.id ? { ...a, ...updatedRow } : a);
                                                  onAssessmentsUpdate?.(updated);
                                                }}
                                              />

                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button
                                                    type="button"
                                                    size="icon"
                                                    variant="outline"
                                                    className="h-8 w-8 rounded-xl text-destructive"
                                                    title="Delete latest check-in"
                                                    disabled={pendingDeleteId === latestMine.id}
                                                  >
                                                    <Trash2 className="h-4 w-4" />
                                                    <span className="sr-only">Delete latest check-in</span>
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>Delete latest check-in?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      This will remove your most recent check-in for this goal. You can only delete the latest one.
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction
                                                      className="bg-destructive hover:bg-destructive/90"
                                                      onClick={async () => {
                                                        try {
                                                          setPendingDeleteId(latestMine.id);
                                                          await deletePatientAssessment(latestMine.id);
                                                          const updated = patient.assessments.filter((a) => a.id !== latestMine.id);
                                                          onAssessmentsUpdate?.(updated);
                                                          toast({ title: 'Deleted', description: 'Your latest check-in was deleted.' });
                                                        } catch (e: any) {
                                                          toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to delete check-in.' });
                                                        } finally {
                                                          setPendingDeleteId(null);
                                                        }
                                                      }}
                                                    >
                                                      Delete
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
                                            </>
                                          ) : null}
                                        </div>
                                      ) : null}
                                      <span className="rounded bg-background px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                                          {parameter.type}
                                      </span>
                                    </div>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                    {goal ? `Target: ${goal.target_operator} ${goal.target_value}` : 'Recent activity and progress summary'}
                                </p>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
                                    {parameter.type === 'numeric' ? (
                                        <>
                                            <div className="lg:col-span-4">
                                                <ParameterDonutChart assessments={assessments} parameter={parameter} goal={goal} />
                                            </div>
                                            <div className="lg:col-span-8">
                                                <ParameterLineChart assessments={assessments} parameter={parameter} goal={goal} />
                                            </div>
                                        </>
                                    ) : parameter.type === 'choice' ? (
                                        <>
                                            <div className="lg:col-span-4">
                                                <ParameterDonutChart assessments={assessments} parameter={parameter} goal={goal} />
                                            </div>
                                            <div className="lg:col-span-8">
                                                <ParameterTextTable assessments={assessments} parameter={parameter} />
                                            </div>
                                        </>
                                    ) : (
                                        <div className="lg:col-span-12">
                                            <ParameterTextTable assessments={assessments} parameter={parameter} />
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    )
                })
            ) : (
                 <div className="text-center py-24 rounded-2xl bg-muted/20 border-2 border-dashed border-primary/10">
                    <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-6">
                        <BarChart className="h-8 w-8 text-primary/30" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">No Tracked Goals</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
                        This patient does not have any assigned goals yet, so there are no parameters to track on the progress dashboard.
                    </p>
                </div>
            )}
        </div>
    )
}
