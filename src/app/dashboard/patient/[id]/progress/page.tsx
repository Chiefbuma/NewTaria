import { fetchPatientById, fetchClinicalParameters } from '@/lib/data';
import { notFound } from 'next/navigation';
import ProgressDashboard from './progress-dashboard';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default async function PatientProgressPage({ params }: { params: { id: string } }) {
    const patient = await fetchPatientById(params.id);
    const clinicalParameters = await fetchClinicalParameters();

    if (!patient) {
        notFound();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href={`/dashboard/patient/${params.id}`}>
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to Patient Details</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-headline tracking-tight">
                        Progress Dashboard
                    </h1>
                    <p className="text-muted-foreground">
                        Visualizing progress for {patient.first_name} {patient.surname || ''}
                    </p>
                </div>
          </div>
          <ProgressDashboard patient={patient} clinicalParameters={clinicalParameters} />
        </div>
    );
}
