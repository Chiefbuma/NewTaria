'use client';

import type { Patient, Corporate, User, ClinicalParameter, Assessment, Goal } from '@/lib/types';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
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
  User as UserIcon,
  Cake,
  Phone,
  Mail,
  Building2,
  Binary,
  FileText,
  Loader2,
  CalendarDays,
  Trash2,
  Edit,
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import ReportViewer from '@/components/report-viewer';
import MetricGrid from './metric-grid';
import GoalList from './goal-list';
import AssessmentList from './assessment-list';
import { fetchCorporates } from '@/lib/data';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

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

interface PatientDetailsProps {
    patient: Patient;
    clinicalParameters: ClinicalParameter[];
}

export default function PatientDetails({ patient: initialPatient, clinicalParameters }: PatientDetailsProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [corporates, setCorporates] = useState<Corporate[]>([]);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  const [editFormData, setEditFormData] = useState<Partial<Patient>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }

    fetchCorporates()
      .then(setCorporates)
      .catch(error => {
        console.error("Failed to fetch corporates", error);
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to load corporate list.' });
      });
  }, [toast]);


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
    await new Promise(resolve => setTimeout(resolve, 500));

    const updatedPatientData = { ...patient, ...editFormData };
    const corporate = corporates.find(c => c.id === Number(editFormData.corporate_id));
    if (corporate) {
      updatedPatientData.corporate_name = corporate.name;
    } else {
      updatedPatientData.corporate_name = undefined;
    }
    
    setPatient(updatedPatientData);
    
    toast({ title: 'Success!', description: 'Patient details updated. (Mock)' });
    setIsEditModalOpen(false);
    setIsSubmitting(false);
  }
  
  const handleDeletePatient = async () => {
    setIsDeleting(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({ title: 'Success', description: 'Patient record deleted. (Mock)' });
    router.push('/dashboard');
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditFormData({ ...editFormData, [e.target.id]: e.target.value });
  };
  
  const handleEditSelectChange = (name: string, value: string) => {
    const processedValue = value === 'null' ? null : value;
    setEditFormData({ ...editFormData, [name]: processedValue });
  };
  
  const handleAssessmentAdded = (newAssessment: Assessment) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      assessments: [newAssessment, ...(prevPatient.assessments || [])]
        .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
    }));
  };

  const handleAssessmentUpdated = (updatedAssessment: Assessment) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      assessments: (prevPatient.assessments || []).map(a => a.id === updatedAssessment.id ? updatedAssessment : a)
        .sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime())
    }));
  };

  const handleAssessmentDeleted = (assessmentId: number) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      assessments: (prevPatient.assessments || []).filter(a => a.id !== assessmentId)
    }));
  };

  const handleGoalAdded = (newGoal: Goal) => {
    setPatient(prevPatient => ({
      ...prevPatient,
      goals: [newGoal, ...(prevPatient.goals || [])]
    }));
  };

  if (!isClient) {
    return <div className="flex items-center justify-center h-96"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
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
                    <span>Corporate Partner</span>
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
                            <Button variant="destructive" className="w-full">
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
             <Tabs defaultValue="metrics">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="metrics">Metrics</TabsTrigger>
                    <TabsTrigger value="assessments">Assessments</TabsTrigger>
                    <TabsTrigger value="goals">Goals</TabsTrigger>
                </TabsList>
                <TabsContent value="metrics" className="mt-6">
                    <MetricGrid 
                      patientId={patient.id} 
                      assessments={patient.assessments || []} 
                      clinicalParameters={clinicalParameters} 
                      onAssessmentAdded={handleAssessmentAdded}
                    />
                </TabsContent>
                 <TabsContent value="assessments" className="mt-6">
                    <AssessmentList
                      patientId={patient.id}
                      assessments={patient.assessments || []}
                      clinicalParameters={clinicalParameters}
                      onAssessmentAdded={handleAssessmentAdded}
                      onAssessmentUpdated={handleAssessmentUpdated}
                      onAssessmentDeleted={handleAssessmentDeleted}
                    />
                </TabsContent>
                <TabsContent value="goals" className="mt-6">
                    <GoalList 
                      patientId={patient.id}
                      goals={patient.goals || []} 
                      clinicalParameters={clinicalParameters} 
                      onGoalAdded={handleGoalAdded}
                    />
                </TabsContent>
            </Tabs>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
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
                    <div className="space-y-2">
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
                    <div className="space-y-2">
                         <Label htmlFor="status">Patient Status</Label>
                        <Select value={editFormData.status || ''} onValueChange={(value) => handleEditSelectChange('status', value)} required>
                            <SelectTrigger id="status"><SelectValue placeholder="Select status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Active">Active</SelectItem>
                                <SelectItem value="Pending">Pending</SelectItem>
                                <SelectItem value="In Review">In Review</SelectItem>
                                <SelectItem value="Critical">Critical</SelectItem>
                                <SelectItem value="Discharged">Discharged</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
                <DialogFooter className="mt-4">
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
