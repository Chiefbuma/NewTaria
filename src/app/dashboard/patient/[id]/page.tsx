import { fetchPatientById, fetchClinicalParameters, fetchUsers, fetchPayers, fetchMedications } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetailsPage from './patient-details-page';
import OnboardingForm from './onboarding-form';

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await fetchPatientById(id);
  
  if (!patient) {
    notFound();
  }
  
  if (patient.status === 'Pending') {
      const payers = await fetchPayers();
      return <OnboardingForm patient={patient} initialPayers={payers} />;
  }

  const [clinicalParameters, users, medications] = await Promise.all([
      fetchClinicalParameters(),
      fetchUsers(),
      fetchMedications()
  ]);
  
  const clinicians = users.filter(u => u.role === 'physician' || u.role === 'navigator' || u.role === 'admin');

  return (
    <PatientDetailsPage 
        initialPatient={patient} 
        clinicalParameters={clinicalParameters} 
        clinicians={clinicians} 
        initialMedications={medications}
    />
  );
}
