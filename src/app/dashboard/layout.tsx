'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Settings, Loader2 } from 'lucide-react';
import type { User } from '@/lib/types';
import Logo from '@/components/logo';
import { placeholderImages } from '@/lib/placeholder-images';

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
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-background">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-2">
            <Logo className="h-7 w-auto" />
          </Link>
          <div className="flex items-center gap-4">
            <Header user={user} />
          </div>
        </div>
      </header>
      <main className="flex-1">
        <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
            {children}
        </div>
      </main>
    </div>
  );
}
