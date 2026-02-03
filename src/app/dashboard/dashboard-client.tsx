'use client';
import type { Patient } from '@/lib/types';
import { columns } from './columns';
import { DataTable } from '@/components/ui/data-table';

export default function DashboardClient({ initialPatients }: { initialPatients: Patient[] }) {
    return (
        <DataTable
            columns={columns}
            data={initialPatients}
        />
    );
}
