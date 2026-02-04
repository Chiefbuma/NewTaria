'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Patient, Corporate, User, Vital, Nutrition, Goal, Clinical } from '@/lib/types';
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
  DialogTrigger,
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
  Edit
} from 'lucide-react';
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

export default function PatientDetailsPage({ initialPatient }: { initialPatient: Patient }) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [loading, setLoading] = useState(false);
  
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [corporates, setCorporates] = useState<Corporate[]>(mockCorporates);

  const [isVitalsModalOpen, setIsVitalsModalOpen] = useState(false);
  const [isNutritionModalOpen, setIsNutritionModalOpen] = useState(false);
  const [isGoalModalOpen, setIsGoalModalOpen] = useState(false);
  const [isClinicalModalOpen, setIsClinicalModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  // Form states
  const [vitalsForm, setVitalsForm] = useState({ bp_systolic: '', bp_diastolic: '', pulse: '', temp: '', rbs: '' });
  const [nutritionForm, setNutritionForm] = useState({ height: '', weight: '', visceral_fat: '', body_fat_percent: '', notes_nutritionist: '' });
  const [goalForm, setGoalForm] = useState({ discussion: '', goal: '' });
  const [clinicalForm, setClinicalForm] = useState({ notes_doctor: '', notes_psychologist: '' });
  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const handleFormSubmit = (section: 'vitals' | 'nutrition' | 'goals' | 'clinicals', body: any, modalSetter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setIsSubmitting(true);
    setTimeout(() => {
        const newRecord = {
            id: Date.now(),
            patient_id: patient.id,
            ...body,
            created_at: new Date().toISOString(),
        };

        const updatedPatient = { ...patient, [section]: [newRecord] };
        setPatient(updatedPatient);
        
        toast({ title: 'Success!', description: 'Record saved locally.' });
        modalSetter(false);
        setIsSubmitting(false);
    }, 500);
  };

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
                            <AlertDialogAction onClick={handleDeletePatient} disabled={isDeleting}>
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
            {/* Vitals Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                   <HeartPulse className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Vitals</CardTitle>
                    <CardDescription>
                      Latest vital signs measurement.
                    </CardDescription>
                  </div>
                </div>
                <Dialog open={isVitalsModalOpen} onOpenChange={setIsVitalsModalOpen}>
                  <DialogTrigger asChild>
                     <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {patient.vitals && patient.vitals.length > 0 ? 'Edit Vitals' : 'Add Vitals'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{patient.vitals && patient.vitals.length > 0 ? 'Edit Vitals' : 'Add New Vitals'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('vitals', vitalsForm, setIsVitalsModalOpen); }}>
                      <div className="grid grid-cols-1 gap-6 py-4">
                        <div className="space-y-2"><Label htmlFor="bp_systolic">Systolic (mmHg)</Label><Input id="bp_systolic" type="number" value={vitalsForm.bp_systolic} onChange={(e) => setVitalsForm({...vitalsForm, bp_systolic: e.target.value})}/></div>
                        <div className="space-y-2"><Label htmlFor="bp_diastolic">Diastolic (mmHg)</Label><Input id="bp_diastolic" type="number" value={vitalsForm.bp_diastolic} onChange={(e) => setVitalsForm({...vitalsForm, bp_diastolic: e.target.value})} /></div>
                        <div className="space-y-2"><Label htmlFor="pulse">Pulse (bpm)</Label><Input id="pulse" type="number" value={vitalsForm.pulse} onChange={(e) => setVitalsForm({...vitalsForm, pulse: e.target.value})} /></div>
                        <div className="space-y-2"><Label htmlFor="temp">Temp (°C)</Label><Input id="temp" type="number" step="0.1" value={vitalsForm.temp} onChange={(e) => setVitalsForm({...vitalsForm, temp: e.target.value})} /></div>
                        <div className="space-y-2"><Label htmlFor="rbs">RBS (mmol/L)</Label><Input id="rbs" value={vitalsForm.rbs} onChange={(e) => setVitalsForm({...vitalsForm, rbs: e.target.value})} /></div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline"><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          {isSubmitting ? 'Saving...' : 'Save Record'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.vitals && patient.vitals.length > 0 ? (
                    patient.vitals.map((vital) => (
                      <div key={vital.id} className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm p-4 bg-muted/50 rounded-lg">
                          <DetailItem label="Systolic (mmHg)" value={vital.bp_systolic} />
                          <DetailItem label="Diastolic (mmHg)" value={vital.bp_diastolic} />
                          <DetailItem label="Pulse (bpm)" value={vital.pulse} />
                          <DetailItem label="Temp (°C)" value={vital.temp} />
                          <DetailItem label="RBS (mmol/L)" value={vital.rbs} />
                      </div>
                    ))
                ) : ( <p className="text-muted-foreground text-center py-4">No vitals recorded.</p> )}
              </CardContent>
            </Card>

            {/* Nutrition Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Scale className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Nutrition</CardTitle>
                    <CardDescription>Latest nutrition assessment details.</CardDescription>
                  </div>
                </div>
                 <Dialog open={isNutritionModalOpen} onOpenChange={setIsNutritionModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      {patient.nutrition && patient.nutrition.length > 0 ? 'Edit Assessment' : 'Add Assessment'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{patient.nutrition && patient.nutrition.length > 0 ? 'Edit Nutrition Assessment' : 'Add Nutrition Assessment'}</DialogTitle>
                    </DialogHeader>
                     <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('nutrition', nutritionForm, setIsNutritionModalOpen); }}>
                        <div className="py-4 space-y-6">
                          <div className="grid grid-cols-1 gap-6">
                              <div className="space-y-2"><Label htmlFor="height">Height (cm)</Label><Input id="height" type="number" value={nutritionForm.height} onChange={(e) => setNutritionForm({...nutritionForm, height: e.target.value})} /></div>
                              <div className="space-y-2"><Label htmlFor="weight">Weight (kg)</Label><Input id="weight" type="number" step="0.1" value={nutritionForm.weight} onChange={(e) => setNutritionForm({...nutritionForm, weight: e.target.value})} /></div>
                              <div className="space-y-2"><Label htmlFor="visceral_fat">Visceral Fat</Label><Input id="visceral_fat" type="number" value={nutritionForm.visceral_fat} onChange={(e) => setNutritionForm({...nutritionForm, visceral_fat: e.target.value})} /></div>
                              <div className="space-y-2"><Label htmlFor="body_fat_percent">Body Fat %</Label><Input id="body_fat_percent" type="number" step="0.1" value={nutritionForm.body_fat_percent} onChange={(e) => setNutritionForm({...nutritionForm, body_fat_percent: e.target.value})} /></div>
                          </div>
                          <div className="space-y-2"><Label htmlFor="notes_nutritionist">Nutritionist Notes</Label><Textarea id="notes_nutritionist" value={nutritionForm.notes_nutritionist} onChange={(e) => setNutritionForm({...nutritionForm, notes_nutritionist: e.target.value})} /></div>
                        </div>
                        <DialogFooter>
                          <DialogClose asChild>
                            <Button type="button" variant="outline"><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
                          </DialogClose>
                          <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                            {isSubmitting ? 'Saving...' : 'Save Record'}
                          </Button>
                        </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.nutrition && patient.nutrition.length > 0 ? (
                    patient.nutrition.map((nutri) => (
                    <div key={nutri.id} className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 text-sm p-4 bg-muted/50 rounded-lg">
                          <DetailItem label="Height (cm)" value={nutri.height} />
                          <DetailItem label="Weight (kg)" value={nutri.weight} />
                          <DetailItem label="BMI" value={nutri.bmi} />
                          <DetailItem label="Visceral Fat" value={nutri.visceral_fat} />
                          <DetailItem label="Body Fat %" value={nutri.body_fat_percent} />
                        </div>
                        {nutri.notes_nutritionist && (<> <Separator className="my-4" /> <div><p className="text-sm font-medium text-muted-foreground">Nutritionist Notes</p><p className="text-foreground mt-1 whitespace-pre-wrap text-sm">{nutri.notes_nutritionist}</p></div></>)}
                    </div>
                    ))
                ) : ( <p className="text-muted-foreground text-center py-4">No nutrition assessment recorded.</p> )}
              </CardContent>
            </Card>
            
            {/* Goals Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Target className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Goals</CardTitle>
                    <CardDescription>Patient's health and wellness goals.</CardDescription>
                  </div>
                </div>
                 <Dialog open={isGoalModalOpen} onOpenChange={setIsGoalModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        {patient.goals && patient.goals.length > 0 ? 'Edit Goal' : 'Set Goal'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{patient.goals && patient.goals.length > 0 ? 'Edit Goal' : 'Set New Goal'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('goals', goalForm, setIsGoalModalOpen); }}>
                      <div className="space-y-6 py-4">
                          <div className="space-y-2"><Label htmlFor="discussion">Discussion</Label><Textarea id="discussion" value={goalForm.discussion} onChange={(e) => setGoalForm({...goalForm, discussion: e.target.value})} /></div>
                          <div className="space-y-2"><Label htmlFor="goal">Goal</Label><Textarea id="goal" value={goalForm.goal} onChange={(e) => setGoalForm({...goalForm, goal: e.target.value})} /></div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline"><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          {isSubmitting ? 'Saving...' : 'Save Record'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.goals && patient.goals.length > 0 ? (
                    <div className="space-y-4">
                    {patient.goals.map((goal) => (
                    <div key={goal.id} className="space-y-4 p-4 border rounded-xl bg-background/50">
                        <div><h4 className="font-semibold text-primary">Discussion</h4><p className="text-foreground mt-1 text-sm">{goal.discussion || '-'}</p></div>
                        <Separator />
                        <div><h4 className="font-semibold text-primary">Goal</h4><p className="text-foreground mt-1 text-sm">{goal.goal || '-'}</p></div>
                    </div>
                    ))}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-4">No goals set.</p> )}
              </CardContent>
            </Card>

            {/* Clinical Review Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="flex items-center gap-4">
                  <Stethoscope className="w-6 h-6 text-primary" />
                  <div>
                    <CardTitle>Clinical Review</CardTitle>
                    <CardDescription>Notes from clinical staff.</CardDescription>
                  </div>
                </div>
                 <Dialog open={isClinicalModalOpen} onOpenChange={setIsClinicalModalOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white">
                        <PlusCircle className="mr-2 h-4 w-4"/>
                        {patient.clinicals && patient.clinicals.length > 0 ? 'Edit Review' : 'Add Review'}
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>{patient.clinicals && patient.clinicals.length > 0 ? 'Edit Clinical Review' : 'Add Clinical Review'}</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={(e) => { e.preventDefault(); handleFormSubmit('clinicals', clinicalForm, setIsClinicalModalOpen); }}>
                      <div className="space-y-6 py-4">
                          <div className="space-y-2"><Label htmlFor="notes_doctor">Doctor's Notes</Label><Textarea id="notes_doctor" value={clinicalForm.notes_doctor} onChange={(e) => setClinicalForm({...clinicalForm, notes_doctor: e.target.value})}/></div>
                          <div className="space-y-2"><Label htmlFor="notes_psychologist">Psychologist's Notes</Label><Textarea id="notes_psychologist" value={clinicalForm.notes_psychologist} onChange={(e) => setClinicalForm({...clinicalForm, notes_psychologist: e.target.value})}/></div>
                      </div>
                      <DialogFooter>
                        <DialogClose asChild>
                          <Button type="button" variant="outline"><XCircle className="mr-2 h-4 w-4" />Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={isSubmitting}>
                          {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          {isSubmitting ? 'Saving...' : 'Save Record'}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                {patient.clinicals && patient.clinicals.length > 0 ? (
                    <div className="space-y-6">
                    {patient.clinicals.map((clinic) => (
                    <div key={clinic.id} className="space-y-6">
                        {clinic.notes_doctor && (<div className="p-4 border rounded-xl bg-background/50"><h4 className="font-semibold text-primary">Doctor's Notes</h4><p className="text-foreground mt-2 text-sm">{clinic.notes_doctor}</p></div>)}
                        {clinic.notes_psychologist && (<div className="p-4 border rounded-xl bg-background/50"><h4 className="font-semibold text-primary">Psychologist's Notes</h4><p className="text-foreground mt-2 text-sm">{clinic.notes_psychologist}</p></div>)}
                        {!clinic.notes_doctor && !clinic.notes_psychologist && (<p className="text-muted-foreground text-sm text-center">No clinical notes recorded for this entry.</p>)}
                    </div>
                    ))}
                    </div>
                ) : ( <p className="text-muted-foreground text-center py-4">No clinical review found.</p> )}
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
    </div>
  );
}
