'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Settings, Loader2, LayoutDashboard, Users, PanelLeft, Menu } from 'lucide-react';
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

function AppSidebarNav({ isCollapsed }: { isCollapsed: boolean }) {
    const pathname = usePathname();
    const dashboardPath = '/dashboard';
    // Both patients and settings link to dashboard for now, as per original code
    const patientsPath = '/dashboard'; 
    const settingsPath = '/dashboard';

    return (
        <nav className={cn(
                "grid items-start gap-2 text-sm font-medium", 
                isCollapsed ? "justify-center px-2" : "bg-background border rounded-lg p-2 mx-4"
            )}>
            <NavLink href={dashboardPath} isActive={pathname === dashboardPath} isCollapsed={isCollapsed} title="Dashboard">
                <LayoutDashboard className="h-5 w-5" />
            </NavLink>
            <NavLink href={patientsPath} isActive={pathname.startsWith('/dashboard/patient')} isCollapsed={isCollapsed} title="Patients">
                <Users className="h-5 w-5" />
            </NavLink>
            <NavLink href={settingsPath} isActive={pathname === settingsPath && false /* logic to be defined */} isCollapsed={isCollapsed} title="Settings">
                <Settings className="h-5 w-5" />
            </NavLink>
        </nav>
    );
}

function AppSidebar({ isCollapsed }: { isCollapsed: boolean }) {
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
                <AppSidebarNav isCollapsed={isCollapsed} />
            </div>
        </div>
    )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(true);
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
    <div className={cn(
        "grid min-h-screen w-full",
        isSidebarCollapsed ? "md:grid-cols-[80px_1fr]" : "md:grid-cols-[280px_1fr]",
        "transition-[grid-template-columns] duration-300 ease-in-out"
    )}>
        {/* Desktop Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
            <AppSidebar isCollapsed={isSidebarCollapsed} />
        </div>
      
        <div className="flex flex-col">
            <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            {/* Mobile Sidebar Trigger */}
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
                    <AppSidebar isCollapsed={false} />
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar Toggle */}
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
