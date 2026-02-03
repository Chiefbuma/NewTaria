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
    bp_systolic: number;
    bp_diastolic: number;
    pulse: number;
    temp: number;
    rbs: string;
    created_at: string;
}

export type Nutrition = {
    id: number;
    patient_id: number;
    height: number;
    weight: number;
    bmi: number;
    visceral_fat: number;
    body_fat_percent: number;
    notes_nutritionist: string | null;
    created_at: string;
}

export type Goal = {
    id: number;
    patient_id: number;
    discussion: string;
    goal: string;
    created_at: string;
}

export type Clinical = {
    id: number;
    patient_id: number;
    notes_doctor: string | null;
    notes_psychologist: string | null;
    created_at: string;
}

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
  vitals?: Vital[];
  nutrition?: Nutrition[];
  goals?: Goal[];
  clinicals?: Clinical[];
};
