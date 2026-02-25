export type User = {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'navigator' | 'clinician' | 'user' | 'partner';
  avatarUrl?: string;
  partner_id?: number | null; 
  deleted_at?: string | null;
};

export type Corporate = {
  id: number;
  name: string;
  wellness_date: string;
  deleted_at?: string | null;
};

export type Partner = {
  id: number;
  name: string;
  deleted_at?: string | null;
};

export type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
    sender_name?: string;
    deleted_at?: string | null;
};

export type ClinicalParameter = {
    id: number;
    name: string;
    type: 'numeric' | 'text' | 'choice';
    unit: string | null;
    options: string[] | null;
    category: 'vital_sign' | 'lab_result' | 'clinical_measurement' | 'symptom' | 'assessment';
    deleted_at?: string | null;
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
    deleted_at?: string | null;
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
  deleted_at?: string | null;
};

export type Diagnosis = {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  deleted_at?: string | null;
};

export type Medication = {
  id: number;
  name: string;
  dosage: string;
  deleted_at?: string | null;
};

export type Prescription = {
  id: number;
  patient_id: number;
  medication_id: number;
  medication?: Medication; 
  dosage: string;
  frequency: string;
  start_date: string;
  expiry_date: string | null;
  notes: string | null;
  status: 'active' | 'completed' | 'discontinued';
  deleted_at?: string | null;
};

export type Appointment = {
  id: number;
  patient_id: number;
  clinician_id: number;
  clinician?: User; 
  title: string;
  appointment_date: string;
  end_date: string | null;
  description: string | null;
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show' | 'rescheduled';
  cancellation_reason: string | null;
  deleted_at?: string | null;
};

export type Review = {
    id: number;
    patient_id: number;
    reviewed_by_id: number;
    reviewed_by?: string; 
    review_date: string;
    subjective_findings: string | null;
    objective_findings: string | null;
    assessment: string;
    plan: string;
    recommendations: string | null;
    follow_up_date: string | null;
    deleted_at?: string | null;
};


export type Patient = {
  id: number;
  user_id: number | null;
  first_name: string;
  surname: string | null;
  age: number | null;
  gender: 'Male' | 'Female' | null;
  email: string | null;
  diagnosis: string | null;
  created_at: string;
  status: 'Active' | 'Pending' | 'Critical' | 'Discharged' | 'In Review';
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
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  phone: string | null;
  dob: string | null;
  middle_name?: string | null;
  wellness_date: string;
  corporate_id: number | null;
  partner_id: number | null; 
  date_of_diagnosis: string | null;
  deleted_at?: string | null;
  corporate_name?: string;
  navigator_name?: string;
  partner_name?: string;
  assessments: Assessment[];
  goals: Goal[];
  prescriptions: Prescription[];
  appointments: Appointment[];
  reviews: Review[];
  vitals?: any[];
  nutrition?: any[];
  clinicals?: any[];
  stats?: {
    totalGoals: number;
    activeGoals: number;
    totalAssessments: number;
    assessmentCoverage: number;
    needsAttention: boolean;
  };
};
