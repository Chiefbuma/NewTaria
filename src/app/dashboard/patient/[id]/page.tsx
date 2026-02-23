import { fetchPatientById, fetchClinicalParameters, fetchUsers } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetailsPage from './patient-details-page';
import OnboardingForm from './onboarding-form';

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
  const clinicalParameters = await fetchClinicalParameters();
  const users = await fetchUsers();
  const clinicians = users.filter(u => u.role === 'physician' || u.role === 'navigator' || u.role === 'admin');
  
  if (!patient) {
    notFound();
  }
  
  if (patient.status === 'Pending') {
      return <OnboardingForm patient={patient} />;
  }

  return <PatientDetailsPage initialPatient={patient} clinicalParameters={clinicalParameters} clinicians={clinicians} />;
}
