'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Stethoscope, UserCheck } from 'lucide-react';

export function PatientTimeline({ patient }: { patient: Patient }) {
    const formatDate = (dateString: string | null | undefined) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Patient Timeline
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <Check className="h-4 w-4 text-white" />
            </div>
            <div>
                <p className="font-medium text-gray-900">Patient Onboarded</p>
                <p className="text-sm text-gray-600">
                    {formatDate(patient.date_of_onboarding)}
                </p>
            </div>
        </div>
        
        {patient.date_of_diagnosis && (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <Stethoscope className="h-4 w-4 text-white" />
                </div>
                <div>
                    <p className="font-medium text-gray-900">Initial Diagnosis</p>
                    <p className="text-sm text-gray-600">
                        {formatDate(patient.date_of_diagnosis)}
                    </p>
                </div>
            </div>
        )}
        
        <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <UserCheck className="h-4 w-4 text-white" />
            </div>
            <div>
                <p className="font-medium text-gray-900">Current Status</p>
                <p className="text-sm text-gray-600 capitalize">
                    {patient.status}
                </p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
