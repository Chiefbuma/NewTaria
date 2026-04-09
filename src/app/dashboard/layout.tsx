import type React from 'react';
import { redirect } from 'next/navigation';
import DashboardShell from '@/components/dashboard/dashboard-shell';
import { getCurrentSessionUser } from '@/lib/auth';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentSessionUser();

  if (!user) {
    redirect('/');
  }

  return <DashboardShell user={user}>{children}</DashboardShell>;
}
