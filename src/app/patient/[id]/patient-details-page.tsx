'use client';

import { useState, useEffect } from 'react';
import type { Patient, Assessment, Goal, ClinicalParameter } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MetricGrid from '@/components/patient/metric-grid';
import GoalList from '@/components/patient/goal-list';
import AssessmentList from '@/components/patient/assessment-list';
import { fetchClinicalParameters } from '@/lib/data';

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
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [clinicalParameters, setClinicalParameters] = useState<ClinicalParameter[]>([]);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const loadParams = async () => {
      const params = await fetchClinicalParameters();
      setClinicalParameters(params);
    }
    loadParams();
  }, []);

  const handleUpdate = () => {
    toast({ title: 'Data refreshed (simulation)' });
    // This is where you would re-fetch patient data in a real app
    setPatient(prev => ({...prev})); // Force re-render of children
  };
  
  const handleAssessmentsUpdate = (updatedAssessments: Assessment[]) => {
    setPatient(prev => ({ ...prev, assessments: updatedAssessments }));
    toast({ title: 'Success', description: 'Assessments updated locally.' });
  }

  const handleGoalsUpdate = (updatedGoals: Goal[]) => {
    setPatient(prev => ({ ...prev, goals: updatedGoals }));
    toast({ title: 'Success', description: 'Goals updated locally.' });
  }

  const getStatusDisplayName = (status: Patient['status']) => {
    const statusMap = {
      Active: 'Active',
      Pending: 'Pending',
      Critical: 'Critical',
      Discharged: 'Discharged',
      'In Review': 'In Review'
    };
    return statusMap[status] || status;
  };
  
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <ArrowLeft />
                Back to Patients
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline"><Edit className="mr-2"/> Edit Patient</Button>
              <Button onClick={handleUpdate}><RefreshCw className="mr-2"/> Refresh Data</Button>
            </div>
          </div>
          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-2xl p-8 shadow-xl border border-blue-200/40">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                        {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={`${patient.first_name} ${patient.surname || ''}`} />}
                        <AvatarFallback className="text-3xl">{`${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {patient.first_name} {patient.middle_name || ''} {patient.surname}
                        </h1>
                        <p className="text-lg text-gray-600 font-mono">Patient ID: {patient.id}</p>
                    </div>
                </div>
                <Badge className={cn('text-base', patient.status === 'Critical' && 'bg-red-500 text-white')}>{getStatusDisplayName(patient.status)}</Badge>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200/60">
                <DetailItem label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} />
                <DetailItem label="Age" value={patient.age?.toString()} />
                <DetailItem label="Onboarding Date" value={patient.date_of_onboarding ? new Date(patient.date_of_onboarding).toLocaleDateString() : 'N/A'} />
            </div>
          </div>
        </div>

        <Card>
            <CardContent className="p-6">
                <Tabs defaultValue="metrics">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="metrics">Metrics</TabsTrigger>
                        <TabsTrigger value="assessments">Assessments</TabsTrigger>
                        <TabsTrigger value="goals">Goals</TabsTrigger>
                    </TabsList>
                    <TabsContent value="metrics">
                       <MetricGrid 
                            patient={patient}
                            clinicalParameters={clinicalParameters}
                            onAssessmentsUpdate={handleAssessmentsUpdate}
                        />
                    </TabsContent>
                    <TabsContent value="assessments">
                        <AssessmentList 
                             patient={patient}
                             assessments={patient.assessments}
                             clinicalParameters={clinicalParameters}
                             onAssessmentsUpdate={handleAssessmentsUpdate}
                        />
                    </TabsContent>
                    <TabsContent value="goals">
                        <GoalList 
                            patient={patient}
                            goals={patient.goals}
                            clinicalParameters={clinicalParameters}
                            onGoalsUpdate={handleGoalsUpdate}
                        />
                    </TabsContent>
                </Tabs>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
