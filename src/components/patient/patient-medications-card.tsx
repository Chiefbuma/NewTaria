'use client';

import type { Patient } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Pill } from 'lucide-react';

function formatExpiry(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString();
}

export default function PatientMedicationsCard({ patient }: { patient: Patient }) {
  const prescriptions = (patient.prescriptions || []).filter((p) => p.deleted_at == null);

  return (
    <Card className="overflow-hidden border-border/60 bg-card shadow-[0_20px_45px_-34px_rgba(15,23,42,0.18)]">
      <CardHeader className="bg-muted/30">
        <CardTitle className="flex items-center gap-2 text-base">
          <Pill className="h-4 w-4 text-primary" />
          Medications
        </CardTitle>
        <CardDescription className="text-xs">Your current prescriptions.</CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        {prescriptions.length ? (
          <div className="space-y-2">
            {prescriptions.slice(0, 6).map((p) => {
              const name = p.medication?.name || 'Medication';
              const exp = formatExpiry(p.expiry_date);
              return (
                <div key={p.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                  <p className="text-sm font-semibold text-foreground">{name}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{p.dosage}</span>
                    {exp ? ` • Exp: ${exp}` : ''}
                  </p>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="py-4 text-center text-sm text-muted-foreground">No medications recorded.</p>
        )}
      </CardContent>
    </Card>
  );
}

