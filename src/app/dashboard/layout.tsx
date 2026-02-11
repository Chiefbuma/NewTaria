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
import { cn } from '@/lib/utils';

const NavLink = ({ href, children, isActive }: { href: string, children: React.ReactNode, isActive: boolean }) => (
    <Link
        href={href}
        className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
            isActive && "bg-muted text-primary"
        )}
    >
        {children}
    </Link>
);


function AppSidebar() {
    const pathname = usePathname();
    
    const dashboardPath = '/dashboard';
    const patientsPath = '/dashboard'; 
    const settingsPath = '/dashboard';

    return (
        <div className="hidden border-r bg-muted/40 md:block">
            <div className="flex h-full max-h-screen flex-col gap-2">
                <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                    <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                        <Logo className="h-6 w-auto" />
                        <span className="">Taria Health</span>
                    </Link>
                </div>
                <div className="flex-1">
                    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                        <NavLink href={dashboardPath} isActive={pathname === dashboardPath}>
                            <LayoutDashboard className="h-4 w-4" />
                            Dashboard
                        </NavLink>
                        <NavLink href={patientsPath} isActive={pathname.startsWith('/patient')}>
                            <Users className="h-4 w-4" />
                            Patients
                        </NavLink>
                         <NavLink href={settingsPath} isActive={pathname === settingsPath}>
                            <Settings className="h-4 w-4" />
                            Settings
                        </NavLink>
                    </nav>
                </div>
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
     <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <AppSidebar />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
