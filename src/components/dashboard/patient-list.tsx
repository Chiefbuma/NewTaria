"use client"

import { useState, useEffect, useMemo } from 'react';
import type { Patient, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import { DataTable } from '../ui/data-table';
import { columns } from '../../app/dashboard/columns';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { isPartnerRole } from '@/lib/role-utils';

export default function PatientList({
  patients: initialPatients,
  compact = false,
  currentUser = null,
}: {
  patients: Patient[];
  compact?: boolean;
  currentUser?: User | null;
}) {
  const [patients, setPatients] = useState(initialPatients);
  const router = useRouter();

  useEffect(() => {
    setPatients(initialPatients);
  }, [initialPatients]);

  const visiblePatients = useMemo(() => {
    if (!currentUser || !isPartnerRole(currentUser.role)) {
      return patients;
    }

    if (currentUser.partner_type === 'clinic' && currentUser.partner_clinic_id) {
      return patients.filter((patient) => patient.clinic_id === currentUser.partner_clinic_id);
    }

    if (currentUser.partner_id) {
      return patients.filter((patient) => patient.partner_id === currentUser.partner_id);
    }

    return [];
  }, [currentUser, patients]);

  const toolbarActions = (
    <Button asChild size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground">
      <Link href="/dashboard/register-patient">
        <PlusCircle className="mr-2 h-4 w-4" /> Start Onboarding
      </Link>
    </Button>
  );

  return (
     <Card className="border-primary/10">
        <CardHeader className={compact ? "pb-0" : undefined}>
            {!compact && (
            <div>
                <CardTitle className="text-foreground">Patient Registry</CardTitle>
                <CardDescription className="text-muted-foreground">View and manage onboarded patient records.</CardDescription>
            </div>
            )}
        </CardHeader>
        <CardContent>
            <DataTable
                columns={columns}
                data={visiblePatients}
                onRowClick={(patient) => router.push(`/dashboard/patient/${patient.id}`)}
                toolbarActions={toolbarActions}
            />
        </CardContent>
    </Card>
  );
}
