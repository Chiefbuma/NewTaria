import { fetchPatientById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetails from './patient-details';
import OnboardingForm from './onboarding-form';
import PatientHeader from './patient-header';


async function getPatientData(id: string) {
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
  
  if (patient.status === 'Pending') {
    return (
      <div className="container mx-auto max-w-4xl py-6">
        <PatientHeader patient={patient} />
        <OnboardingForm patient={patient} clinicalParameters={[]} />
      </div>
    );
  }

  return <PatientDetails initialPatient={patient} />;
}
