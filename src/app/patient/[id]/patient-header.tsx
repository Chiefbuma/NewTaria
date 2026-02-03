'use client';
import { Patient } from '@/lib/types';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, User, Phone, Mail, Building, Briefcase } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';

const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" } = {
  Active: 'default',
  Pending: 'secondary',
  Critical: 'destructive',
  'In Review': 'secondary',
  Discharged: 'secondary'
}

const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined | null }) => {
    if (!value) return null;
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon className="h-4 w-4" />
            <span>{label}: <span className="font-semibold text-foreground">{value}</span></span>
        </div>
    );
};

export default function PatientHeader({ patient }: { patient: Patient }) {
    const name = `${patient.first_name} ${patient.surname || ''}`;
    const fallback = `${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`;

    return (
        <div className="space-y-6">
            <div>
                <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
            </div>
            <div className="flex flex-col md:flex-row gap-6">
                 <Avatar className="h-24 w-24 border">
                    {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={name} />}
                    <AvatarFallback className="text-3xl">{fallback}</AvatarFallback>
                </Avatar>
                <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-4">
                        <h1 className="text-3xl font-bold font-headline tracking-tight">{name}</h1>
                        <Badge variant={statusVariant[patient.status]} className={cn('text-base', patient.status === 'Active' && 'bg-green-500/20 text-green-700 dark:bg-green-500/10 dark:text-green-400 border-green-500/30')}>
                            {patient.status}
                        </Badge>
                    </div>
                     <p className="text-muted-foreground">
                        Patient since {new Date(patient.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        &nbsp;({formatDistanceToNow(new Date(patient.created_at), { addSuffix: true })})
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-4 gap-y-1 pt-2">
                        <DetailItem icon={User} label="Age/Sex" value={`${patient.age || 'N/A'} / ${patient.sex || 'N/A'}`} />
                        <DetailItem icon={Phone} label="Phone" value={patient.phone} />
                        <DetailItem icon={Mail} label="Email" value={patient.email} />
                        <DetailItem icon={Building} label="Corporate" value={patient.corporate_name} />
                        <DetailItem icon={Briefcase} label="Navigator" value={patient.navigator_name} />
                    </div>
                </div>
            </div>
        </div>
    );
}
