'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sora } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PasswordInput } from '@/components/ui/password-input';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import { authenticateUser } from '@/lib/actions';
import AuthShell from '@/components/auth/auth-shell';
import { cn } from '@/lib/utils';

const authFont = Sora({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

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
      headerTone="primary"
      cardClassName={cn(authFont.className)}
    >
      <motion.form
        onSubmit={handleSubmit}
        className="space-y-5"
        variants={{
          hidden: { opacity: 0, y: 10 },
          show: {
            opacity: 1,
            y: 0,
            transition: { staggerChildren: 0.08, delayChildren: 0.05 },
          },
        }}
        initial="hidden"
        animate="show"
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <Label htmlFor="phone" className="mb-1.5 block text-xs font-semibold text-muted-foreground">
            Phone Number
          </Label>
          <Input
            id="phone"
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={loading}
            className="w-full"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
              Password
            </Label>
            <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
          <PasswordInput
            id="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            className="mt-1 w-full"
          />
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Sign In'}
          </Button>
        </motion.div>
      </motion.form>
    </AuthShell>
  );
}
