export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'physician' | 'navigator' | 'payer' | 'patient';
  avatarUrl?: string;
};

export type Corporate = {
  id: number;
  name: string;
  wellness_date: string;
};

export type Payer = {
  id: number;
  name: string;
};

export type ClinicalParameter = {
    id: number;
    name: string;
    type: 'numeric' | 'text' | 'choice';
    unit: string | null;
    options: string[] | null;
    category: 'vital_sign' | 'lab_result' | 'clinical_measurement' | 'symptom' | 'assessment';
};

export type Assessment = {
    id: number;
    patient_id: number;
    clinical_parameter_id: number;
    value: string;
    notes: string | null;
    is_normal: boolean | null;
    created_at: string;
    measured_at: string;
};

export type Goal = {
  id: number;
  patient_id: number;
  clinical_parameter_id: number;
  target_value: string;
  target_operator: '<' | '<=' | '=' | '>=' | '>';
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  deadline: string;
  created_at: string;
  current_value?: string;
  is_overdue?: boolean;
};

export type Diagnosis = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
};

export type Medication = {
  id: number;
  name: string;
  dosage: string;
};

export type Prescription = {
  id: number;
  patient_id: number;
  medication_id: number;
  medication?: Medication; // joined
  dosage: string;
  frequency: string;
  start_date: string;
  expiry_date: string | null;
  notes: string | null;
  status: 'active' | 'completed' | 'discontinued';
};

export type Appointment = {
  id: number;
  patient_id: number;
  clinician_id: number;
  clinician?: User; // joined
  title: string;
  appointment_date: string;
  end_date: string | null;
  description: string | null;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  cancellation_reason: string | null;
};

export type Review = {
    id: number;
    patient_id: number;
    reviewed_by_id: number;
    reviewed_by?: string; // joined name
    review_date: string;
    subjective_findings: string | null;
    objective_findings: string | null;
    assessment: string;
    plan: string;
    recommendations: string | null;
    follow_up_date: string | null;
};


export type Patient = {
  id: number;
  user_id: number | null;
  // Core Info from Registration
  first_name: string;
  surname: string | null;
  age: number | null;
  sex: 'Male' | 'Female' | 'Other' | null;
  email: string | null; // For login & contact
  diagnosis: string | null;
  created_at: string;

  // Status & System Fields
  status: 'Active' | 'Pending' | 'Critical' | 'Discharged' | 'In Review';

  // Onboarding Data
  emr_number: string | null;
  date_of_onboarding: string | null;
  navigator_id: number | null;
  consent_date: string | null;
  brief_medical_history: string | null;
  years_since_diagnosis: number | null;
  past_medical_interventions: string | null;
  relevant_family_history: string | null;
  has_weighing_scale: boolean;
  has_glucometer: boolean;
  has_bp_machine: boolean;
  has_tape_measure: boolean;
  dietary_restrictions: string | null;
  allergies_intolerances: string | null;
  lifestyle_factors: string | null;
  physical_limitations: string | null;
  psychosocial_factors: string | null;

  // Emergency Contact
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;

  // Other Misc Fields
  phone: string | null;
  dob: string | null;
  middle_name?: string | null;
  wellness_date: string; // Linked to corporate
  corporate_id: number | null;
  payer_id: number | null;
  date_of_diagnosis: string | null; // Can be different from registration diagnosis date
  
  // Joined/related data (from data.ts)
  corporate_name?: string;
  navigator_name?: string;
  payer_name?: string;
  assessments: Assessment[];
  goals: Goal[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  reviews: Review[];
  vitals?: any[];
  nutrition?: any[];
  clinicals?: any[];
};
