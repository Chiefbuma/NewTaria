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
      title="Login to Your Account"
      description="Enter your phone number and password to sign in."
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <Label htmlFor="phone" className="mb-2 block text-sm font-medium text-gray-700">Phone Number</Label>
          <Input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            placeholder="e.g. +1 123 456 7890"
            className="w-full"
          />
        </div>
        
        <div>
            <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
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
                placeholder="Enter your password"
                className="mt-1 w-full"
            />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
        </Button>
      </form>
    </AuthShell>
  );
}
