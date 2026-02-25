
import { fetchPatients, fetchClinicalParameters, fetchUsers, fetchDashboardStats } from '@/lib/data';
import DashboardClient from './dashboard-client';

export default async function DashboardPage() {
  const [patients, clinicalParameters, users, stats] = await Promise.all([
      fetchPatients(),
      fetchClinicalParameters(),
      fetchUsers(),
      fetchDashboardStats()
  ]);
  
  return (
    <DashboardClient 
      initialPatients={patients} 
      initialClinicalParameters={clinicalParameters}
      initialUsers={users}
      initialStats={stats}
    />
  );
}
