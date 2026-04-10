'use client';

import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ClipboardList,
  Menu,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { canAccessAdminCenter, canManageOnboarding, isPatientRole } from '@/lib/role-utils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

function NavLink({
  href,
  title,
  icon,
  isActive,
  collapsed = false,
  onNavigate,
}: {
  href: string;
  title: string;
  icon: React.ReactNode;
  isActive: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={title}
      className={cn(
        'group mx-2 mb-0.5 flex items-center gap-3 rounded-md py-2 text-[11px] font-bold uppercase tracking-wider transition-colors',
        collapsed ? 'justify-center px-2' : 'px-3',
        isActive
          ? 'border border-primary/20 bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      <div className={cn('shrink-0', isActive ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground')}>
        {icon}
      </div>
      {!collapsed && <span className="truncate">{title}</span>}
      {!collapsed && isActive && <ChevronRight className="ml-auto h-3 w-3 opacity-50" />}
    </Link>
  );
}

function AdminSubLink({
  href,
  title,
  isActive,
  onNavigate,
}: {
  href: string;
  title: string;
  isActive: boolean;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'group mr-2 ml-9 mb-0.5 flex items-center gap-3 rounded-md px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors',
        isActive
          ? 'border border-primary/20 bg-primary/10 text-primary'
          : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
      )}
    >
      {title}
    </Link>
  );
}

function AppSidebarNav({
  user,
  collapsed = false,
  onNavigate,
}: {
  user: User & { patientId?: number };
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adminSection = searchParams.get('section') ?? 'dashboard';
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/dashboard/admin'));

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setAdminOpen(true);
    }
  }, [pathname]);

  return (
    <nav className="grid items-start py-4">
      <NavLink
        href="/dashboard/registry"
        isActive={pathname.startsWith('/dashboard/registry') || pathname.includes('/dashboard/patient/')}
        title="Patient Registry"
        icon={<ClipboardList className="h-4 w-4" />}
        collapsed={collapsed}
        onNavigate={onNavigate}
      />
      {canManageOnboarding(user.role) && (
        <NavLink
          href="/dashboard/register-patient"
          isActive={pathname === '/dashboard/register-patient'}
          title="Onboarding Module"
          icon={<UserPlus className="h-4 w-4" />}
          collapsed={collapsed}
          onNavigate={onNavigate}
        />
      )}
      {canAccessAdminCenter(user.role) && (
        <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="mt-3">
          <CollapsibleTrigger asChild>
            <button
              type="button"
              title="Admin Center"
              className="mx-2 flex w-[calc(100%-1rem)] items-center gap-3 rounded-md px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
            >
              <ShieldCheck className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">Admin Center</span>}
              {!collapsed && <ChevronRight className={cn('ml-auto h-3.5 w-3.5 transition-transform', adminOpen && 'rotate-90')} />}
            </button>
          </CollapsibleTrigger>
          <CollapsibleContent className={cn(collapsed && 'hidden')}>
            <div className="pt-1">
              <AdminSubLink
                href="/dashboard/admin?section=dashboard"
                title="Dashboard"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'dashboard'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=payers"
                title="Payers"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'payers'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=clinics"
                title="Clinics"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'clinics'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=diagnoses"
                title="Diagnoses"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'diagnoses'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=medications"
                title="Medications"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'medications'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=clinical-parameters"
                title="Clinical Parameters"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'clinical-parameters'}
                onNavigate={onNavigate}
              />
              <AdminSubLink
                href="/dashboard/admin?section=users"
                title="Users & Roles"
                isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'users'}
                onNavigate={onNavigate}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>
      )}
    </nav>
  );
}

function AppSidebar({
  user,
  collapsed = false,
  onNavigate,
  onToggleCollapse,
}: {
  user: User & { patientId?: number };
  collapsed?: boolean;
  onNavigate?: () => void;
  onToggleCollapse?: () => void;
}) {
  return (
    <div className="flex h-full flex-col gap-3 p-3">
      <div className={cn('glass-white flex h-14 items-center justify-between rounded-2xl shadow-[0_18px_35px_-28px_rgba(15,23,42,0.18)]', collapsed ? 'px-2' : 'px-4')}>
        <Link href="/dashboard" className="flex items-center">
          {collapsed ? (
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-muted">
              <div className="h-3.5 w-3.5 rounded-full bg-primary" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/20 bg-muted">
                <div className="h-3.5 w-3.5 rounded-full bg-primary" />
              </div>
              <div className="leading-none text-foreground">
                <p className="text-sm font-semibold tracking-wide">NewTaria</p>
                <p className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground">Care Program</p>
              </div>
            </div>
          )}
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hidden h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
          onClick={onToggleCollapse}
        >
          <ChevronRight className={cn('h-4 w-4 transition-transform', !collapsed && 'rotate-180')} />
          <span className="sr-only">{collapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto rounded-[1.5rem] border border-border/60 bg-background shadow-[0_20px_45px_-34px_rgba(15,23,42,0.18)]">
        <AppSidebarNav user={user} collapsed={collapsed} onNavigate={onNavigate} />
      </div>
    </div>
  );
}

export default function DashboardShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user: User & { patientId?: number };
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const isProgressPage = pathname.includes('/progress');

  const toggleSidebar = useCallback(() => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      setMobileNavOpen((prev) => !prev);
      return;
    }

    setSidebarCollapsed((prev) => {
      const nextState = !prev;
      localStorage.setItem('dashboardSidebarCollapsed', String(nextState));
      return nextState;
    });
  }, []);

  useEffect(() => {
    const storedSidebarState = localStorage.getItem('dashboardSidebarCollapsed');
    if (storedSidebarState) {
      setSidebarCollapsed(storedSidebarState === 'true');
    }
  }, []);

  useEffect(() => {
    if (user && isPatientRole(user.role) && (pathname === '/dashboard' || pathname === '/dashboard/registry')) {
      if (user.patientId) {
        router.push(`/dashboard/patient/${user.patientId}/progress`);
      }
    }
  }, [user, pathname, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

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
    <div className={cn('grid min-h-screen w-full bg-background transition-[grid-template-columns]', sidebarCollapsed ? 'md:grid-cols-[84px_1fr]' : 'md:grid-cols-[232px_1fr]')}>
      <aside className="hidden bg-transparent md:block">
        <AppSidebar user={user} collapsed={sidebarCollapsed} onToggleCollapse={toggleSidebar} />
      </aside>

      <div className="flex min-w-0 flex-col">
        <header className="glass-white flex h-14 items-center gap-3 border-b px-3 text-foreground shadow-sm sm:px-4 lg:h-[60px] lg:px-6">
          <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:bg-muted hover:text-foreground md:hidden" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetContent side="left" className="w-[88vw] max-w-[232px] border-0 bg-transparent p-0 shadow-none">
              <SheetHeader className="sr-only">
                <SheetTitle>Dashboard navigation</SheetTitle>
              </SheetHeader>
              <AppSidebar user={user} onNavigate={() => setMobileNavOpen(false)} />
            </SheetContent>
          </Sheet>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hidden h-8 w-8 text-muted-foreground hover:bg-muted hover:text-foreground md:inline-flex"
            onClick={toggleSidebar}
          >
            <ChevronRight className={cn('h-4 w-4 transition-transform', !sidebarCollapsed && 'rotate-180')} />
            <span className="sr-only">{sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}</span>
          </Button>
          <div className="w-full flex-1" />
          <Header user={user} />
        </header>
        <main className="flex flex-1 flex-col gap-4 bg-background p-4 lg:gap-6 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
