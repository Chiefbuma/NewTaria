import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { fetchPatients } from '@/lib/data';
import DashboardClient from './dashboard-client';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

export default async function DashboardPage() {
  const patients = await fetchPatients();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold font-headline tracking-tight">
            Patient Dashboard
          </h1>
          <p className="text-muted-foreground">
            A list of all patients in the system.
          </p>
        </div>
        <Button asChild>
            <Link href="/register">
                <PlusCircle className="mr-2 h-4 w-4" />
                Register New Patient
            </Link>
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6">
          <DashboardClient initialPatients={patients} />
        </CardContent>
      </Card>
    </div>
  );
}
