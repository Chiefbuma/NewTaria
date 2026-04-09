'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Logo from '@/components/logo';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResetUrl(null);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const payload = await res.json();

      if (!res.ok) {
        throw new Error(payload.error || 'Unable to start reset process.');
      }

      setResetUrl(payload.resetUrl ?? null);
      toast({
        title: 'Reset requested',
        description: 'If an account exists for this email, a reset link is now available.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Something went wrong. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex items-center justify-center">
          <Logo className="h-8 w-auto" />
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Forgot Your Password?</CardTitle>
            <CardDescription>
              Enter your email address to request a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-3">
                <InlineField label="Email" htmlFor="email">
                  <Input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                </InlineField>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Request Reset Link'}
                </Button>
              </div>
            </form>

            {resetUrl && (
              <div className="mt-4 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                <p className="font-semibold text-foreground">Development reset link</p>
                <Link href={resetUrl} className="break-all text-primary underline">
                  {resetUrl}
                </Link>
              </div>
            )}

            <div className="mt-4 text-center text-sm">
              <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary">
                <ArrowLeft className="mr-1 h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
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
      <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
        {label}
      </Label>
      <div>{children}</div>
    </div>
  );
}
