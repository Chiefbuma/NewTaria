export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'physician' | 'navigator' | 'payer';
  avatarUrl?: string;
};

export type Corporate = {
  id: number;
  name: string;
  wellness_date: string;
};

export type Vital = {
  id: number;
  patient_id: number;
  bp_systolic: string;
  bp_diastolic: string;
  pulse: string;
  temp: string;
  rbs: string;
  created_at: string;
};

export type Nutrition = {
  id: number;
  patient_id: number;
  height: string;
  weight: string;
  bmi: string;
  visceral_fat: string;
  body_fat_percent: string;
  notes_nutritionist: string | null;
  created_at: string;
};

export type Goal = {
  id: number;
  patient_id: number;
  discussion: string;
  goal: string;
  created_at: string;
};

export type Clinical = {
  id: number;
  patient_id: number;
  notes_doctor: string | null;
  notes_psychologist: string | null;
  created_at: string;
};

export type ClinicalParameter = {
    id: number;
    name: string;
    type: 'numeric' | 'text' | 'choice';
    unit: string | null;
    options: string[] | null;
}

export type Assessment = {
    id: number;
    patient_id: number;
    clinical_parameter_id: number;
    value: string;
    notes: string | null;
    created_at: string;
    measured_at: string;
    is_normal: boolean | null;
}

export type PatientStats = {
  totalGoals: number;
  activeGoals: number;
  totalAssessments: number;
  assessmentCoverage: number;
  needsAttention: boolean;
};

export type Patient = {
  id: number;
  first_name: string;
  middle_name: string | null;
  surname: string | null;
  dob: string | null;
  age: number | null;
  sex: 'Male' | 'Female' | 'Other' | null;
  phone: string | null;
  email: string | null;
  wellness_date: string;
  corporate_id: number | null;
  status: 'Active' | 'Pending' | 'Critical' | 'Discharged' | 'In Review';
  created_at: string;
  date_of_onboarding: string | null;
  has_glucometer: boolean;
  has_bp_machine: boolean;
  has_tape_measure: boolean;
  brief_medical_history: string | null;
  years_since_diagnosis: number | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  consent_date: string | null;
  navigator_id: number | null;
  // Joined/related data
  corporate_name?: string;
  navigator_name?: string;
  stats?: PatientStats;
  vitals?: Vital[];
  nutrition?: Nutrition[];
  goals?: Goal[];
  clinicals?: Clinical[];
};
