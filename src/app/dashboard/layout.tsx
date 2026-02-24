'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Loader2, LayoutDashboard, Users, PanelLeft, Menu, MessageSquare } from 'lucide-react';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import Header from '@/components/header';


const NavLink = ({ href, children, isActive, isCollapsed, title }: { href: string, children: React.ReactNode, isActive: boolean, isCollapsed: boolean, title: string }) => {
    if (isCollapsed) {
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Link
                            href={href}
                            className={cn(
                                "flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:text-primary",
                                isActive && "bg-muted text-primary"
                            )}
                        >
                            {children}
                            <span className="sr-only">{title}</span>
                        </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                        <p>{title}</p>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
    }
    
    return (
        <Link
            href={href}
            className={cn(
                "flex items-center gap-4 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                isActive && "bg-muted text-primary font-semibold"
            )}
        >
            {children}
            <span className={cn("transition-opacity", isCollapsed && "opacity-0")}>{title}</span>
        </Link>
    );
};

function AppSidebarNav({ isCollapsed, user }: { isCollapsed: boolean, user: User }) {
    const pathname = usePathname();
    const isStaff = user.role !== 'user';

    return (
        <nav className={cn(
                "grid items-start gap-2 text-sm font-medium", 
                isCollapsed ? "justify-center px-2" : "bg-background border rounded-lg p-2 mx-4"
            )}>
            {isStaff && (
                <>
                    <NavLink href="/dashboard" isActive={pathname === '/dashboard'} isCollapsed={isCollapsed} title="Dashboard">
                        <LayoutDashboard className="h-5 w-5" />
                    </NavLink>
                    <NavLink href="/dashboard" isActive={pathname.startsWith('/dashboard/patient')} isCollapsed={isCollapsed} title="Patients">
                        <Users className="h-5 w-5" />
                    </NavLink>
                </>
            )}
            <NavLink href="/dashboard/messages" isActive={pathname === '/dashboard/messages'} isCollapsed={isCollapsed} title="Messages">
                <MessageSquare className="h-5 w-5" />
            </NavLink>
            {user.role === 'admin' && (
                <NavLink href="/dashboard" isActive={false} isCollapsed={isCollapsed} title="Settings">
                    <Settings className="h-5 w-5" />
                </NavLink>
            )}
        </nav>
    );
}

function AppSidebar({ isCollapsed, user }: { isCollapsed: boolean, user: User }) {
    return (
        <div className={cn("flex h-full max-h-screen flex-col gap-4")}>
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center font-semibold">
                    <Logo className="h-6 w-auto flex-shrink-0" />
                    <span className={cn(
                        "whitespace-nowrap transition-all duration-300",
                        isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2"
                    )}>
                        Taria Health
                    </span>
                </Link>
            </div>
            <div className="flex-1 py-2 overflow-y-auto overflow-x-hidden">
                <AppSidebarNav isCollapsed={isCollapsed} user={user} />
            </div>
        </div>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<(User & { patientId?: number }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isProgressPage = pathname.includes('/progress');
  
  useEffect(() => {
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
    } else {
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  useEffect(() => {
      if (user?.role === 'user' && (pathname === '/dashboard' || pathname === '/dashboard/patient')) {
          if (user.patientId) {
              router.push(`/dashboard/patient/${user.patientId}/progress`);
          }
      }
  }, [user, pathname, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (isProgressPage || user.role === 'user') {
    return (
        <div className="flex flex-col min-h-screen w-full">
            <header className="flex h-14 shrink-0 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
                <Link href="/dashboard" className="flex items-center font-semibold md:hidden">
                    <Logo className="h-6 w-auto" />
                </Link>
                <div className="w-full flex-1" />
                <Header user={user} />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
                {children}
            </main>
        </div>
    )
  }

  return (
    <div className={cn(
        "grid min-h-screen w-full",
        isSidebarCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]",
        "transition-[grid-template-columns] duration-300 ease-in-out"
    )}>
        <div className="hidden border-r bg-muted/40 md:block">
            <AppSidebar isCollapsed={isSidebarCollapsed} user={user} />
        </div>
      
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button
                        variant="outline"
                        size="icon"
                        className="shrink-0 md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation menu</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0 max-w-[280px]">
                    <AppSidebar isCollapsed={false} user={user} />
                </SheetContent>
            </Sheet>

            <Button variant="ghost" size="icon" className="hidden md:flex" onClick={() => setSidebarCollapsed(!isSidebarCollapsed)}>
                <PanelLeft className={cn("h-5 w-5 transition-transform duration-300", isSidebarCollapsed && "rotate-180")} />
                <span className="sr-only">Toggle sidebar</span>
            </Button>
            
            <div className="w-full flex-1" />
            <Header user={user} />
            </header>
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-background">
            {children}
            </main>
        </div>
    </div>
  );
}
