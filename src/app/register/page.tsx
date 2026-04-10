'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import AuthShell from '@/components/auth/auth-shell';

export default function RegisterPage() {
  return (
    <AuthShell
      title="Account Provisioning Only"
      description="Taria accounts are created by an administrator or during patient onboarding. Public self-registration is disabled."
      headerBadge={
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15 text-white">
          <ShieldCheck className="h-6 w-6" />
        </div>
      }
    >
      <div className="flex justify-center">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Login
          </Link>
        </Button>
      </div>
    </AuthShell>
  );
}
