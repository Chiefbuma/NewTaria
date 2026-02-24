'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { 
    Patient, 
    Corporate, 
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  PlusCircle,
  Save,
  FileText,
  Loader2,
  Trash2,
  Edit,
  History,
  CheckCircle,
  Clock,
  TrendingUp,
  Building2,
  ShieldAlert
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
import ReportViewer from '@/components/report-viewer';
import AddAssessmentModal from '@/components/patient/add-assessment-modal';
import PrescriptionManagement from '@/components/patient/prescription-management';
import ReviewHistoryCard from '@/components/patient/review-history-card';
import AppointmentsCard from '@/components/patient/appointments-card';
import PatientInfoCard from '@/components/patient/patient-info-card';
import AddAppointmentModal from '@/components/patient/add-appointment-modal';
import { 
    createAssessment, 
    deleteAssessment, 
    createGoal, 
    deleteGoal, 
    createReview, 
    upsertAppointment,
    updatePatient,
} from '@/lib/api-service';

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

export default function PatientDetailsPage({ initialPatient, clinicalParameters, clinicians, initialMedications }: { initialPatient: Patient, clinicalParameters: ClinicalParameter[], clinicians: User[], initialMedications: Medication[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isAddAssessmentModalOpen, setAddAssessmentModalOpen] = useState(false);
  const [selectedGoalParameter, setSelectedGoalParameter] = useState<ClinicalParameter | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
  }, []);

  // ROLE PERMISSIONS
  const isAdmin = currentUser?.role === 'admin';
  const isNavigator = currentUser?.role === 'navigator';
  const isClinician = currentUser?.role === 'clinician';
  const isPayer = currentUser?.role === 'payer';

  const canEditPatient = isAdmin || isNavigator;
  const canManageAssessments = isAdmin || isNavigator; // Clinicians view only assessments
  const canManageReviews = isAdmin || isNavigator || isClinician;
  const canManageAppointments = isAdmin || isNavigator;

  const handleOpenEditModal = () => {
    setEditFormData({
        ...patient,
        dob: patient.dob ? new Date(patient.dob).toISOString().split('T')[0] : '',
        wellness_date: patient.wellness_date ? new Date(patient.wellness_date).toISOString().split('T')[0] : '',
    });
    setIsEditModalOpen(true);
  };

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

  const [newGoal, setNewGoal] = useState({
    clinical_parameter_id: '',
    target_value: '',
    target_operator: '<=',
    deadline: '',
    notes: ''
  });

  const handleAddGoal = async () => {
    if (!canManageAssessments) return;
    if (!newGoal.clinical_parameter_id || !newGoal.target_value || !newGoal.deadline) {
      toast({variant: 'destructive', title: 'Error', description: 'Please fill in all required fields.'});
      return;
    }
    try {
        const goal = await createGoal({
            patient_id: patient.id,
            clinical_parameter_id: parseInt(newGoal.clinical_parameter_id),
            target_value: newGoal.target_value,
            target_operator: newGoal.target_operator as any,
            deadline: newGoal.deadline,
            notes: newGoal.notes,
            status: 'active'
        });
        setPatient(prev => ({...prev, goals: [goal, ...prev.goals]}));
        setNewGoal({ clinical_parameter_id: '', target_value: '', target_operator: '<=', deadline: '', notes: '' });
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
        toast({title: 'Success', description: 'Goal deleted.'});
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

  const handleDeleteAssessmentItem = async (assessmentId: number) => {
      if (!canManageAssessments) return;
      try {
          await deleteAssessment(assessmentId);
          setPatient(prev => ({
              ...prev,
              assessments: prev.assessments.filter(a => a.id !== assessmentId)
          }));
          toast({title: 'Success', description: 'Assessment deleted.'});
      } catch (error: any) {
          toast({variant: 'destructive', title: 'Error', description: error.message});
      }
  }

  const handleSaveAssessment = async (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'>) => {
    try {
        const saved = await createAssessment({
            patient_id: patient.id,
            ...assessment
        });
        setPatient(prev => ({...prev, assessments: [saved, ...prev.assessments]}));
        toast({title: 'Success', description: 'Assessment saved.'});
        setAddAssessmentModalOpen(false);
    } catch (error: any) {
        toast({variant: 'destructive', title: 'Error', description: error.message});
    }
  };
  
  const handleAppointmentsUpdate = (updatedAppointments: Appointment[]) => {
     setPatient(prev => ({ ...prev, appointments: updatedAppointments }));
  }

  const handleOpenAppointmentModal = (appointment?: Appointment) => {
    setEditingAppointment(appointment || null);
    setIsAppointmentModalOpen(true);
  };

  const [reviewData, setReviewData] = useState({
    subjective_findings: '',
    objective_findings: '',
    assessment: '',
    plan: '',
    recommendations: '',
    follow_up_date: '',
    review_date: new Date().toISOString().split('T')[0]
  });

  const submitReview = async () => {
    if (!canManageReviews) return;
    if (!reviewData.subjective_findings.trim() || !reviewData.objective_findings.trim()) {
        toast({variant: 'destructive', title: 'Error', description: 'Please fill in required findings'});
        return;
    }

    try {
        const saved = await createReview({
            patient_id: patient.id,
            reviewed_by_id: currentUser!.id,
            ...reviewData
        });
        const fullReview = { ...saved, reviewed_by: currentUser!.name };
        setPatient(prev => ({...prev, reviews: [fullReview, ...prev.reviews]}));
        setReviewData({
          subjective_findings: '',
          objective_findings: '',
          assessment: '',
          plan: '',
          recommendations: '',
          follow_up_date: '',
          review_date: new Date().toISOString().split('T')[0]
        });
        toast({title: 'Success', description: 'Review submitted.'});
    } catch (error: any) {
        toast({variant: 'destructive', title: 'Error', description: error.message});
    }
  };
  
  const getStatusBadge = (goal: Goal) => {
    const isOverdue = new Date(goal.deadline) < new Date() && goal.status !== 'completed';
    if (goal.status === 'completed') {
      return <Badge variant="default" className='bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30'><CheckCircle className="mr-1 h-3 w-3"/>Goal Achieved</Badge>;
    }
    if (isOverdue) {
      return <Badge variant="destructive"><Clock className="mr-1 h-3 w-3"/>Overdue</Badge>;
    }
    return <Badge variant="secondary"><Activity className="mr-1 h-3 w-3"/>In Progress</Badge>;
  };

  const getDisplayText = (goal: Goal) => {
    const operatorSymbols: Record<string, string> = { '<': '<', '<=': '≤', '=': '=', '>=': '≥', '>': '>' };
    const parameter = clinicalParameters.find(p => p.id === goal.clinical_parameter_id);
    if (!parameter) return goal.target_value;
    return `${operatorSymbols[goal.target_operator] || ''} ${goal.target_value} ${parameter.unit || ''}`.trim();
  };

  return (
    <div className="container mx-auto max-w-7xl py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button asChild variant="outline" size="icon" className="border-primary/20">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight text-foreground">{`${
                patient.first_name
              } ${patient.surname || ''}`}</h1>
              <p className="text-muted-foreground">
                Patient Assessment and Details
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <PatientInfoCard patient={patient} />
            {patient.corporate_name && (
              <Card className="border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-lg">
                    <Building2 className="w-5 h-5 text-primary" />
                    <span>Corporate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem label="Company Name" value={patient.corporate_name} />
                </CardContent>
              </Card>
            )}
            <ReviewHistoryCard patient={patient} />
            {canManageAppointments && (
                <AppointmentsCard 
                    patient={patient}
                    onSchedule={() => handleOpenAppointmentModal()}
                    onEdit={handleOpenAppointmentModal}
                    onUpdate={handleAppointmentsUpdate}
                />
            )}
            <Card className="border-primary/10 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button asChild variant="outline" className="border-primary/20 hover:bg-primary/5">
                    <Link href={`/dashboard/patient/${patient.id}/progress`}>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        View Progress Dashboard
                    </Link>
                </Button>
                {canEditPatient && (
                    <Button variant="outline" onClick={handleOpenEditModal} className="border-primary/20 hover:bg-primary/5">
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Patient Details
                    </Button>
                )}
                <Button onClick={() => setIsReportModalOpen(true)} className="bg-primary hover:bg-primary/90">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </Button>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <PrescriptionManagement
                patient={patient}
                prescriptions={patient.prescriptions}
                medications={initialMedications}
                onPrescriptionsUpdate={handlePrescriptionsUpdate}
                readOnly={isPayer || isClinician}
            />
            <Card className="border-primary/10 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30">
                <CardTitle className="text-xl">Goals</CardTitle>
                <CardDescription>Set and track patient health goals</CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                  {canManageAssessments && (
                    <div className="bg-primary/5 rounded-xl p-4 border border-primary/10 mb-6">
                        <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2"><PlusCircle className="h-5 w-5"/>Add New Goal</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                    <Label className="mb-2 block font-semibold">Parameter</Label>
                                    <Select value={newGoal.clinical_parameter_id} onValueChange={(value) => setNewGoal(prev => ({...prev, clinical_parameter_id: value}))}>
                                        <SelectTrigger className="bg-background border-primary/20"><SelectValue placeholder="Select Parameter" /></SelectTrigger>
                                        <SelectContent>
                                            {clinicalParameters.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.unit})</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                            </div>
                            <div>
                                    <Label className="mb-2 block font-semibold">Target Value</Label>
                                    <Input type="text" placeholder="Value" className="bg-background border-primary/20" value={newGoal.target_value} onChange={(e) => setNewGoal(prev => ({...prev, target_value: e.target.value}))}/>
                            </div>
                                <div>
                                    <Label className="mb-2 block font-semibold">Operator</Label>
                                    <Select value={newGoal.target_operator} onValueChange={(value) => setNewGoal(prev => ({...prev, target_operator: value as any}))}>
                                        <SelectTrigger className="bg-background border-primary/20"><SelectValue/></SelectTrigger>
                                        <SelectContent>
                                        <SelectItem value="<">Below</SelectItem>
                                        <SelectItem value="<=">At or below</SelectItem>
                                        <SelectItem value="=">Equal to</SelectItem>
                                        <SelectItem value=">=">At or above</SelectItem>
                                        <SelectItem value=">">Above</SelectItem>
                                        </SelectContent>
                                    </Select>
                            </div>
                            <div>
                                    <Label className="mb-2 block font-semibold">Deadline</Label>
                                    <Input type="date" className="bg-background border-primary/20" value={newGoal.deadline} onChange={(e) => setNewGoal(prev => ({...prev, deadline: e.target.value}))}/>
                            </div>
                            <div className="md:col-span-2">
                                    <Label className="mb-2 block font-semibold">Notes</Label>
                                    <Textarea placeholder="Additional notes..." className="bg-background border-primary/20" value={newGoal.notes} onChange={(e) => setNewGoal(prev => ({...prev, notes: e.target.value}))}/>
                            </div>
                        </div>
                        <Button onClick={handleAddGoal} className="bg-primary hover:bg-primary/90 shadow-md">Add Goal</Button>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                      <h3 className="text-lg font-bold text-foreground">Current Goals ({patient.goals.length})</h3>
                      {patient.goals.map(goal => {
                          const parameter = clinicalParameters.find(p => p.id === goal.clinical_parameter_id);
                          const history = patient.assessments.filter(a => a.clinical_parameter_id === goal.clinical_parameter_id);

                          return (
                              <div key={goal.id} className="p-4 rounded-xl border border-primary/10 bg-background hover:shadow-md transition-all">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                      <div className="flex-1">
                                          <h4 className="font-bold text-lg text-primary">{parameter?.name}</h4>
                                          <p className="text-sm text-muted-foreground font-medium">Target: <span className="text-foreground">{getDisplayText(goal)}</span></p>
                                          <p className="text-sm text-muted-foreground font-medium">Deadline: <span className="text-foreground">{new Date(goal.deadline).toLocaleDateString()}</span></p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                          {getStatusBadge(goal)}
                                          {canManageAssessments && (
                                              <>
                                                <Button variant="ghost" size="icon" onClick={() => { setSelectedGoalParameter(parameter!); setAddAssessmentModalOpen(true); }} className="text-green-600 hover:bg-green-50">
                                                    <PlusCircle className="h-5 w-5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" onClick={() => handleDeleteGoalItem(goal.id)} className="text-red-500 hover:bg-red-50">
                                                    <Trash2 className="h-5 w-5"/>
                                                </Button>
                                              </>
                                          )}
                                      </div>
                                  </div>

                                  {history.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-bold text-muted-foreground mb-2 flex items-center gap-2"><History className="h-4 w-4"/> Assessment History</h5>
                                        <div className="overflow-x-auto rounded-lg border border-primary/10">
                                            <table className="min-w-full text-xs">
                                                <thead className="bg-muted/50">
                                                    <tr>
                                                        <th className="text-left py-2 px-3 font-bold text-foreground">Date</th>
                                                        <th className="text-left py-2 px-3 font-bold text-foreground">Week</th>
                                                        <th className="text-left py-2 px-3 font-bold text-foreground">Value</th>
                                                        <th className="text-left py-2 px-3 font-bold text-foreground">Status</th>
                                                        {canManageAssessments && <th className="text-left py-2 px-3 font-bold text-foreground">Actions</th>}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.map(assessment => (
                                                        <tr key={assessment.id} className="hover:bg-primary/5 transition-colors border-t border-primary/5">
                                                            <td className="py-2 px-3 whitespace-nowrap text-foreground">{new Date(assessment.measured_at).toLocaleDateString()}</td>
                                                            <td className="py-2 px-3"><Badge variant="outline" className="border-primary/20">{calculateAssessmentWeek(assessment)}</Badge></td>
                                                            <td className="py-2 px-3 font-bold text-foreground">{assessment.value} {parameter?.unit}</td>
                                                            <td className="py-2 px-3">
                                                                <Badge variant={assessment.is_normal ? "secondary" : "destructive"}>{assessment.is_normal ? 'Normal' : 'Abnormal'}</Badge>
                                                            </td>
                                                            {canManageAssessments && (
                                                                <td className="py-2 px-3"><Button variant="ghost" size="icon" onClick={() => handleDeleteAssessmentItem(assessment.id)} className="h-7 w-7 text-red-500 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5"/></Button></td>
                                                            )}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                  )}

                              </div>
                          )
                      })}
                      {patient.goals.length === 0 && <p className="text-center text-muted-foreground py-8 italic border-2 border-dashed rounded-xl">No health goals defined for this patient.</p>}
                  </div>
              </CardContent>
            </Card>

            {canManageReviews && (
                <Card className="border-primary/10 shadow-sm overflow-hidden">
                    <CardHeader className="bg-muted/30">
                        <CardTitle className="text-xl">Clinical Review</CardTitle>
                        <CardDescription>Conduct comprehensive clinical evaluation</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <h4 className="text-lg font-bold text-foreground mb-2">Submit New Review</h4>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-semibold">Subjective Findings</Label>
                                    <Textarea placeholder="How is the patient feeling? Any complaints?..." className="bg-background border-primary/20" value={reviewData.subjective_findings} onChange={(e) => setReviewData(p => ({...p, subjective_findings: e.target.value}))}/>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Objective Findings</Label>
                                    <Textarea placeholder="Physical exam findings, lab observations?..." className="bg-background border-primary/20" value={reviewData.objective_findings} onChange={(e) => setReviewData(p => ({...p, objective_findings: e.target.value}))}/>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Assessment & Diagnosis</Label>
                                    <Textarea placeholder="Clinical impression and primary diagnosis..." className="bg-background border-primary/20" value={reviewData.assessment} onChange={(e) => setReviewData(p => ({...p, assessment: e.target.value}))}/>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-semibold">Treatment Plan</Label>
                                    <Textarea placeholder="Next steps, changes to medication, follow-ups..." className="bg-background border-primary/20" value={reviewData.plan} onChange={(e) => setReviewData(p => ({...p, plan: e.target.value}))}/>
                                </div>
                                <Button onClick={submitReview} className="bg-primary hover:bg-primary/90 shadow-md px-8"><Save className="mr-2 h-4 w-4"/> Save Review</Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {isPayer && (
                <div className="p-6 rounded-xl border border-amber-500/20 bg-amber-500/10 flex items-center gap-4">
                    <ShieldAlert className="h-8 w-8 text-amber-600" />
                    <div className="flex-1">
                        <h4 className="font-bold text-amber-800">Restricted Access</h4>
                        <p className="text-sm text-amber-700/80">As a Payer, you have view-only access to assessments and goals for your associated patients. Clinical modifications are restricted.</p>
                    </div>
                </div>
            )}

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
                <DialogTitle className="text-2xl text-primary font-bold">Edit Patient Details</DialogTitle>
                <CardDescription>Update the patient's registration information below.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePatient}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name" className="font-bold">First Name</Label>
                        <Input id="first_name" className="border-primary/20" value={editFormData.first_name || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middle_name" className="font-bold">Middle Name</Label>
                        <Input id="middle_name" className="border-primary/20" value={editFormData.middle_name || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="surname" className="font-bold">Surname</Label>
                        <Input id="surname" className="border-primary/20" value={editFormData.surname || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob" className="font-bold">Date of Birth</Label>
                        <Input id="dob" type="date" className="border-primary/20" value={editFormData.dob || ''} onChange={handleEditFormChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age" className="font-bold">Age</Label>
                        <Input id="age" type="number" className="border-primary/20" value={editFormData.age || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="gender" className="font-bold">Gender</Label>
                        <Select value={editFormData.gender || ''} onValueChange={(value) => handleEditSelectChange('gender', value)} required>
                            <SelectTrigger id="gender" className="border-primary/20"><SelectValue placeholder="Select gender" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Male">Male</SelectItem>
                                <SelectItem value="Female">Female</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="email" className="font-bold">Email</Label>
                        <Input id="email" type="email" className="border-primary/20" value={editFormData.email || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone" className="font-bold">Phone</Label>
                        <Input id="phone" type="tel" className="border-primary/20" value={editFormData.phone || ''} onChange={handleEditFormChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="wellness_date" className="font-bold">Wellness Date</Label>
                        <Input id="wellness_date" type="date" className="border-primary/20" value={editFormData.wellness_date || ''} onChange={handleEditFormChange} required />
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
      
      {isAddAssessmentModalOpen && (
        <AddAssessmentModal
            isOpen={isAddAssessmentModalOpen}
            onClose={() => setAddAssessmentModalOpen(false)}
            onSave={handleSaveAssessment}
            parameter={selectedGoalParameter}
        />
      )}
      {isAppointmentModalOpen && (
        <AddAppointmentModal
            isOpen={isAppointmentModalOpen}
            onClose={() => setIsAppointmentModalOpen(false)}
            onSave={async (appointmentData) => {
                try {
                    const saved = await upsertAppointment({ ...appointmentData, patient_id: patient.id });
                    const clinician = clinicians.find(c => c.id === Number(appointmentData.clinician_id));
                    const fullAppt = { ...appointmentData, id: saved, patient_id: patient.id, clinician } as Appointment;
                    
                    const updatedAppointments = editingAppointment
                        ? patient.appointments.map(a => a.id === editingAppointment.id ? fullAppt : a)
                        : [fullAppt, ...patient.appointments];

                    handleAppointmentsUpdate(updatedAppointments);
                    setIsAppointmentModalOpen(false);
                    setEditingAppointment(null);
                    toast({ title: 'Success', description: 'Appointment saved.' });
                } catch (error: any) {
                    toast({ variant: 'destructive', title: 'Error', description: error.message });
                }
            }}
            patient={patient}
            clinicians={clinicians}
            existingAppointment={editingAppointment}
        />
      )}
    </div>
  );
}
