'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import type { User } from '@/lib/types';
import { isPatientRole } from '@/lib/role-utils';
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar';

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User & { patientId?: number };
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isProgressPage = pathname.includes('/progress');

  useEffect(() => {
    const stored = localStorage.getItem('dashboardSidebarOpen');
    if (stored) {
      setSidebarOpen(stored === 'true');
    }
  }, []);

  useEffect(() => {
    if (user && isPatientRole(user.role) && (pathname === '/dashboard' || pathname === '/dashboard/registry')) {
      if (user.patientId) {
        router.push(`/dashboard/patient/${user.patientId}/progress`);
      }
    }
  }, [user, pathname, router]);

  if (isProgressPage || isPatientRole(user.role)) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        <header className="glass-white flex h-14 shrink-0 items-center gap-4 border-b px-4 text-foreground shadow-sm lg:h-[60px] lg:px-6">
          <Link href="/dashboard" className="flex items-center font-semibold text-foreground md:hidden">
            <span className="text-sm font-black uppercase tracking-[0.3em]">NewTaria</span>
          </Link>
          <div className="w-full flex-1" />
          <Header user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    );
  }

  return (
    <SidebarProvider
      open={sidebarOpen}
      onOpenChange={(open) => {
        setSidebarOpen(open);
        localStorage.setItem('dashboardSidebarOpen', String(open));
      }}
    >
      <AppSidebar user={user} />
      <SidebarInset>
        <header className="glass-white flex h-14 items-center gap-3 border-b px-3 text-foreground shadow-sm sm:px-4 lg:h-[60px] lg:px-6">
          <SidebarTrigger className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" />
          <div className="w-full flex-1" />
          <Header user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
