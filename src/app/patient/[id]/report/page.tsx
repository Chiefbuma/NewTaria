import { notFound } from 'next/navigation';
import Report from '@/components/report';
import { fetchPatientById } from '@/lib/data';
import type { Corporate } from '@/lib/types';

export default async function ReportPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const patient = await fetchPatientById(id);

  if (!patient) {
    notFound();
  }

  const corporate = patient.corporate_id
    ? { id: patient.corporate_id, name: patient.corporate_name!, wellness_date: patient.wellness_date! } as Corporate
    : null;

  return (
    <div className="report-container">
      <Report patient={patient} corporate={corporate} />
    </div>
  );
}
