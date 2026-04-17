'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { BarChart3, ChevronRight, ClipboardList, ShieldCheck, UserPlus } from 'lucide-react';

import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarRail,
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import type { User } from '@/lib/types';
import { canAccessAdminCenter, canManageOnboarding, isPartnerRole } from '@/lib/role-utils';
import { useSidebar } from '@/components/ui/sidebar';

function AppSidebarNav({ user }: { user: User & { patientId?: number } }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const adminSection = searchParams.get('section') ?? 'dashboard';
  const [adminOpen, setAdminOpen] = useState(pathname.startsWith('/dashboard/admin'));
  const { isMobile, setOpenMobile } = useSidebar();

  const closeMobileSidebar = () => {
    if (isMobile) {
      setOpenMobile(false);
    }
  };

  useEffect(() => {
    if (pathname.startsWith('/dashboard/admin')) {
      setAdminOpen(true);
    }
  }, [pathname]);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          asChild
          tooltip="Member Registry"
          isActive={pathname.startsWith('/dashboard/registry') || pathname.includes('/dashboard/patient/')}
        >
          <Link href="/dashboard/registry" onClick={closeMobileSidebar}>
            <ClipboardList />
            <span>Member Registry</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>

      {(canAccessAdminCenter(user.role) || isPartnerRole(user.role)) && (
        <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Dashboard" isActive={pathname.startsWith('/dashboard/insights')}>
          <Link href="/dashboard/insights" onClick={closeMobileSidebar}>
              <BarChart3 />
              <span>Dashboard</span>
            </Link>
        </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {canManageOnboarding(user.role) && (
        <SidebarMenuItem>
        <SidebarMenuButton asChild tooltip="Onboarding Module" isActive={pathname === '/dashboard/register-patient'}>
          <Link href="/dashboard/register-patient" onClick={closeMobileSidebar}>
              <UserPlus />
              <span>Onboarding Module</span>
            </Link>
        </SidebarMenuButton>
        </SidebarMenuItem>
      )}

      {canAccessAdminCenter(user.role) && (
        <SidebarMenuItem>
          <Collapsible open={adminOpen} onOpenChange={setAdminOpen} className="w-full">
            <CollapsibleTrigger asChild>
              <SidebarMenuButton tooltip="Admin Center" isActive={pathname.startsWith('/dashboard/admin')}>
                <ShieldCheck />
                <span>Admin Center</span>
                <ChevronRight
                  className={cn(
                    'ml-auto h-4 w-4 transition-transform group-data-[collapsible=icon]:hidden',
                    adminOpen && 'rotate-90'
                  )}
                />
              </SidebarMenuButton>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarMenuSub>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'payers'}
                  >
                    <Link href="/dashboard/admin?section=payers" onClick={closeMobileSidebar}>Payers</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'clinics'}
                  >
                    <Link href="/dashboard/admin?section=clinics" onClick={closeMobileSidebar}>Clinics</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'diagnoses'}
                  >
                    <Link href="/dashboard/admin?section=diagnoses" onClick={closeMobileSidebar}>Diagnoses</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'medications'}
                  >
                    <Link href="/dashboard/admin?section=medications" onClick={closeMobileSidebar}>Medications</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'clinical-parameters'}
                  >
                    <Link href="/dashboard/admin?section=clinical-parameters" onClick={closeMobileSidebar}>Clinical Parameters</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
                <SidebarMenuSubItem>
                  <SidebarMenuSubButton
                    asChild
                    isActive={pathname.startsWith('/dashboard/admin') && adminSection === 'users'}
                  >
                    <Link href="/dashboard/admin?section=users" onClick={closeMobileSidebar}>Users &amp; Roles</Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              </SidebarMenuSub>
            </CollapsibleContent>
          </Collapsible>
        </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

export function AppSidebar({ user }: { user: User & { patientId?: number } }) {
  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <AppSidebarNav user={user} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-2 py-1 text-[10px] uppercase tracking-[0.25em] text-sidebar-foreground/60">
          Patient Monitoring
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
