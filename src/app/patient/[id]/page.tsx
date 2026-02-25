import { fetchPatientById, fetchUsers, fetchCorporates, fetchPartners } from '@/lib/data';
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
      const [users, corporates, partners] = await Promise.all([
          fetchUsers(),
          fetchCorporates(),
          fetchPartners()
      ]);
      const navigators = users.filter(u => u.role === 'navigator');
      return (
        <OnboardingForm 
            patient={patient} 
            initialNavigators={navigators} 
            initialCorporates={corporates} 
            initialPartners={partners} 
        />
      );
  }

  return <PatientDetailsPage initialPatient={patient} />;
}
