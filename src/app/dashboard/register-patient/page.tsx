'use client';

import type React from 'react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardCheck,
  Loader2,
  Shield,
  Stethoscope,
  UserCircle2,
} from 'lucide-react';
import { registerPatientByStaff } from '@/lib/actions';
import type { Diagnosis, Partner, PatientOnboardingPayload } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { fetchDiagnoses, fetchPartners } from '@/lib/api-service';
import { canManageOnboarding } from '@/lib/role-utils';

type Step = 1 | 2 | 3 | 4 | 5;

type SuccessState = {
  patientId: number;
  patientIdentifier: string;
  portalUsername: string;
  temporaryPassword: string;
} | null;

const steps = [
  { id: 1, title: 'Account', description: 'Create the patient portal account and biodata', icon: UserCircle2 },
  { id: 2, title: 'Emergency Contact', description: 'Capture emergency contact details', icon: ClipboardCheck },
  { id: 3, title: 'Medical', description: 'Build the medical profile', icon: Stethoscope },
  { id: 4, title: 'Insurance', description: 'Capture coverage details', icon: Shield },
  { id: 5, title: 'Review', description: 'Confirm and activate the patient', icon: Building2 },
] as const;

export default function StaffRegisterPatientPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [successState, setSuccessState] = useState<SuccessState>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [formData, setFormData] = useState<PatientOnboardingPayload>({
    first_name: '',
    middle_name: '',
    surname: '',
    email: '',
    phone: '',
    dob: '',
    gender: 'Female',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    emergency_contact_relation: '',
    emergency_contact_email: '',
    partner_id: null,
    primary_diagnosis_id: null,
    comorbid_conditions: '',
    current_medications_summary: '',
    allergies_intolerances: '',
    past_medical_history: '',
    surgical_history: '',
    family_history: '',
    social_history: '',
    policy_number: '',
    coverage_limits: '',
    pre_authorization_status: 'Not Required',
  });

  useEffect(() => {
    fetch('/api/auth/session')
      .then(async (res) => {
        if (!res.ok) {
          throw new Error('Unauthorized');
        }

        const data = await res.json();
        if (!canManageOnboarding(data.user?.role)) {
          router.replace('/dashboard');
          setAuthorized(false);
          return;
        }

        setAuthorized(true);
      })
      .catch(() => {
        router.replace('/dashboard');
        setAuthorized(false);
      });
  }, [router]);

  useEffect(() => {
    if (authorized !== true) {
      return;
    }

    Promise.all([fetchPartners(), fetchDiagnoses()])
      .then(([partnerData, diagnosisData]) => {
        setPartners(partnerData);
        setDiagnoses(diagnosisData);
      })
      .catch((error) => {
        console.error(error);
        toast({
          variant: 'destructive',
          title: 'Setup data unavailable',
          description: 'Some partner or diagnosis lists could not be loaded.',
        });
      });
  }, [authorized, toast]);

  if (authorized === false) {
    return null;
  }

  if (authorized === null) {
    return (
      <div className="flex min-h-[320px] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  const reviewItems = [
    { label: 'Patient', value: `${formData.first_name} ${formData.middle_name || ''} ${formData.surname}`.replace(/\s+/g, ' ').trim() },
    { label: 'Email', value: formData.email },
    { label: 'Phone', value: formData.phone },
    { label: 'Assigned Partner', value: partners.find((partner) => partner.id === formData.partner_id)?.name || 'Not assigned' },
    {
      label: 'Primary diagnosis',
      value: diagnoses.find((diagnosis) => diagnosis.id === formData.primary_diagnosis_id)
        ? `${diagnoses.find((diagnosis) => diagnosis.id === formData.primary_diagnosis_id)?.code} - ${diagnoses.find((diagnosis) => diagnosis.id === formData.primary_diagnosis_id)?.name}`
        : 'Not selected',
    },
    { label: 'Coverage Status', value: formData.pre_authorization_status || 'Not Required' },
  ];

  const updateField = (key: keyof PatientOnboardingPayload, value: string | number | null) => {
    setFormData((prev) => ({ ...prev, [key]: value as never }));
  };

  const validateStep = (currentStep: Step) => {
    if (currentStep === 1) {
      return Boolean(formData.first_name && formData.surname && formData.email && formData.phone && formData.dob && formData.gender && formData.partner_id);
    }
    if (currentStep === 2) {
      return Boolean(
        formData.emergency_contact_name &&
          formData.emergency_contact_phone &&
          formData.emergency_contact_relation
      );
    }
    if (currentStep === 3) {
      return Boolean(formData.primary_diagnosis_id && formData.past_medical_history !== undefined);
    }
    if (currentStep === 4) {
      return Boolean(formData.pre_authorization_status);
    }
    return true;
  };

  const handleContinue = () => {
    if (!validateStep(step)) {
      toast({
        variant: 'destructive',
        title: 'Complete this step first',
        description: 'Please fill in the required onboarding fields before moving on.',
      });
      return;
    }

    setStep((prev) => Math.min(5, prev + 1) as Step);
  };

  const handleSubmit = async () => {
    setLoading(true);

    const payload: PatientOnboardingPayload = {
      ...formData,
      current_medications_summary: '',
    };

    const result = await registerPatientByStaff(payload);

    if (result.success && result.patientId && result.patientIdentifier && result.portalUsername && result.temporaryPassword) {
      setSuccessState({
        patientId: result.patientId,
        patientIdentifier: result.patientIdentifier,
        portalUsername: result.portalUsername,
        temporaryPassword: result.temporaryPassword,
      });
      toast({
        title: 'Patient onboarding complete',
        description: 'The account, profile, and portal credentials were generated successfully.',
      });
      setStep(5);
    } else {
      toast({
        variant: 'destructive',
        title: 'Unable to create patient',
        description: result.error || 'The onboarding workflow could not be completed.',
      });
    }

    setLoading(false);
  };

  if (successState) {
    return (
      <div className="mx-auto w-full max-w-5xl space-y-6">
        <Card className="border-primary/20 shadow-sm">
          <CardHeader className="form-header-bar">
            <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <div className="rounded-full bg-white/15 p-3 text-white">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <CardTitle className="text-foreground">Onboarding Completed</CardTitle>
                <CardDescription className="text-muted-foreground">The patient account is active and ready for registry follow-up.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-6 px-4 pt-6 sm:px-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-muted/30 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">Generated Identity</p>
              <div className="mt-4 space-y-3">
                <SummaryRow label="Patient ID" value={successState.patientIdentifier} />
                <SummaryRow label="Portal Username" value={successState.portalUsername} />
                <SummaryRow label="Temporary Password" value={successState.temporaryPassword} />
              </div>
            </div>
            <div className="rounded-2xl border bg-muted/30 p-5">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">Next Actions</p>
              <div className="mt-4 space-y-3 text-sm text-muted-foreground">
                <p>Share the temporary portal credentials with the patient or print them into your intake pack.</p>
                <p>The record is already live in the patient registry and can be opened immediately for follow-up care.</p>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <Button asChild className="w-full sm:w-auto">
                  <Link href="/dashboard/registry">Go to Registry</Link>
                </Button>
                <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push(`/dashboard/patient/${successState.patientId}`)}>
                  Open Patient Record
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <div className="flex items-center justify-start sm:justify-end">
        <div className="flex items-center gap-2 rounded-md border border-border bg-muted/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-muted-foreground shadow-sm">
          <UserCircle2 className="h-3 w-3" /> Step {step} of 5
        </div>
      </div>

      <div className="w-full">
        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden shadow-inner">
          <div className="h-full bg-primary transition-all duration-300" style={{ width: `${(step / 5) * 100}%` }} />
        </div>
      </div>

      <Card className="overflow-hidden border-primary/10 shadow-sm">
        <div className="form-header-bar flex items-center justify-between px-4 py-3 sm:px-6">
          <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
            {steps[step - 1].title}
          </span>
        </div>

        <CardContent className="space-y-8 px-4 pt-6 sm:px-6">
            {step === 1 && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Date of Birth" htmlFor="dob">
                    <Input id="dob" type="date" className="h-8" value={formData.dob} onChange={(e) => updateField('dob', e.target.value)} required />
                  </Field>
                  <Field label="Gender" htmlFor="gender">
                    <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="First Name" htmlFor="first_name">
                    <Input id="first_name" className="h-8" value={formData.first_name} onChange={(e) => updateField('first_name', e.target.value)} required />
                  </Field>
                  <Field label="Middle Name" htmlFor="middle_name">
                    <Input id="middle_name" className="h-8" value={formData.middle_name || ''} onChange={(e) => updateField('middle_name', e.target.value)} />
                  </Field>
                  <Field label="Last Name" htmlFor="surname">
                    <Input id="surname" className="h-8" value={formData.surname} onChange={(e) => updateField('surname', e.target.value)} required />
                  </Field>
                  <Field label="Email Address" htmlFor="email">
                    <Input id="email" type="email" className="h-8" value={formData.email} onChange={(e) => updateField('email', e.target.value)} required />
                  </Field>
                  <Field label="Phone Number" htmlFor="phone">
                    <Input id="phone" className="h-8" value={formData.phone} onChange={(e) => updateField('phone', e.target.value)} required />
                  </Field>
                  <Field label="Partner" htmlFor="partner_id">
                    <Select value={String(formData.partner_id ?? 'none')} onValueChange={(value) => updateField('partner_id', value === 'none' ? null : Number(value))}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select partner</SelectItem>
                        {partners.map((partner) => (
                          <SelectItem key={partner.id} value={String(partner.id)}>{partner.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Emergency Contact Name" htmlFor="emergency_contact_name">
                    <Input
                    id="emergency_contact_name"
                      className="h-8"
                    value={formData.emergency_contact_name}
                    onChange={(e) => updateField('emergency_contact_name', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Emergency Contact Phone" htmlFor="emergency_contact_phone">
                    <Input
                      id="emergency_contact_phone"
                      className="h-8"
                    value={formData.emergency_contact_phone}
                    onChange={(e) => updateField('emergency_contact_phone', e.target.value)}
                    required
                  />
                </Field>
                <Field label="Emergency Contact Relation" htmlFor="emergency_contact_relation">
                  <Select value={formData.emergency_contact_relation} onValueChange={(value) => updateField('emergency_contact_relation', value)}>
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Spouse">Spouse</SelectItem>
                      <SelectItem value="Sibling">Sibling</SelectItem>
                      <SelectItem value="Parent">Parent</SelectItem>
                      <SelectItem value="Friend">Friend</SelectItem>
                      <SelectItem value="Child">Child</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Emergency Contact Email" htmlFor="emergency_contact_email">
                    <Input
                      id="emergency_contact_email"
                      type="email"
                      className="h-8"
                    value={formData.emergency_contact_email || ''}
                    onChange={(e) => updateField('emergency_contact_email', e.target.value)}
                  />
                </Field>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Primary Diagnosis (ICD-10)" htmlFor="primary_diagnosis_id">
                    <Select
                      value={String(formData.primary_diagnosis_id ?? 'none')}
                      onValueChange={(value) => updateField('primary_diagnosis_id', value === 'none' ? null : Number(value))}
                    >
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Select diagnosis</SelectItem>
                        {diagnoses.map((diagnosis) => (
                          <SelectItem key={diagnosis.id} value={String(diagnosis.id)}>
                            {diagnosis.code ? `${diagnosis.code} - ${diagnosis.name}` : diagnosis.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </Field>
                  <Field label="Comorbid Conditions" htmlFor="comorbid_conditions">
                    <Textarea
                      id="comorbid_conditions"
                      className="min-h-16"
                      value={formData.comorbid_conditions || ''}
                      onChange={(e) => updateField('comorbid_conditions', e.target.value)}
                    />
                  </Field>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Allergies & Sensitivities" htmlFor="allergies_intolerances">
                    <Textarea
                      id="allergies_intolerances"
                      className="min-h-16"
                      value={formData.allergies_intolerances || ''}
                      onChange={(e) => updateField('allergies_intolerances', e.target.value)}
                    />
                  </Field>
                  <Field label="Past Medical History" htmlFor="past_medical_history">
                    <Textarea
                      id="past_medical_history"
                      className="min-h-16"
                      value={formData.past_medical_history || ''}
                      onChange={(e) => updateField('past_medical_history', e.target.value)}
                    />
                  </Field>
                  <Field label="Surgical History" htmlFor="surgical_history">
                    <Textarea
                      id="surgical_history"
                      className="min-h-16"
                      value={formData.surgical_history || ''}
                      onChange={(e) => updateField('surgical_history', e.target.value)}
                    />
                  </Field>
                  <Field label="Family History" htmlFor="family_history">
                    <Textarea
                      id="family_history"
                      className="min-h-16"
                      value={formData.family_history || ''}
                      onChange={(e) => updateField('family_history', e.target.value)}
                    />
                  </Field>
                  <Field className="md:col-span-2" label="Social History" htmlFor="social_history">
                    <Textarea
                      id="social_history"
                      className="min-h-16"
                      value={formData.social_history || ''}
                      onChange={(e) => updateField('social_history', e.target.value)}
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-3 md:grid-cols-2">
                <Field label="Policy Number" htmlFor="policy_number">
                  <Input id="policy_number" className="h-8" value={formData.policy_number || ''} onChange={(e) => updateField('policy_number', e.target.value)} />
                </Field>
                <Field className="md:col-span-2" label="Coverage Limits" htmlFor="coverage_limits">
                  <Textarea
                    id="coverage_limits"
                    className="min-h-16"
                    value={formData.coverage_limits || ''}
                    onChange={(e) => updateField('coverage_limits', e.target.value)}
                  />
                </Field>
                <Field label="Pre-Authorization Status" htmlFor="pre_authorization_status">
                  <Select
                    value={formData.pre_authorization_status || 'Not Required'}
                    onValueChange={(value) => updateField('pre_authorization_status', value)}
                  >
                    <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Not Required">Not Required</SelectItem>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="Approved">Approved</SelectItem>
                      <SelectItem value="Denied">Denied</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <div className="rounded-2xl border border-border bg-muted/30 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.24em] text-primary/70">Review Before Activation</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Confirm the onboarding summary below. Submitting will create the patient record, portal account, and generated credentials.
                  </p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {reviewItems.map((item) => (
                    <div key={item.label} className="rounded-xl border p-4">
                      <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">{item.label}</p>
                      <p className="mt-2 font-medium">{item.value || '-'}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:items-center sm:justify-between">
              <Button className="w-full sm:w-auto" variant="outline" onClick={() => setStep((prev) => Math.max(1, prev - 1) as Step)} disabled={step === 1 || loading}>
                <ChevronLeft className="mr-2 h-4 w-4" />
                Back
              </Button>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button variant="outline" className="w-full sm:w-auto" asChild>
                  <Link href="/dashboard/registry">Cancel</Link>
                </Button>

                {step < 5 ? (
                  <Button className="w-full sm:w-auto" onClick={handleContinue}>
                    Continue
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                ) : (
                  <Button className="w-full sm:w-auto" onClick={handleSubmit} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {loading ? 'Creating patient...' : 'Complete onboarding'}
                  </Button>
                )}
              </div>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string;
  htmlFor: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <div className="grid gap-2 sm:grid-cols-[132px_minmax(0,1fr)] sm:items-center sm:gap-3">
        <Label htmlFor={htmlFor} className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground dark:text-white">
          {label}
        </Label>
        <div>{children}</div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-background p-4">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-muted-foreground">{label}</p>
      <p className="mt-2 font-semibold">{value}</p>
    </div>
  );
}
