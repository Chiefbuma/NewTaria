'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, Corporate, User, Vital, Nutrition, Goal, Clinical, ClinicalParameter, Assessment, Review } from '@/lib/types';
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
  Stethoscope,
  HeartPulse,
  Scale,
  Target,
  User as UserIcon,
  Cake,
  Phone,
  Mail,
  Building2,
  Binary,
  PlusCircle,
  Save,
  XCircle,
  FileText,
  Loader2,
  CalendarDays,
  Trash2,
  Edit,
  History,
  CheckCircle,
  AlertTriangle,
  Clock,
  Circle,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReportViewer from '@/components/report-viewer';
import { corporates as mockCorporates } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import AddAssessmentModal from '@/components/patient/add-assessment-modal';

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
      <div className="bg-muted/50 rounded-full p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
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

export default function PatientDetailsPage({ initialPatient, clinicalParameters }: { initialPatient: Patient, clinicalParameters: ClinicalParameter[] }) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [loading, setLoading] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [corporates, setCorporates] = useState<Corporate[]>(mockCorporates);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  // Form states
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Assessment Modal State
  const [isAddAssessmentModalOpen, setAddAssessmentModalOpen] = useState(false);
  const [selectedGoalParameter, setSelectedGoalParameter] = useState<ClinicalParameter | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);


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
    setIsSubmitting(true);
    setTimeout(() => {
        const updatedPatient = { ...patient, ...editFormData } as Patient;
        setPatient(updatedPatient);
        toast({ title: 'Success!', description: 'Patient details updated locally.' });
        setIsEditModalOpen(false);
        setIsSubmitting(false);
    }, 500);
  }
  
  const handleDeletePatient = async () => {
    setIsDeleting(true);
    setTimeout(() => {
        toast({ title: 'Success', description: 'Patient record deleted (simulation).' });
        setIsDeleting(false);
        router.push('/dashboard');
    }, 500);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
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

  const onUpdate = () => {
    toast({title: "Data Updated", description: "In a real app, data would be re-fetched."})
  }

  const handleAddGoal = () => {
    if (!newGoal.clinical_parameter_id || !newGoal.target_value || !newGoal.deadline) {
      toast({variant: 'destructive', title: 'Error', description: 'Please fill in all required fields for the new goal.'});
      return;
    }
    const newGoalData: Goal = {
        id: Date.now(),
        patient_id: patient.id,
        created_at: new Date().toISOString(),
        status: 'active',
        clinical_parameter_id: parseInt(newGoal.clinical_parameter_id),
        target_value: newGoal.target_value,
        target_operator: newGoal.target_operator as any,
        deadline: newGoal.deadline,
        notes: newGoal.notes
    };
    setPatient(prev => ({...prev, goals: [...prev.goals, newGoalData]}));
    setNewGoal({ clinical_parameter_id: '', target_value: '', target_operator: '<=', deadline: '', notes: '' });
    toast({title: 'Success', description: 'Goal added successfully!'});
  };

  const handleDeleteGoal = (goalId: number) => {
    setPatient(prev => ({
        ...prev,
        goals: prev.goals.filter(g => g.id !== goalId)
    }));
    toast({title: 'Success', description: 'Goal deleted.'});
  }

  const calculateAssessmentWeek = (assessment: Assessment) => {
    if (!patient?.date_of_onboarding) return 'N/A';
    const assessmentDate = new Date(assessment.measured_at);
    const treatmentStartDate = new Date(patient.date_of_onboarding);
    const timeDiff = assessmentDate.getTime() - treatmentStartDate.getTime();
    const weeksDiff = Math.floor(timeDiff / (1000 * 3600 * 24 * 7)) + 1;
    if (weeksDiff < 1) return 'Week 1';
    if (weeksDiff > 64) return 'Week 64+';
    return `Week ${weeksDiff}`;
  };

  const handleDeleteAssessment = (assessmentId: number) => {
      setPatient(prev => ({
          ...prev,
          assessments: prev.assessments.filter(a => a.id !== assessmentId)
      }));
      toast({title: 'Success', description: 'Assessment deleted.'});
  }

  const handleSaveAssessment = (assessment: Omit<Assessment, 'id' | 'patient_id' | 'created_at'>) => {
    const fullAssessment = {
        id: Date.now(),
        patient_id: patient.id,
        created_at: new Date().toISOString(),
        ...assessment
    }
    setPatient(prev => ({...prev, assessments: [...prev.assessments, fullAssessment]}));
    toast({title: 'Success', description: 'Assessment saved.'});
    setAddAssessmentModalOpen(false);
  };

  const handleOpenAddAssessmentModal = (parameter: ClinicalParameter) => {
    setSelectedGoalParameter(parameter);
    setAddAssessmentModalOpen(true);
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

  const submitReview = () => {
    if (!reviewData.subjective_findings.trim() || !reviewData.objective_findings.trim()) {
        toast({variant: 'destructive', title: 'Error', description: 'Please fill in at least subjective and objective findings'});
        return;
    }

    const newReview: Review = {
        id: Date.now(),
        patient_id: patient.id,
        reviewed_by_id: currentUser!.id,
        reviewed_by: currentUser!.name,
        ...reviewData
    };
    setPatient(prev => ({...prev, reviews: [...prev.reviews, newReview]}));
    setReviewData({
      subjective_findings: '',
      objective_findings: '',
      assessment: '',
      plan: '',
      recommendations: '',
      follow_up_date: '',
      review_date: new Date().toISOString().split('T')[0]
    });
    toast({title: 'Success', description: 'Clinical review submitted successfully!'});
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
            <Button asChild variant="outline" size="icon">
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                <span className="sr-only">Back to Dashboard</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold font-headline tracking-tight">{`${
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
            <Card>
              <CardHeader className="flex flex-col items-center text-center gap-4">
                <Avatar className="w-24 h-24 border-4 border-background shadow-md">
                   {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={`${patient.first_name} ${patient.surname || ''}`} />}
                  <AvatarFallback className="text-3xl">{`${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`}</AvatarFallback>
                </Avatar>
                <div className="grid gap-1">
                  <CardTitle className="text-2xl">{`${patient.first_name} ${
                    patient.surname || ''
                  }`}</CardTitle>
                  <CardDescription>Patient ID: {patient.id}</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                 <Separator />
                <div className="grid grid-cols-1 gap-4 pt-4">
                  <DetailItem
                    icon={UserIcon}
                    label="Full Name"
                    value={`${patient.first_name} ${patient.middle_name || ''} ${
                      patient.surname || ''
                    }`}
                  />
                  <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
                   <DetailItem icon={CalendarDays} label="Wellness Date" value={patient.wellness_date ? new Date(patient.wellness_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
                  <DetailItem icon={Binary} label="Age / Sex" value={`${patient.age} / ${patient.sex}`} />
                  <DetailItem icon={Phone} label="Phone" value={patient.phone} />
                  <DetailItem icon={Mail} label="Email" value={patient.email} />
                </div>
              </CardContent>
            </Card>
            {patient.corporate_name && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Building2 className="w-6 h-6" />
                    <span>Corporate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DetailItem label="Company Name" value={patient.corporate_name} />
                </CardContent>
              </Card>
            )}
            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Button variant="outline" onClick={handleOpenEditModal}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit Patient Details
                </Button>
                <Button onClick={() => setIsReportModalOpen(true)}>
                  <FileText className="mr-2 h-4 w-4" />
                  Generate PDF Report
                </Button>
                {currentUser?.role === 'admin' && (
                     <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Patient Record
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete this patient's record and all associated assessments.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeletePatient} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
                                {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Continue
                            </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
                <CardDescription>Set and track patient health goals with assessment history</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="bg-muted/50 rounded-xl p-4 border mb-6">
                      <h3 className="text-lg font-semibold text-foreground mb-4">Add New Goal</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                           <div>
                                <Label className="mb-2">Parameter</Label>
                                <Select value={newGoal.clinical_parameter_id} onValueChange={(value) => setNewGoal(prev => ({...prev, clinical_parameter_id: value}))}>
                                    <SelectTrigger><SelectValue placeholder="Select Parameter" /></SelectTrigger>
                                    <SelectContent>
                                        {clinicalParameters.map(p => <SelectItem key={p.id} value={String(p.id)}>{p.name} ({p.unit})</SelectItem>)}
                                    </SelectContent>
                                </Select>
                           </div>
                           <div>
                                <Label className="mb-2">Target Value</Label>
                                <Input type="text" placeholder="Target value" value={newGoal.target_value} onChange={(e) => setNewGoal(prev => ({...prev, target_value: e.target.value}))}/>
                           </div>
                            <div>
                                <Label className="mb-2">Operator</Label>
                                <Select value={newGoal.target_operator} onValueChange={(value) => setNewGoal(prev => ({...prev, target_operator: value as any}))}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
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
                                <Label className="mb-2">Deadline</Label>
                                <Input type="date" value={newGoal.deadline} onChange={(e) => setNewGoal(prev => ({...prev, deadline: e.target.value}))}/>
                           </div>
                           <div className="md:col-span-2">
                                <Label className="mb-2">Notes</Label>
                                <Textarea placeholder="Additional notes..." value={newGoal.notes} onChange={(e) => setNewGoal(prev => ({...prev, notes: e.target.value}))}/>
                           </div>
                      </div>
                      <Button onClick={handleAddGoal}><PlusCircle className="mr-2 h-4 w-4" /> Add Goal</Button>
                  </div>
                  
                  <div className="space-y-6">
                      <h3 className="text-lg font-semibold text-foreground">Current Goals ({patient.goals.length})</h3>
                      {patient.goals.map(goal => {
                          const parameter = clinicalParameters.find(p => p.id === goal.clinical_parameter_id);
                          const history = patient.assessments.filter(a => a.clinical_parameter_id === goal.clinical_parameter_id);

                          return (
                              <div key={goal.id} className="p-4 rounded-xl border bg-background hover:shadow-sm transition-shadow">
                                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                                      <div className="flex-1">
                                          <h4 className="font-semibold text-foreground">{parameter?.name}</h4>
                                          <p className="text-sm text-muted-foreground">Target: {getDisplayText(goal)}</p>
                                          <p className="text-sm text-muted-foreground">Deadline: {new Date(goal.deadline).toLocaleDateString()}</p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                          {getStatusBadge(goal)}
                                          <Button variant="ghost" size="icon" onClick={() => handleOpenAddAssessmentModal(parameter!)}>
                                              <PlusCircle className="h-4 w-4 text-green-500" />
                                          </Button>
                                          <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                                              <Trash2 className="h-4 w-4 text-red-500"/>
                                          </Button>
                                      </div>
                                  </div>

                                  {history.length > 0 && (
                                    <div className="mt-4">
                                        <h5 className="text-sm font-semibold text-muted-foreground mb-2 flex items-center gap-2"><History className="h-4 w-4"/> Assessment History</h5>
                                        <div className="overflow-x-auto rounded-lg border">
                                            <table className="min-w-full text-xs">
                                                <thead>
                                                    <tr className="bg-muted/50">
                                                        <th className="text-left py-2 px-3 font-medium">Date</th>
                                                        <th className="text-left py-2 px-3 font-medium">Week</th>
                                                        <th className="text-left py-2 px-3 font-medium">Value</th>
                                                        <th className="text-left py-2 px-3 font-medium">Status</th>
                                                        <th className="text-left py-2 px-3 font-medium">Actions</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {history.map(assessment => (
                                                        <tr key={assessment.id} className="hover:bg-muted/50">
                                                            <td className="py-2 px-3 whitespace-nowrap">{new Date(assessment.measured_at).toLocaleDateString()}</td>
                                                            <td className="py-2 px-3"><Badge variant="outline">{calculateAssessmentWeek(assessment)}</Badge></td>
                                                            <td className="py-2 px-3 font-medium">{assessment.value} {parameter?.unit}</td>
                                                            <td className="py-2 px-3">
                                                                <Badge variant={assessment.is_normal ? "secondary" : "destructive"}>{assessment.is_normal ? 'Normal' : 'Abnormal'}</Badge>
                                                            </td>
                                                            <td className="py-2 px-3"><Button variant="ghost" size="icon" onClick={() => handleDeleteAssessment(assessment.id)}><Trash2 className="h-3 w-3 text-red-500"/></Button></td>
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
                      {patient.goals.length === 0 && <p className="text-center text-muted-foreground py-4">No goals set.</p>}
                  </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Clinical Review</CardTitle>
                <CardDescription>Conduct comprehensive clinical evaluation</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                      <h4 className="text-lg font-semibold text-foreground mb-2">New Review</h4>
                      <div className="space-y-4">
                          <Textarea placeholder="Subjective Findings..." value={reviewData.subjective_findings} onChange={(e) => setReviewData(p => ({...p, subjective_findings: e.target.value}))}/>
                          <Textarea placeholder="Objective Findings..." value={reviewData.objective_findings} onChange={(e) => setReviewData(p => ({...p, objective_findings: e.target.value}))}/>
                          <Textarea placeholder="Assessment & Diagnosis..." value={reviewData.assessment} onChange={(e) => setReviewData(p => ({...p, assessment: e.target.value}))}/>
                          <Textarea placeholder="Treatment Plan..." value={reviewData.plan} onChange={(e) => setReviewData(p => ({...p, plan: e.target.value}))}/>
                           <Button onClick={submitReview}><Save className="mr-2 h-4 w-4"/> Submit Review</Button>
                      </div>
                  </div>
                   <Separator className="my-6" />
                   <div className="space-y-4">
                        <h4 className="text-lg font-semibold text-foreground mb-2">Review History</h4>
                         {patient.reviews.length > 0 ? patient.reviews.map(review => (
                             <div key={review.id} className="p-4 rounded-xl border bg-muted/50">
                                <p className="font-semibold">Review on {new Date(review.review_date).toLocaleDateString()}</p>
                                <p className="text-sm text-muted-foreground">by {review.reviewed_by}</p>
                                <p className="text-sm mt-2">{review.plan}</p>
                            </div>
                         )) : <p className="text-center text-muted-foreground py-4">No reviews yet.</p>}
                   </div>

              </CardContent>
            </Card>

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
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>Edit Patient Details</DialogTitle>
                <CardDescription>Update the patient's registration information below.</CardDescription>
            </DialogHeader>
            <form onSubmit={handleUpdatePatient}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="first_name">First Name</Label>
                        <Input id="first_name" value={editFormData.first_name || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input id="middle_name" value={editFormData.middle_name || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="surname">Surname</Label>
                        <Input id="surname" value={editFormData.surname || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="dob">Date of Birth</Label>
                        <Input id="dob" type="date" value={editFormData.dob || ''} onChange={handleEditFormChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="age">Age</Label>
                        <Input id="age" type="number" value={editFormData.age || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sex">Sex</Label>
                        <Select value={editFormData.sex || ''} onValueChange={(value) => handleEditSelectChange('sex', value)} required>
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
                        <Input id="email" type="email" value={editFormData.email || ''} onChange={handleEditFormChange} />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="phone">Phone</Label>
                        <Input id="phone" type="tel" value={editFormData.phone || ''} onChange={handleEditFormChange} />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="wellness_date">Wellness Date</Label>
                        <Input id="wellness_date" type="date" value={editFormData.wellness_date || ''} onChange={handleEditFormChange} required />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="corporate_id">Corporate</Label>
                        <Select value={String(editFormData.corporate_id || 'null')} onValueChange={(value) => handleEditSelectChange('corporate_id', value)}>
                            <SelectTrigger id="corporate_id"><SelectValue placeholder="Select corporate" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="null">None</SelectItem>
                                {corporates.map((corporate) => (
                                    <SelectItem key={corporate.id} value={String(corporate.id)}>{corporate.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button type="submit" disabled={isSubmitting}>
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
    </div>
  );
}
