'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Header from '@/components/header';
import { AppSidebar } from '@/components/app-sidebar';
import Logo from '@/components/logo';
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
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="sticky top-0 z-50 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/45 px-4 text-foreground shadow-[0_10px_40px_-28px_rgba(15,23,42,0.26)] backdrop-blur-xl lg:h-[60px] lg:px-6"
        >
          <Link href="/dashboard" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="w-full flex-1" />
          <Header user={user} />
        </motion.header>
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
        <motion.header
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: 'easeOut' }}
          className="sticky top-0 z-50 flex h-14 items-center gap-3 border-b border-border/50 bg-background/45 px-3 text-foreground shadow-[0_10px_40px_-28px_rgba(15,23,42,0.26)] backdrop-blur-xl sm:px-4 lg:h-[60px] lg:px-6"
        >
          <SidebarTrigger className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground" />
          <Link href="/dashboard" className="flex items-center">
            <Logo className="h-8 w-auto" />
          </Link>
          <div className="w-full flex-1" />
          <Header user={user} />
        </motion.header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
