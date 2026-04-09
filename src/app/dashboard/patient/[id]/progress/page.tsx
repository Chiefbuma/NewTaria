import { fetchPatientById, fetchClinicalParameters, fetchUsers } from '@/lib/data';
import { notFound, redirect } from 'next/navigation';
import ProgressPageClient from './progress-page-client';
import { canManageOnboarding, isClinicianRole } from '@/lib/role-utils';
import { getCurrentSessionUser } from '@/lib/auth';

export default async function PatientProgressPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const currentUser = await getCurrentSessionUser();
    if (!currentUser) {
        redirect('/');
    }

    const patient = await fetchPatientById(id, currentUser);
    const clinicalParameters = await fetchClinicalParameters();
    const users = await fetchUsers();
    const clinicians = users.filter(u => isClinicianRole(u.role) || u.role === 'navigator' || u.role === 'admin');

    if (!patient) {
        notFound();
    }

    if (patient.status === 'Pending' && !canManageOnboarding(currentUser.role)) {
        redirect('/dashboard/registry');
    }

    return (
        <ProgressPageClient 
            patient={patient} 
            clinicalParameters={clinicalParameters} 
            clinicians={clinicians}
            currentUser={currentUser}
        />
    );
}
