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
import { Loader2 } from 'lucide-react';
import { registerPatientByStaff } from '@/lib/actions';

export default function StaffRegisterPatientPage() {
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

    const result = await registerPatientByStaff(formData);

    if (result.success) {
        toast({
            title: 'Patient Registered',
            description: 'The patient record and user account have been created.',
        });
        router.push('/dashboard');
    } else {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: result.error || 'Failed to register patient.',
        });
    }
    
    setLoading(false);
  }

  return (
    <div className="container mx-auto flex justify-center items-start py-8 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-3xl">
        <CardHeader>
          <CardTitle>New Patient Registration</CardTitle>
          <CardDescription>
            Enter the patient's basic information to create their profile and login.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input id="first_name" required value={formData.first_name} onChange={handleInputChange} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="surname">Surname</Label>
                  <Input id="surname" required value={formData.surname} onChange={handleInputChange} />
                </div>
              </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" type="email" required value={formData.email} onChange={handleInputChange} placeholder="For patient login" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" required value={formData.password} onChange={handleInputChange} placeholder="Create a password" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div className="mt-8 flex justify-end gap-4">
              <Button variant="outline" asChild>
                <Link href="/dashboard">Cancel</Link>
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Saving...' : 'Register Patient'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
