'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import AuthShell from '@/components/auth/auth-shell';
import Logo from '@/components/logo';

export default function ChangePasswordPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const updateField = (key: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.newPassword.length < 8) {
      toast({ variant: 'destructive', title: 'Error', description: 'New password must be at least 8 characters.' });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({ variant: 'destructive', title: 'Error', description: 'Passwords do not match.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword,
        }),
      });
      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload.error || 'Unable to change password.');
      }

      toast({ title: 'Password updated', description: 'Your password has been changed successfully.' });
      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Change Password"
      description="Update your temporary password before continuing into the app."
      headerBadge={<Logo className="h-11 w-auto" />}
    >
      <form onSubmit={handleSubmit} className="space-y-3">
        <InlineField label="Current" htmlFor="currentPassword">
          <PasswordInput
            id="currentPassword"
            required
            value={formData.currentPassword}
            onChange={(e) => updateField('currentPassword', e.target.value)}
            disabled={loading}
          />
        </InlineField>
        <InlineField label="New Password" htmlFor="newPassword">
          <PasswordInput
            id="newPassword"
            required
            value={formData.newPassword}
            onChange={(e) => updateField('newPassword', e.target.value)}
            disabled={loading}
          />
        </InlineField>
        <InlineField label="Confirm" htmlFor="confirmPassword">
          <PasswordInput
            id="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            disabled={loading}
          />
        </InlineField>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Save New Password'}
        </Button>
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
