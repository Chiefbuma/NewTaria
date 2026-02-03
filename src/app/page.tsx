'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import Logo from '@/components/logo';
import { users } from '@/lib/mock-data';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@taria.com');
  const [password, setPassword] = useState('password');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulate a network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const user = users.find(u => u.email === email);

    // In a real app, you'd compare a hashed password.
    // For this mock setup, we'll use a simple plain text password.
    if (!user || password !== 'password') {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Invalid credentials',
      });
      setLoading(false);
      return;
    }

    localStorage.setItem('loggedInUser', JSON.stringify(user));
    
    toast({
      title: 'Success!',
      description: 'Logged in successfully. Redirecting...',
    });

    router.push('/dashboard');
    // No finally block needed, as redirection will unmount the component
  };
  
  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
       <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <Logo className="h-8 w-auto" />
            </div>
            <Card>
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">Welcome Back</CardTitle>
                    <CardDescription>
                        Enter your credentials to access your dashboard.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <div className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                            id="email"
                            type="email"
                            placeholder="name@example.com"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={loading}
                            />
                        </div>
                        <div className="grid gap-2">
                            <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <Link
                                href="/forgot-password"
                                className="ml-auto inline-block text-sm underline"
                            >
                                Forgot password?
                            </Link>
                            </div>
                            <Input 
                            id="password" 
                            type="password" 
                            required 
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={loading}
                            />
                        </div>
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Login'}
                        </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
