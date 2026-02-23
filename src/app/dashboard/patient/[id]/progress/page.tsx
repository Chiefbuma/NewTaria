import { fetchPatientById, fetchClinicalParameters, fetchUsers } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProgressPageClient from './progress-page-client';

export default async function PatientProgressPage({ params }: { params: { id: string } }) {
    const patient = await fetchPatientById(params.id);
    const clinicalParameters = await fetchClinicalParameters();
    const users = await fetchUsers();
    const clinicians = users.filter(u => u.role === 'physician' || u.role === 'navigator' || u.role === 'admin');

    if (!patient) {
        notFound();
    }

    return (
        <ProgressPageClient 
            patient={patient} 
            clinicalParameters={clinicalParameters} 
            clinicians={clinicians}
        />
    );
}
