'use client';
import { useState } from 'react';
import type { Patient, Diagnosis } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Edit } from 'lucide-react';

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

export function MedicalInfoSection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  const getDiagnosisDisplay = (patientData: Patient) => {
    if (patientData.diagnoses && patientData.diagnoses.length > 0) {
      return patientData.diagnoses.map(d => `${d.name} (${d.code})`).join(', ');
    }
    return 'No diagnoses recorded';
  };
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
            <Edit className="text-white"/>
          </div>
          <div>
            <CardTitle>Medical Information</CardTitle>
            <p className="text-gray-600 text-sm">Diagnoses and medical history</p>
          </div>
        </div>
        <Button variant="outline" size="icon" onClick={() => onUpdate()}>
          <Edit className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <DetailItem 
          label="Brief Medical History" 
          value={patient.brief_medical_history} 
        />
         <DetailItem 
          label="Diagnoses" 
          value={getDiagnosisDisplay(patient)} 
        />
        {patient.date_of_diagnosis && (
          <DetailItem 
            label="Date of Diagnosis" 
            value={new Date(patient.date_of_diagnosis).toLocaleDateString()} 
          />
        )}
      </CardContent>
    </Card>
  );
}
