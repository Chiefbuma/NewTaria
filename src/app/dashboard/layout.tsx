'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Header from '@/components/header';
import Link from 'next/link';
import { Settings, Loader2, LayoutDashboard, Users } from 'lucide-react';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import { placeholderImages } from '@/lib/placeholder-images';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';


function AppSidebar() {
    const pathname = usePathname();
    const { openMobile, setOpenMobile } = useSidebar();
    
    const closeSidebar = () => {
        if(openMobile) setOpenMobile(false);
    }
    
    // For now, all links point to dashboard as other pages don't exist yet
    const dashboardPath = '/dashboard';
    const patientsPath = '/dashboard'; 
    const settingsPath = '/dashboard';

    return (
        <Sidebar>
            <SidebarHeader>
                <Link href="/dashboard" className="flex items-center gap-2" onClick={closeSidebar}>
                    <Logo className="h-7 w-auto" />
                </Link>
            </SidebarHeader>
            <SidebarContent>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === dashboardPath} tooltip="Dashboard" onClick={closeSidebar}>
                            <Link href={dashboardPath}>
                                <LayoutDashboard />
                                <span>Dashboard</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                     <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname.startsWith('/patient')} tooltip="Patients" onClick={closeSidebar}>
                            <Link href={patientsPath}>
                                <Users />
                                <span>Patients</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild isActive={pathname === settingsPath} tooltip="Settings" onClick={closeSidebar}>
                            <Link href={settingsPath}>
                                <Settings />
                                <span>Settings</span>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarContent>
        </Sidebar>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      const userForState: User = {
        ...parsedUser,
        avatarUrl: parsedUser.avatarUrl || placeholderImages.find(p => p.id === 'user-avatar')?.imageUrl,
      };
      setUser(userForState);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SidebarProvider>
        <AppSidebar />
        <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    </div>
                    <div className="flex items-center gap-4">
                    <Header user={user} />
                    </div>
                </div>
            </header>
            <main className="flex-1">
                <div className="mx-auto max-w-7xl py-8 px-4 sm:px-6 lg:px-8">
                    {children}
                </div>
            </main>
        </div>
    </SidebarProvider>
  );
}
