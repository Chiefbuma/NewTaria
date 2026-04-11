import { fetchPatientById, fetchClinicalParameters, fetchUsers, fetchPartners, fetchMedications } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import PatientDetailsPage from './patient-details-page';
import OnboardingForm from './onboarding-form';
import { canManageOnboarding, isClinicianRole, isPatientRole } from '@/lib/role-utils';
import { getCurrentSessionUser } from '@/lib/auth';

export default async function PatientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    redirect('/');
  }

  // Members (patients) should land on their own progress page.
  if (isPatientRole(currentUser.role) && currentUser.patientId) {
    redirect(`/dashboard/patient/${currentUser.patientId}/progress`);
  }

  const patient = await fetchPatientById(id, currentUser);
  
  if (!patient) {
    notFound();
  }
  
  if (patient.status === 'Pending') {
      if (!canManageOnboarding(currentUser.role)) {
        redirect('/dashboard/registry');
      }
      const partners = await fetchPartners();
      return <OnboardingForm patient={patient} initialPartners={partners} currentUser={currentUser} />;
  }

  const [clinicalParameters, users, medications] = await Promise.all([
      fetchClinicalParameters(),
      fetchUsers(),
      fetchMedications()
  ]);
  
  const clinicians = users.filter(u => isClinicianRole(u.role) || u.role === 'navigator' || u.role === 'admin');

  return (
    <PatientDetailsPage 
        initialPatient={patient} 
        clinicalParameters={clinicalParameters} 
        clinicians={clinicians} 
        initialMedications={medications}
        currentUser={currentUser}
    />
  );
}
