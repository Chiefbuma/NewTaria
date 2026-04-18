
'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { 
    Patient, 
    User, 
    Goal, 
    ClinicalParameter, 
    Assessment, 
    Review, 
    Prescription, 
    Medication, 
    Appointment 
} from '@/lib/types';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Activity,
  PlusCircle,
  Pencil,
  Save,
  FileText,
  Loader2,
  Trash2,
  Edit,
  History,
  CheckCircle,
  Clock,
  Building2,
  Stethoscope,
  ShieldAlert,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import ReportViewer from '@/components/report-viewer';
import AddAssessmentSheet from '@/components/patient/add-assessment-sheet';
import PrescriptionManagement from '@/components/patient/prescription-management';
import AppointmentsCard from '@/components/patient/appointments-card';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AddGoalSheet from '@/components/patient/add-goal-sheet';
import { ConfirmActionDialog } from '@/components/ui/confirm-action-dialog';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SlideOver, SlideOverContent, SlideOverTrigger } from '@/components/ui/slide-over';
import { getGoalProgressState } from '@/lib/goal-status';
import {
    createAssessment, 
    deleteAssessment, 
    updateAssessment as updateAssessmentApi,
    createGoal, 
    deleteGoal, 
    createReview, 
    updatePatient,
} from '@/lib/api-service';
import {
  canManageAppointments as canRoleManageAppointments,
  canManageAssessments as canRoleManageAssessments,
  canManagePrescriptions as canRoleManagePrescriptions,
  canManageReviews as canRoleManageReviews,
  isPartnerRole,
} from '@/lib/role-utils';

function todayYmd() {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function GoalCheckInSheet({
  patientId,
  parameter,
  goal,
  onCreated,
  disabled,
}: {
  patientId: number;
  parameter: ClinicalParameter | undefined;
  goal: Goal;
  onCreated: (assessment: Assessment) => void;
  disabled?: boolean;
}) {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');
  const [notes, setNotes] = useState('');
  const [date, setDate] = useState(todayYmd());
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    if (!file || !parameter) return;
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
    if (!parameter) return;
    if (isUploading) return;
    if (!date || !value.trim()) {
      toast({ variant: 'destructive', title: 'Missing details', description: 'Please enter a value and a date.' });
      return;
    }

    setIsSubmitting(true);
    try {
      const saved = await createAssessment({
        patient_id: patientId,
        clinical_parameter_id: parameter.id,
        value: value.trim(),
        notes: notes.trim() ? notes.trim() : null,
        measured_at: date, // date-only
        is_normal: null,
      });
      onCreated(saved);
      toast({ title: 'Success', description: 'Assessment saved.' });
      setOpen(false);
      setValue('');
      setNotes('');
      setDate(todayYmd());
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Error', description: e?.message || 'Failed to save assessment.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderValueInput = () => {
    if (!parameter) return <Input disabled className="h-10" />;
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

  return (
    <SlideOver
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (v) {
          setValue('');
          setNotes('');
          setDate(todayYmd());
        }
      }}
    >
      <SlideOverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled || !parameter}
          className="h-8 w-8 text-primary hover:bg-primary/10"
          title="Add check-in"
        >
          <PlusCircle className="h-4 w-4" />
          <span className="sr-only">Add check-in</span>
        </Button>
      </SlideOverTrigger>
      <SlideOverContent className="w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] p-0 sm:w-[440px] sm:max-w-md">
        <SheetHeader className="px-4 py-3 border-b">
            <SheetTitle>Add Check-in</SheetTitle>
            <p className="text-sm text-muted-foreground">Target: {goal.target_operator} {goal.target_value}</p>
        </SheetHeader>
        <div className="p-4 space-y-4">
          <div className="space-y-1.5">
            <Label>Date</Label>
            <Input type="date" className="h-10" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>
              {parameter?.type === 'image' ? 'Photo' : parameter?.type === 'voice' ? 'Voice note' : 'Value'}
            </Label>
            {renderValueInput()}
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <Textarea className="min-h-24" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
        </div>
        <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
            <div className="flex justify-end gap-2">
                <SheetClose asChild>
                    <Button type="button" variant="outline" disabled={isSubmitting || isUploading}>
                        Cancel
                    </Button>
                </SheetClose>
                <Button type="button" onClick={submit} disabled={isSubmitting || isUploading || !value.trim() || !date}>
                    {isSubmitting || isUploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save
                </Button>
            </div>
        </SheetFooter>
      </SlideOverContent>
    </SlideOver>
  );
}

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-start gap-4">
    {Icon && (
      <div className="bg-muted/50 rounded-full p-2 border border-primary/10">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    )}
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-foreground break-words">{value || '-'}</p>
    </div>
  </div>
);

