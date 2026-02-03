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
  end_date: string | null;
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
  date_of_diagnosis: string | null;
  
  // Joined/related data
  corporate_name?: string;
  navigator_name?: string;
  assessments: Assessment[];
  goals: Goal[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  reviews: Review[];
};
