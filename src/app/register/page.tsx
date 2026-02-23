'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowLeft } from 'lucide-react';
import Logo from '@/components/logo';
import { registerUser } from '@/lib/actions';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    first_name: '',
    surname: '',
    email: '',
    password: '',
    age: '',
    gender: '',
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const result = await registerUser(formData);

    if (result.success) {
        toast({
            title: 'Account Created!',
            description: 'Your account has been created successfully. You can now login.',
        });
        router.push('/');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Failed to create account.',
        });
    }
    
    setLoading(false);
  }

  return (
    <div className="w-full min-h-screen flex items-center justify-center p-4 bg-muted/40">
        <div className="w-full max-w-md">
            <div className="flex justify-center items-center mb-6">
                <Logo className="h-8 w-auto" />
            </div>
             <Card>
                <CardHeader className="text-center">
                    <CardTitle>Create Your Account</CardTitle>
                    <CardDescription>
                        Sign up to begin your journey with Taria Health.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                <form onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div className="grid gap-2">
                            <Label htmlFor="first_name">First Name</Label>
                            <Input id="first_name" required value={formData.first_name} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="surname">Surname</Label>
                            <Input id="surname" required value={formData.surname} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email Address</Label>
                            <Input id="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="Your login email" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <Input id="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="Create a password" />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="age">Age</Label>
                            <Input id="age" type="number" required value={formData.age} onChange={handleInputChange} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="gender">Gender</Label>
                            <Select name="gender" onValueChange={(value) => handleSelectChange('gender', value)} required>
                                <SelectTrigger id="gender"><SelectValue placeholder="Select gender" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Male">Male</SelectItem>
                                    <SelectItem value="Female">Female</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <Link href="/" className="inline-flex items-center text-muted-foreground hover:text-primary text-sm">
                            <ArrowLeft className="mr-1 h-4 w-4" />
                            Back to Login
                        </Link>
                        <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </Button>
                    </div>
                </form>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
