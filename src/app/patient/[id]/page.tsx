import { fetchPatientById, fetchClinicalParameters } from '@/lib/data';
import { notFound } from 'next/navigation';
import OnboardingForm from './onboarding-form';
import PatientHeader from './patient-header';
import MetricGrid from './metric-grid';
import GoalList from './goal-list';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Activity, Target } from 'lucide-react';
import type { Patient } from '@/lib/types';


async function getPatientData(id: string): Promise<Patient | null> {
    try {
        const patient = await fetchPatientById(id);
        return patient;
    } catch (error) {
        console.error("Failed to fetch patient data:", error);
        return null;
    }
}

export default async function PatientPage({ params }: { params: { id: string } }) {
  const patient = await getPatientData(params.id);

  if (!patient) {
    notFound();
  }

  const clinicalParameters = await fetchClinicalParameters();

  if (patient.status === 'Pending') {
    return (
      <div className="container mx-auto max-w-4xl py-6">
        <PatientHeader patient={patient} />
        <OnboardingForm patient={patient} clinicalParameters={clinicalParameters} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
        <PatientHeader patient={patient} />
        <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
                <TabsTrigger value="overview">
                    <Activity className="mr-2 h-4 w-4"/>
                    Metrics Overview
                </TabsTrigger>
                <TabsTrigger value="goals">
                    <Target className="mr-2 h-4 w-4"/>
                    Health Goals
                </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
                <MetricGrid patient={patient} clinicalParameters={clinicalParameters} />
            </TabsContent>
            <TabsContent value="goals">
                <GoalList patient={patient} clinicalParameters={clinicalParameters} />
            </TabsContent>
        </Tabs>
    </div>
  );
}
