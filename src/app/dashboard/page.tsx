import { fetchPatients, fetchClinicalParameters, fetchUsers, fetchCorporates } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const patients = await fetchPatients();
  const clinicalParameters = await fetchClinicalParameters();
  const users = await fetchUsers();
  const corporates = await fetchCorporates();
  
  return (
    <DashboardClient 
      initialPatients={patients} 
      initialClinicalParameters={clinicalParameters}
      initialUsers={users}
      initialCorporates={corporates}
    />
  );
}
