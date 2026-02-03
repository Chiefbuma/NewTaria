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
  assessments?: Assessment[];
  goals?: Goal[];
};

export type ClinicalParameter = {
  id: number;
  name: string;
  type: 'numeric' | 'text' | 'choice';
  unit: string | null;
  options: string[] | null; // from JSON
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
  // Joined data
  parameter?: Partial<ClinicalParameter>;
};

export type Goal = {
  id: number;
  patient_id: number;
  clinical_parameter_id: number;
  target_value: string;
  target_operator: string;
  status: 'active' | 'completed' | 'cancelled';
  notes: string | null;
  deadline: string;
  created_at: string;
  // Joined data
  parameter?: Partial<ClinicalParameter>;
};