export default function PatientDetailsPage({
  initialPatient,
  clinicalParameters,
  clinicians,
  initialMedications,
  currentUser,
}: {
  initialPatient: Patient;
  clinicalParameters: ClinicalParameter[];
  clinicians: User[];
  initialMedications: Medication[];
  currentUser: User | null;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

		  const [pendingGoalDeleteId, setPendingGoalDeleteId] = useState<number | null>(null);
		  const [pendingAssessmentDeleteId, setPendingAssessmentDeleteId] = useState<number | null>(null);

  // ROLE PERMISSIONS
  const isAdmin = currentUser?.role === 'admin';
  const isNavigator = currentUser?.role === 'navigator';
  const isPartner = isPartnerRole(currentUser?.role);

  const canEditPatient = isAdmin || isNavigator || isPartner;
  const canManageAssessments = canRoleManageAssessments(currentUser?.role) && !isPartner;
  const canManageReviews = canRoleManageReviews(currentUser?.role) && !isPartner;
  const canManageAppointments = canRoleManageAppointments(currentUser?.role) && !isPartner;
  const canManagePrescriptions = canRoleManagePrescriptions(currentUser?.role) && !isPartner;

  const handleOpenEditModal = () => {
    setEditFormData({
        ...patient,
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
        wellness_date: patient.wellness_date ? new Date(patient.wellness_date).toISOString().split('T')[0] : '',
        // Partners can edit patient details, but the partner assignment should remain scoped to their org.
        ...(isPartner && currentUser?.partner_id ? { partner_id: currentUser.partner_id } : {}),
    });
    setIsEditModalOpen(true);
  };

  // Allow deep-linking into the edit form from table row actions.
  // Uses hash to avoid SSR/searchParams complications.
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.location.hash === '#edit') {
      handleOpenEditModal()
      // Clear the hash so refreshes don't keep popping the modal.
      window.history.replaceState(null, '', window.location.pathname)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEditPatient) return;
    setIsSubmitting(true);
    try {
        const updated = await updatePatient(patient.id, editFormData);
        setPatient(prev => ({ ...prev, ...updated }));
        toast({ title: 'Success!', description: 'Patient details updated.' });
        setIsEditModalOpen(false);
    } catch (error: any) {
        toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
        setIsSubmitting(false);
    }
  }
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditFormData({ ...editFormData, [e.target.id]: e.target.value });
  };
  
  const handleEditSelectChange = (name: string, value: string) => {
    setEditFormData({ ...editFormData, [name]: value });
  };

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => {
    if (!canManageAssessments) return;
    if (!goalData.clinical_parameter_id || !goalData.target_value || !goalData.deadline) {
      toast({variant: 'destructive', title: 'Error', description: 'Please fill in all required fields.'});
      return;
    }
    try {
	        const goal = await createGoal({
	            patient_id: patient.id,
	            clinical_parameter_id: Number(goalData.clinical_parameter_id),
	            target_value: goalData.target_value,
	            target_operator: goalData.target_operator as any,
	            deadline: goalData.deadline,
	            notes: goalData.notes,
	            status: 'active'
	        });
	        setPatient(prev => ({...prev, goals: [goal, ...prev.goals]}));
	        toast({title: 'Success', description: 'Goal added successfully!'});
	    } catch (error: any) {
	        toast({variant: 'destructive', title: 'Error', description: error.message});
	    }
	  };

  const handleDeleteGoalItem = async (goalId: number) => {
    if (!canManageAssessments) return;
    try {
        await deleteGoal(goalId);
        setPatient(prev => ({ ...prev, goals: prev.goals.filter(g => g.id !== goalId) }));
        toast({title: 'Success', description: 'Goal deactivated.'});
    } catch (error: any) {
        toast({variant: 'destructive', title: 'Error', description: error.message});
    }
  }
  
		  const handlePrescriptionsUpdate = (updatedPrescriptions: Prescription[]) => {
		      setPatient(prev => ({ ...prev, prescriptions: updatedPrescriptions }));
		  }

		  const calculateAssessmentWeek = (assessment: Assessment) => {
		    if (!patient?.date_of_onboarding) return 'N/A';
		    const assessmentDate = new Date(assessment.measured_at);
		    const treatmentStartDate = new Date(patient.date_of_onboarding);
		    const timeDiff = assessmentDate.getTime() - treatmentStartDate.getTime();
		    const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7)) + 1;
		    if (weeksDiff < 1) return 'Week 1';
		    return `Week ${weeksDiff}`;
		  };

		  const assessmentMeetsTarget = (assessment: Assessment, goal: Goal) => {
		    const current = parseFloat(assessment.value);
		    const target = parseFloat(goal.target_value);

	    if (!Number.isNaN(current) && !Number.isNaN(target)) {
	      switch (goal.target_operator) {
	        case '<': return current < target;
	        case '<=': return current <= target;
	        case '=': return current === target;
	        case '>=': return current >= target;
	        case '>': return current > target;
	        default: return false;
	      }
	    }

	    return assessment.value === goal.target_value;
	  };

	  const handleDeleteAssessmentItem = async (assessmentId: number) => {
	      if (!canManageAssessments) return;
	      try {
          await deleteAssessment(assessmentId);
          setPatient(prev => ({
              ...prev,
              assessments: prev.assessments.filter(a => a.id !== assessmentId)
          }));
          toast({title: 'Success', description: 'Assessment deactivated.'});
      } catch (error: any) {
          toast({variant: 'destructive', title: 'Error', description: error.message});
      }
  }

	  const handleSaveAssessment = async (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'> & { id?: number }) => {
	    try {
	        if (assessment.id) {
	            const saved = await updateAssessmentApi(assessment.id, {
	                patient_id: patient.id,
	                ...assessment,
	            });
	            setPatient(prev => ({
	                ...prev,
	                assessments: prev.assessments.map(a => a.id === assessment.id ? ({ ...a, ...saved }) : a)
	            }));
	            toast({title: 'Success', description: 'Assessment updated.'});
	        } else {
	            const saved = await createAssessment({
	                patient_id: patient.id,
	                ...assessment
	            });
	            setPatient(prev => ({...prev, assessments: [saved, ...prev.assessments]}));
	            toast({title: 'Success', description: 'Assessment saved.'});
	        }
	    } catch (error: any) {
	        toast({variant: 'destructive', title: 'Error', description: error.message});
	    }
	  };
  
  const handleAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
     setPatient(prev => ({ ...prev, appointments: updatedAppointments }));
  }

	  const [reviewData, setReviewData] = useState({
	    clinical_review: '',
	    review_date: new Date().toISOString().split('T')[0]
	  });
	  const [isReviewSlideOverOpen, setIsReviewSlideOverOpen] = useState(false);

		  const submitReview = async (): Promise<boolean> => {
		    if (!canManageReviews) return false;
		    if (!reviewData.clinical_review.trim()) {
		        toast({variant: 'destructive', title: 'Error', description: 'Please enter the clinical review.'});
		        return false;
		    }

	    try {
	        const saved = await createReview({
            patient_id: patient.id,
            reviewed_by_id: currentUser!.id,
            review_date: reviewData.review_date,
            subjective_findings: reviewData.clinical_review,
            objective_findings: '',
            assessment: reviewData.clinical_review,
            plan: 'Clinical review recorded.',
            recommendations: '',
            follow_up_date: null,
        });
        const fullReview = { ...saved, reviewed_by: currentUser!.name };
        setPatient(prev => ({...prev, reviews: [fullReview, ...prev.reviews]}));
	        setReviewData({
	          clinical_review: '',
	          review_date: new Date().toISOString().split('T')[0]
	        });
          setIsReviewSlideOverOpen(false);
	        toast({title: 'Success', description: 'Review submitted.'});
	        return true;
	    } catch (error: any) {
	        toast({variant: 'destructive', title: 'Error', description: error.message});
	        return false;
	    }
	  };
  
  const getStatusBadge = (goal: Goal) => {
    const state = getGoalProgressState(goal);
    if (state.label === 'Goal Achieved') {
      return <Badge variant="default" className='bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30'><CheckCircle className="mr-1 h-3 w-3"/>Goal Achieved</Badge>;
    }
    if (state.label === 'Overdue') {
      return <Badge variant="destructive"><Clock className="mr-1 h-3 w-3"/>Overdue</Badge>;
    }
    if (state.label === 'Cancelled') {
      return <Badge variant="secondary"><ShieldAlert className="mr-1 h-3 w-3"/>Cancelled</Badge>;
    }
    return <Badge variant="secondary"><Activity className="mr-1 h-3 w-3"/>In Progress</Badge>;
  };

	  const getDisplayText = (goal: Goal) => {
	    const operatorSymbols: Record<string, string> = { '<': '<', '<=': '≤', '=': '=', '>=': '≥', '>': '>' };
	    const parameter = clinicalParameters.find(p => p.id === goal.clinical_parameter_id);
	    if (!parameter) return goal.target_value;
		    return `${operatorSymbols[goal.target_operator] || ''} ${goal.target_value} ${parameter.unit || ''}`.trim();
		  };

	  const sortedReviews = useMemo(
	    () => [...patient.reviews].sort((a, b) => new Date(b.review_date).getTime() - new Date(a.review_date).getTime()),
	    [patient.reviews]
	  );
	  const recentReviews = sortedReviews.slice(0, 3);

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
          <div className="space-y-6">
            <PatientInfoCard patient={patient} />
            <Card className="overflow-hidden border-border/60">
              <CardHeader className="bg-muted/30">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Stethoscope className="h-5 w-5 text-primary" />
                  Patient Snapshot
                </CardTitle>
                <CardDescription>Important context at a glance.</CardDescription>
              </CardHeader>
	              <CardContent className="space-y-4 pt-6">
	                <DetailItem label="Assigned Partner" value={patient.partner_name || 'N/A'} icon={Building2} />
	                {patient.corporate_name ? (
	                  <DetailItem label="Corporate Program" value={patient.corporate_name} icon={Building2} />
	                ) : null}
	              </CardContent>
	            </Card>
            {canManageAppointments && (
              <AppointmentsCard 
                patient={patient}
                clinicians={clinicians}
                onUpdate={handleAppointmentsUpdate}
              />
            )}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 pt-6">
                <Button variant="outline" onClick={() => router.push(`/dashboard/patient/${patient.id}/progress`)}>
                  View Progress Dashboard
                </Button>
                {canEditPatient && (
                  <Button variant="outline" onClick={handleOpenEditModal}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Patient Details
                  </Button>
                )}
                <Button onClick={() => setIsReportModalOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
	            <Card className="overflow-hidden border-border/60 shadow-sm">
	              <CardHeader className="bg-muted/30">
	                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
		                  <div>
		                    <CardTitle className="text-xl">Current Goals</CardTitle>
		                    <CardDescription>Clean, simple tracking for the patient&apos;s active care goals.</CardDescription>
		                  </div>
		                  {canManageAssessments && (
		                    <AddGoalSheet
		                      trigger={
		                        <Button size="sm">
		                          <PlusCircle className="mr-2 h-4 w-4" />
		                          Add Goal
		                        </Button>
		                      }
		                      onSave={handleAddGoal}
		                      clinicalParameters={clinicalParameters}
		                      existingGoal={null}
		                    />
		                  )}
		                </div>
			              </CardHeader>
		              <CardContent className="pt-6">
		                {patient.goals.filter((g) => g.status === 'active').length > 0 ? (
		                  <div className="space-y-3">
		                    {patient.goals.filter((g) => g.status === 'active').map((goal, index) => {
		                    const parameter = clinicalParameters.find(p => p.id === goal.clinical_parameter_id);
		                    const history = patient.assessments
		                      .filter(a => a.clinical_parameter_id === goal.clinical_parameter_id)
		                      .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime());
		                    const displayedHistory = history.slice(0, 3);

			                      return (
			                        <div
			                          key={goal.id}
			                          className="overflow-hidden rounded-2xl border border-border/70 bg-card px-3 shadow-[0_18px_40px_-34px_rgba(15,23,42,0.16)]"
			                        >
			                          <div className="flex items-start justify-between gap-2 py-3">
			                            <div className="min-w-0 flex-1">
			                              <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
			                                <h4 className="min-w-0 text-base font-semibold text-foreground">
			                                  {index + 1}. {parameter?.name}
			                                </h4>

			                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
			                                  <p className="whitespace-nowrap">
			                                    Target:{' '}
			                                    <span className="font-medium text-foreground">{getDisplayText(goal)}</span>
			                                  </p>
			                                  <p className="whitespace-nowrap">
			                                    Deadline:{' '}
			                                    <span className="font-medium text-foreground">
			                                      {new Date(goal.deadline).toLocaleDateString()}
			                                    </span>
			                                  </p>
			                                </div>
			                              </div>
			                            </div>

			                            <div className="flex shrink-0 flex-wrap items-center justify-end gap-1.5">
			                              {getStatusBadge(goal)}
			                              {canManageAssessments && (
			                                <>
			                                  <GoalCheckInSheet
			                                    patientId={patient.id}
			                                    parameter={parameter}
			                                    goal={goal}
			                                    disabled={!canManageAssessments}
			                                    onCreated={(saved) => {
			                                      setPatient((prev) => ({ ...prev, assessments: [saved, ...prev.assessments] }));
			                                    }}
			                                  />
			                                  <Button
			                                    type="button"
			                                    variant="ghost"
			                                    size="icon"
			                                    onClick={() => setPendingGoalDeleteId(goal.id)}
			                                    className="h-8 w-8 text-red-500 hover:bg-red-50"
			                                  >
			                                    <Trash2 className="h-4 w-4" />
			                                  </Button>
			                                </>
			                              )}
			                            </div>
			                          </div>

			                          <div className="space-y-3 pb-3 pl-3 sm:pl-4">
			                            {history.length > 0 ? (
			                              <div className="space-y-2 rounded-xl border border-border/70 bg-muted/20 p-2.5">
			                                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
			                                  Recent Records
			                                </p>
		                                <div className="overflow-hidden rounded-xl border border-border/70 bg-background">
		                                  <table className="min-w-full text-sm">
		                                    <thead className="bg-muted/40">
		                                      <tr>
		                                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Week</th>
		                                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Value</th>
		                                        <th className="px-3 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Status</th>
		                                      </tr>
		                                    </thead>
		                                    <tbody>
		                                      {displayedHistory.map((assessment) => {
		                                        const meetsTarget = assessmentMeetsTarget(assessment, goal);

		                                        return (
		                                          <tr key={assessment.id} className="border-t border-border/70">
		                                            <td className="px-3 py-1.5 text-xs font-medium text-foreground">
		                                              {calculateAssessmentWeek(assessment)}
		                                            </td>
		                                            <td className="px-3 py-1.5 text-xs text-muted-foreground">
		                                              <span className="font-medium text-foreground">
		                                                {assessment.value} {parameter?.unit || ''}
		                                              </span>
		                                            </td>
		                                            <td className="px-3 py-1.5">
		                                              <div className="flex items-center justify-between gap-2">
		                                                <Badge
		                                                  variant="outline"
		                                                  className={
		                                                    meetsTarget
		                                                      ? 'bg-green-500/20 text-green-700 border-green-500/30'
		                                                      : 'bg-red-500/15 text-red-700 border-red-500/30'
		                                                  }
		                                                >
		                                                  {meetsTarget ? 'Meets Target' : 'Off Target'}
		                                                </Badge>
			                                                {canManageAssessments ? (
			                                                  <div className="flex items-center gap-1">
			                                                    <AddAssessmentSheet
			                                                      trigger={
			                                                        <Button
			                                                          type="button"
			                                                          variant="ghost"
			                                                          size="icon"
			                                                          className="h-7 w-7 text-primary hover:bg-primary/10"
			                                                        >
			                                                          <Pencil className="h-3.5 w-3.5" />
			                                                        </Button>
			                                                      }
			                                                      onSave={handleSaveAssessment}
			                                                      parameter={parameter ?? null}
			                                                      existingAssessment={assessment}
			                                                      allParameters={clinicalParameters}
			                                                    />
			                                                    <Button
			                                                      type="button"
			                                                      variant="ghost"
			                                                      size="icon"
			                                                      className="h-7 w-7 text-red-500 hover:bg-red-50"
			                                                      onClick={() => setPendingAssessmentDeleteId(assessment.id)}
		                                                    >
		                                                      <Trash2 className="h-3.5 w-3.5" />
		                                                    </Button>
		                                                  </div>
		                                                ) : null}
		                                              </div>
		                                            </td>
		                                          </tr>
		                                        );
		                                      })}
		                                    </tbody>
		                                  </table>
		                                </div>
		                              </div>
			                            ) : (
			                              <div className="rounded-xl border-2 border-dashed border-border bg-muted/20 p-3 text-sm text-muted-foreground">
			                                No assessments have been recorded for this goal yet.
			                              </div>
			                            )}
			                          </div>
			                        </div>
			                      );
			                    })}
		                  </div>
		                ) : (
		                  <p className="rounded-xl border-2 border-dashed border-border bg-muted/20 py-8 text-center italic text-muted-foreground">No health goals defined for this patient.</p>
		                )}
		              </CardContent>
		            </Card>

	            <PrescriptionManagement
	                patient={patient}
	                prescriptions={patient.prescriptions}
	                medications={initialMedications}
	                onPrescriptionsUpdate={handlePrescriptionsUpdate}
	                readOnly={!canManagePrescriptions}
	            />

		            {canManageReviews && (
		                <Card className="border-border/60 shadow-sm overflow-hidden">
	                    <CardHeader className="bg-muted/30">
	                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
	                          <div>
	                            <CardTitle className="text-xl">Clinical Review</CardTitle>
	                            <CardDescription>Conduct comprehensive clinical evaluation</CardDescription>
	                          </div>
	                          <SlideOver
                              open={isReviewSlideOverOpen}
                              onOpenChange={(open) => {
                                setIsReviewSlideOverOpen(open);
                                if (!open) {
                                  setReviewData({
                                    clinical_review: '',
                                    review_date: new Date().toISOString().split('T')[0],
                                  });
                                }
                              }}
                            >
                              <SlideOverTrigger asChild>
	                              <Button type="button" size="sm" className="bg-primary hover:bg-primary/90 px-5">
	                                <PlusCircle className="mr-2 h-4 w-4" />
	                                Add Review
	                              </Button>
                              </SlideOverTrigger>
                              <SlideOverContent
                                className="h-full w-[calc(100vw-1rem)] max-w-[calc(100vw-1rem)] flex flex-col p-0 sm:w-[520px] sm:max-w-xl"
                              >
                                <SheetHeader className="px-4 py-3">
                                  <SheetTitle>Add Clinical Review</SheetTitle>
                                </SheetHeader>
                                <div className="flex-1 p-4 overflow-y-auto space-y-3">
                                  <InlineField label="Review Date" htmlFor="review_date">
                                    <Input
                                      id="review_date"
                                      type="date"
                                      className="h-8"
                                      value={reviewData.review_date}
                                      onChange={(e) => setReviewData((p) => ({ ...p, review_date: e.target.value }))}
                                      required
                                    />
                                  </InlineField>
                                  <InlineField label="Clinical Review" htmlFor="clinical_review" alignStart>
                                    <Textarea
                                      id="clinical_review"
                                      className="min-h-28"
                                      value={reviewData.clinical_review}
                                      onChange={(e) => setReviewData((p) => ({ ...p, clinical_review: e.target.value }))}
                                      required
                                    />
                                  </InlineField>
                                </div>
                                <SheetFooter className="px-4 py-3 bg-muted/20 border-t">
                                  <Button type="button" variant="outline" className="h-8" onClick={() => setIsReviewSlideOverOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button
                                    type="button"
                                    className="h-8 bg-primary text-primary-foreground hover:bg-primary/90"
                                    onClick={async () => {
                                      await submitReview();
                                    }}
                                  >
                                    <Save className="mr-2 h-4 w-4" /> Save
                                  </Button>
                                </SheetFooter>
                              </SlideOverContent>
                            </SlideOver>
	                        </div>
	                    </CardHeader>
	                    <CardContent className="pt-5">
	                        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
	                          {sortedReviews.length > 0 ? (
	                            <Accordion type="single" collapsible className="rounded-xl border border-border/70 bg-background px-3">
	                              <AccordionItem value="all-reviews" className="border-b-0">
	                                <AccordionTrigger className="py-3 text-sm font-medium text-foreground hover:no-underline">
	                                  View all reviews
	                                </AccordionTrigger>
	                                <AccordionContent className="space-y-3 pb-3">
	                                  {recentReviews.map((review) => (
	                                    <div key={review.id} className="rounded-xl border border-border/70 bg-muted/20 px-3 py-3">
	                                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
	                                        <p className="text-sm font-medium text-foreground">{new Date(review.review_date).toLocaleDateString()}</p>
	                                        <p className="text-xs text-muted-foreground">{review.reviewed_by}</p>
	                                      </div>
	                                      <p className="mt-2 text-sm text-muted-foreground">{review.assessment || review.plan || 'Clinical review recorded.'}</p>
	                                    </div>
	                                  ))}
	                                </AccordionContent>
	                              </AccordionItem>
	                            </Accordion>
	                          ) : (
	                            <p className="rounded-xl bg-background px-3 py-3 text-sm text-muted-foreground">No clinical reviews yet.</p>
	                          )}
	                        </div>
	                    </CardContent>
	                </Card>
	            )}

            {/* Partner view restrictions are enforced by RBAC + API scoping; avoid noisy banners in the UI. */}

          </div>
        </div>
      </div>
       {isReportModalOpen && (
        <ReportViewer
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          patient={patient}
          corporate={patient.corporate_id ? { id: patient.corporate_id, name: patient.corporate_name!, wellness_date: patient.wellness_date! } : null}
        />
      )}
	      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
	        <DialogContent className="sm:max-w-2xl border-primary/20">
	            <DialogHeader>
	                <DialogTitle className="text-2xl font-bold">Edit Patient Details</DialogTitle>
	                <CardDescription className="text-muted-foreground">Update the patient's registration information below.</CardDescription>
	            </DialogHeader>
	            <form onSubmit={handleUpdatePatient}>
	                <div className="space-y-3 py-4">
                    <InlineField label="First Name" htmlFor="first_name">
                        <Input id="first_name" className="border-primary/20" value={editFormData.first_name || ''} onChange={handleEditFormChange} required />
                    </InlineField>
                    <InlineField label="Middle Name" htmlFor="middle_name">
                        <Input id="middle_name" className="border-primary/20" value={editFormData.middle_name || ''} onChange={handleEditFormChange} />
                    </InlineField>
                    <InlineField label="Surname" htmlFor="surname">
                        <Input id="surname" className="border-primary/20" value={editFormData.surname || ''} onChange={handleEditFormChange} required />
                    </InlineField>
                    <InlineField label="Date of Birth" htmlFor="dob">
                        <Input id="dob" type="date" className="border-primary/20" value={editFormData.dob || ''} onChange={handleEditFormChange} />
                    </InlineField>
                    <InlineField label="Age" htmlFor="age">
                        <Input id="age" type="number" className="border-primary/20" value={editFormData.age || ''} onChange={handleEditFormChange} />
                    </InlineField>
                    <InlineField label="Gender" htmlFor="gender">
                        <Select value={editFormData.gender || ''} onValueChange={(value) => handleEditSelectChange('gender', value)} required>
                            <SelectTrigger className="border-primary/20"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </InlineField>
                    <InlineField label="Email" htmlFor="email">
                        <Input id="email" type="email" className="border-primary/20" value={editFormData.email || ''} onChange={handleEditFormChange} />
                    </InlineField>
	                    <InlineField label="Phone" htmlFor="phone">
	                        <Input id="phone" type="tel" className="border-primary/20" value={editFormData.phone || ''} onChange={handleEditFormChange} />
	                    </InlineField>
	                    <InlineField label="Address" htmlFor="address" alignStart>
	                        <Textarea
	                            id="address"
	                            className="border-primary/20 min-h-20"
	                            value={editFormData.address || ''}
	                            onChange={handleEditFormChange}
	                        />
	                    </InlineField>
	                    <InlineField label="Primary Diagnosis" htmlFor="primary_diagnosis">
	                        <Select
	                            value={editFormData.primary_diagnosis || ''}
	                            onValueChange={(value) => handleEditSelectChange('primary_diagnosis', value)}
	                        >
	                            <SelectTrigger className="border-primary/20"><SelectValue placeholder="Select diagnosis" /></SelectTrigger>
	                            <SelectContent>
	                                <SelectItem value="Hypertension">Hypertension</SelectItem>
	                                <SelectItem value="Diabetes">Diabetes</SelectItem>
	                                <SelectItem value="Hypertension and Diabetes">Hypertension and Diabetes</SelectItem>
	                            </SelectContent>
	                        </Select>
	                    </InlineField>
	                    <InlineField label="Comorbid Conditions" htmlFor="comorbid_conditions" alignStart>
	                        <Textarea
	                            id="comorbid_conditions"
	                            className="border-primary/20 min-h-20"
	                            value={editFormData.comorbid_conditions || ''}
	                            onChange={handleEditFormChange}
	                        />
	                    </InlineField>
	                    <InlineField label="Medication Summary" htmlFor="current_medications_summary" alignStart>
	                        <Textarea
	                            id="current_medications_summary"
	                            className="border-primary/20 min-h-20"
	                            value={editFormData.current_medications_summary || ''}
	                            onChange={handleEditFormChange}
	                        />
	                    </InlineField>
		                    <InlineField label="Wellness Date" htmlFor="wellness_date">
		                        <Input id="wellness_date" type="date" className="border-primary/20" value={editFormData.wellness_date || ''} onChange={handleEditFormChange} required />
		                    </InlineField>
	                    <InlineField label="Status" htmlFor="status">
	                        <Select value={editFormData.status || ''} onValueChange={(value) => handleEditSelectChange('status', value)} required>
	                            <SelectTrigger className="border-primary/20"><SelectValue /></SelectTrigger>
	                            <SelectContent>
	                                <SelectItem value="Active">Active</SelectItem>
	                                <SelectItem value="In Review">In Review</SelectItem>
	                                <SelectItem value="Critical">Critical</SelectItem>
	                                <SelectItem value="Discharged">Discharged</SelectItem>
	                            </SelectContent>
	                        </Select>
	                    </InlineField>

	                    <div className="pt-2">
	                        <div className="rounded-xl border border-border/70 bg-muted/20 p-3">
	                            <p className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Emergency Contact</p>
	                            <div className="mt-3 space-y-3">
	                                <InlineField label="Name" htmlFor="emergency_contact_name">
	                                    <Input
	                                        id="emergency_contact_name"
	                                        className="border-primary/20"
	                                        value={editFormData.emergency_contact_name || ''}
	                                        onChange={handleEditFormChange}
	                                    />
	                                </InlineField>
	                                <InlineField label="Phone" htmlFor="emergency_contact_phone">
	                                    <Input
	                                        id="emergency_contact_phone"
	                                        type="tel"
	                                        className="border-primary/20"
	                                        value={editFormData.emergency_contact_phone || ''}
	                                        onChange={handleEditFormChange}
	                                    />
	                                </InlineField>
	                                <InlineField label="Relation" htmlFor="emergency_contact_relation">
	                                    <Input
	                                        id="emergency_contact_relation"
	                                        className="border-primary/20"
	                                        value={editFormData.emergency_contact_relation || ''}
	                                        onChange={handleEditFormChange}
	                                    />
	                                </InlineField>
	                                <InlineField label="Email" htmlFor="emergency_contact_email">
	                                    <Input
	                                        id="emergency_contact_email"
	                                        type="email"
	                                        className="border-primary/20"
	                                        value={editFormData.emergency_contact_email || ''}
	                                        onChange={handleEditFormChange}
	                                    />
	                                </InlineField>
	                            </div>
	                        </div>
	                    </div>
	                </div>
	                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline" className="border-primary/20">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting} className="bg-primary hover:bg-primary/90">
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                    </Button>
                </DialogFooter>
            </form>
        </DialogContent>
      </Dialog>
      <ConfirmActionDialog
        open={pendingGoalDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingGoalDeleteId(null);
        }}
        title="Deactivate goal?"
        description="This will soft-delete the goal and remove it from the active goals list for this patient."
        confirmLabel="Deactivate"
        onConfirm={async () => {
          if (pendingGoalDeleteId !== null) {
            await handleDeleteGoalItem(pendingGoalDeleteId);
          }
        }}
      />
      <ConfirmActionDialog
        open={pendingAssessmentDeleteId !== null}
        onOpenChange={(open) => {
          if (!open) setPendingAssessmentDeleteId(null);
        }}
        title="Deactivate assessment?"
        description="This will soft-delete the assessment and remove it from the patient's active assessment history."
        confirmLabel="Deactivate"
        onConfirm={async () => {
          if (pendingAssessmentDeleteId !== null) {
            await handleDeleteAssessmentItem(pendingAssessmentDeleteId);
          }
        }}
      />
    </div>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
  alignStart,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
  alignStart?: boolean;
}) {
  return (
    <div className={cn("grid grid-cols-[132px_minmax(0,1fr)] gap-3", alignStart ? "items-start" : "items-center")}>
      <Label
        htmlFor={htmlFor}
        className={cn(
          "text-[11px] font-bold uppercase tracking-widest text-muted-foreground dark:text-white",
          alignStart ? "pt-2" : null
        )}
      >
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
