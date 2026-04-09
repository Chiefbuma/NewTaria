import { redirect } from 'next/navigation';
import { getCurrentSessionUser } from '@/lib/auth';
import { fetchPatients } from '@/lib/data';
import PatientList from '@/components/dashboard/patient-list';
import { isPatientRole } from '@/lib/role-utils';

export default async function RegistryPage() {
  const currentUser = await getCurrentSessionUser();
  if (!currentUser) {
    redirect('/');
  }

  if (isPatientRole(currentUser.role) && currentUser.patientId) {
    redirect(`/dashboard/patient/${currentUser.patientId}/progress`);
  }

  const patients = await fetchPatients(currentUser);
  const onboardedPatients = patients.filter((patient) => patient.status !== 'Pending');

  return (
    <PatientList patients={onboardedPatients} compact currentUser={currentUser} />
  );
}
