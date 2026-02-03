import { fetchPatientById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PatientDetails from './patient-details';

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
  
  // The logic for Pending vs. Active is now handled within PatientDetails
  return <PatientDetails initialPatient={patient} />;
}
