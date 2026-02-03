import { fetchPatients, fetchClinicalParameters, fetchUsers } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const patients = await fetchPatients();
  const clinicalParameters = await fetchClinicalParameters();
  const users = await fetchUsers();
  
  return (
    <DashboardClient 
      initialPatients={patients} 
      initialClinicalParameters={clinicalParameters}
      initialUsers={users}
    />
  );
}
