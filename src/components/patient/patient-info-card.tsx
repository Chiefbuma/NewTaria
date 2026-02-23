'use client';

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User as UserIcon, Cake, Phone, Mail, Binary, CalendarDays } from 'lucide-react';
import { placeholderImages } from '@/lib/placeholder-images';

const DetailItem = ({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ElementType;
}) => (
  <div className="flex items-start gap-4">
    {Icon && (
      <div className="bg-muted/50 rounded-full p-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
    )}
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
        {label}
      </p>
      <p className="font-semibold text-foreground break-words">{value || '-'}</p>
    </div>
  </div>
);

export default function PatientInfoCard({ patient }: { patient: Patient }) {
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  return (
    <Card>
      <CardHeader className="flex flex-col items-center text-center gap-4">
        <Avatar className="w-24 h-24 border-4 border-background shadow-md">
          {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={`${patient.first_name} ${patient.surname || ''}`} />}
          <AvatarFallback className="text-3xl">{`${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`}</AvatarFallback>
        </Avatar>
        <div className="grid gap-1">
          <CardTitle className="text-2xl">{`${patient.first_name} ${patient.surname || ''}`}</CardTitle>
          <CardDescription>Patient ID: {patient.id}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <Separator />
        <div className="grid grid-cols-1 gap-4 pt-4">
          <DetailItem
            icon={UserIcon}
            label="Full Name"
            value={`${patient.first_name} ${patient.middle_name || ''} ${patient.surname || ''}`}
          />
          <DetailItem icon={Cake} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
          <DetailItem icon={CalendarDays} label="Wellness Date" value={patient.wellness_date ? new Date(patient.wellness_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '-'} />
          <DetailItem icon={Binary} label="Age / Sex" value={`${patient.age} / ${patient.sex}`} />
          <DetailItem icon={Phone} label="Phone" value={patient.phone} />
          <DetailItem icon={Mail} label="Email" value={patient.email} />
        </div>
      </CardContent>
    </Card>
  );
}
