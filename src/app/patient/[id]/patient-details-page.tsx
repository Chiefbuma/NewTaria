'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Patient, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, Edit, RefreshCw, User as UserIcon, CalendarDays } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { placeholderImages } from '@/lib/placeholder-images';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

import MedicalInfoSection from '@/components/patient/medical-info-section';
import EmergencyContactSection from '@/components/patient/emergency-contact-section';
import MedicationUseSection from '@/components/patient/medication-use-section';
import GoalsSettingSection from '@/components/patient/goals-setting-section';
import ClinicalAssessments from '@/components/patient/clinical-assessments-section';
import AssessmentHistorySection from '@/components/patient/assessment-history-section';
import UpcomingAppointmentsSection from '@/components/patient/upcoming-appointments-section';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"


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

export default function PatientDetailsPage({ initialPatient }: { initialPatient: Patient }) {
  const { toast } = useToast();

  const [patient, setPatient] = useState<Patient>(initialPatient);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const handleUpdate = useCallback(() => {
      // In a real app, this would re-fetch data.
      // For mock data, we just re-set the state to trigger a re-render.
      setPatient(prev => ({...prev}));
      toast({ title: "Data Synced", description: "Patient data has been updated locally." });
  }, [toast]);

  const getStatusDisplayName = (status: Patient['status']) => {
    const statusMap = {
      Active: 'Active',
      Pending: 'Pending',
      Critical: 'Critical',
      Discharged: 'Discharged',
      'In Review': 'In Review'
    };
    return statusMap[status] || status;
  };
  
  const handleStatusUpdate = (newStatus: Patient['status']) => {
    setPatient(prev => ({ ...prev, status: newStatus }));
    toast({ title: 'Status Updated', description: `Patient status set to ${newStatus}` });
  };
  
  const patientAvatar = placeholderImages.find(p => p.id === 'patient-avatar');

  if (!isClient) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <Button asChild variant="outline">
              <Link href="/dashboard" className="inline-flex items-center gap-2">
                <ArrowLeft />
                Back to Patients
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline"><Edit className="mr-2"/> Edit Patient</Button>
              <Button onClick={handleUpdate}><RefreshCw className="mr-2"/> Refresh Data</Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">{getStatusDisplayName(patient.status)}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => handleStatusUpdate('Active')}>Set as Active</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate('Pending')}>Set as Pending</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate('Critical')}>Set as Critical</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate('Discharged')}>Set as Discharged</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusUpdate('In Review')}>Set as In Review</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="bg-gradient-to-r from-white to-blue-50/50 rounded-2xl p-8 shadow-xl border border-blue-200/40">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-6">
                <div className="flex items-center gap-6">
                    <Avatar className="w-20 h-20 border-4 border-background shadow-md">
                        {patientAvatar && <AvatarImage src={patientAvatar.imageUrl} alt={`${patient.first_name} ${patient.surname || ''}`} />}
                        <AvatarFallback className="text-3xl">{`${patient.first_name[0]}${patient.surname ? patient.surname[0] : ''}`}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {patient.first_name} {patient.middle_name || ''} {patient.surname}
                        </h1>
                        <p className="text-lg text-gray-600 font-mono">Patient ID: {patient.id}</p>
                    </div>
                </div>
                <Badge className={cn('text-base', patient.status === 'Critical' && 'bg-red-500 text-white')}>{getStatusDisplayName(patient.status)}</Badge>
            </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-200/60">
                <DetailItem icon={UserIcon} label="Date of Birth" value={patient.dob ? new Date(patient.dob).toLocaleDateString() : 'N/A'} />
                <DetailItem icon={UserIcon} label="Age" value={patient.age?.toString()} />
                <DetailItem icon={CalendarDays} label="Onboarding Date" value={patient.date_of_onboarding ? new Date(patient.date_of_onboarding).toLocaleDateString() : 'N/A'} />
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <MedicalInfoSection patient={patient} onUpdate={handleUpdate} />
            <EmergencyContactSection patient={patient} onUpdate={handleUpdate} />
            <MedicationUseSection patient={patient} onUpdate={handleUpdate} />
            <GoalsSettingSection patient={patient} onUpdate={handleUpdate} />
            <ClinicalAssessments patient={patient} onUpdate={handleUpdate} />
          </div>

          <div className="space-y-8">
            <AssessmentHistorySection patient={patient} onUpdate={handleUpdate} />
            <UpcomingAppointmentsSection patient={patient} onUpdate={handleUpdate} />
          </div>
        </div>
      </div>
    </div>
  );
}
