'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authenticateUser } from '@/lib/actions';
import AuthShell from '@/components/auth/auth-shell';

export default function LoginPageClient() {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await authenticateUser(phone, password);

    if (!result.success || !result.user) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: result.error || 'Invalid credentials',
      });
      setLoading(false);
      return;
    }

    toast({
      title: 'Success!',
      description: 'Logged in successfully. Redirecting...',
    });

    router.push(result.user.must_change_password ? '/change-password' : searchParams.get('redirect') || '/dashboard');
    router.refresh();
  };

  return (
    <AuthShell
      title="Welcome Back"
      description="Enter your credentials to access your dashboard."
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-3">
          <InlineField label="Phone Number" htmlFor="phone">
            <Input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
            />
          </InlineField>
          <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
            <div className="flex items-center">
              <Label htmlFor="password" className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Password
              </Label>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Link
                  href="/forgot-password"
                  className="ml-auto inline-block text-sm font-medium text-primary underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
          </Button>
        </div>
      </form>
    </AuthShell>
  );
}

function InlineField({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] items-center gap-3">
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
