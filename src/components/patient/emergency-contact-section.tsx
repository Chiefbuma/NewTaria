'use client';
import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone } from 'lucide-react';

const DetailItem = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="font-semibold text-foreground break-words">{value || 'N/A'}</p>
    </div>
);

export function EmergencyContactSection({ patient, onUpdate }: { patient: Patient; onUpdate: () => void }) {
  if (!patient.emergency_contact_name && !patient.emergency_contact_phone) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <Phone className="text-white"/>
            </div>
          <div>
            <CardTitle>Emergency Contact</CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Contact Name" value={patient.emergency_contact_name} />
        <DetailItem label="Contact Phone" value={patient.emergency_contact_phone} />
        <DetailItem label="Relationship" value={patient.emergency_contact_relation} />
      </CardContent>
    </Card>
  );
}
