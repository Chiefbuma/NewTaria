export type PartnerType = 'insurance' | 'clinic' | 'hospital' | 'specialist' | 'corporate';

export type UserRole =
  | 'admin'
  | 'staff'
  | 'physician'
  | 'clinician'
  | 'navigator'
  | 'payer'
  | 'partner'
  | 'user'
  | 'patient';

export type User = {
  id: number;
  name: string;
  phone?: string | null;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  partner_id?: number | null;
  partner_name?: string | null;
  partner_type?: PartnerType | null;
  partner_clinic_id?: number | null;
  must_change_password?: boolean;
  password_changed_at?: string | null;
  failed_login_attempts?: number;
  locked_until?: string | null;
  last_login_at?: string | null;
  deleted_at?: string | null;
};

export type PasswordResetToken = {
  id: number;
  user_id: number;
  token_hash: string;
  expires_at: string;
  used_at?: string | null;
  created_at: string;
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
  partner_type?: PartnerType | null;
  clinic_id?: number | null;
  clinic_name?: string | null;
  deleted_at?: string | null;
};

// Backwards-compatible alias used by some legacy UI/components.
export type Payer = Partner;

export type Clinic = {
  id: number;
  name: string;
  location: string | null;
  deleted_at?: string | null;
};

export type Message = {
    id: number;
    sender_id: number;
    receiver_id: number;
    content: string;
    created_at: string;
    sender_name?: string;
    sender_avatar?: string;
    deleted_at?: string | null;
};

export type ClinicalParameter = {
    id: number;
    name: string;
    type: 'numeric' | 'text' | 'choice' | 'image' | 'voice';
    unit: string | null;
    options: string[] | null;
    category: 'vital_sign' | 'lab_result' | 'clinical_measurement' | 'symptom' | 'assessment';
    allow_self_monitoring?: boolean;
    deleted_at?: string | null;
};

export type Assessment = {
    id: number;
    patient_id: number;
    clinical_parameter_id: number;
    created_by_user_id?: number | null;
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
  // Legacy fields used by the PDF report component.
  discussion?: string | null;
  goal?: string | null;
  deadline: string;
  created_at: string;
  current_value?: string;
  is_overdue?: boolean;
  deleted_at?: string | null;
};

// Legacy report types (used by the wellness report/PDF renderer).
export type Vital = {
  id: number;
  patient_id: number;
  bp_systolic?: number | null;
  bp_diastolic?: number | null;
  pulse?: number | null;
  temp?: number | null;
  rbs?: number | null;
  created_at?: string;
  deleted_at?: string | null;
};

export type Nutrition = {
  id: number;
  patient_id: number;
  height?: number | null;
  weight?: number | null;
  bmi?: number | null;
  llw?: number | null;
  ulw?: number | null;
  visceral_fat?: number | null;
  body_fat_percent?: number | null;
  notes_nutritionist?: string | null;
  created_at?: string;
  deleted_at?: string | null;
};

export type Clinical = {
  id: number;
  patient_id: number;
  notes_doctor?: string | null;
  notes_psychologist?: string | null;
  created_at?: string;
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
  patient_identifier?: string | null;
  portal_username?: string | null;
  first_name: string;
  last_name?: string | null;
  surname: string | null;
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  email: string | null;
  diagnosis: string | null;
  primary_diagnosis: 'Hypertension' | 'Diabetes' | 'Hypertension and Diabetes' | null;
  primary_diagnosis_id?: number | null;
  primary_diagnosis_name?: string | null;
  primary_diagnosis_code?: string | null;
  comorbid_conditions?: string | null;
  current_medications_summary?: string | null;
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
  address?: string | null;
  lifestyle_factors: string | null;
  social_history?: string | null;
  physical_limitations: string | null;
  psychosocial_factors: string | null;
  past_medical_history?: string | null;
  surgical_history?: string | null;
  family_history?: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_email?: string | null;
  phone: string | null;
  dob: string | null;
  middle_name?: string | null;
  wellness_date: string;
  corporate_id: number | null;
  partner_id: number | null; 
  payer_id?: number | null;
  payer_name?: string | null;
  clinic_id?: number | null;
  clinic_name?: string | null;
  // List/registry rollups (from fetchPatients query)
  total_goals?: number;
  active_goals?: number;
  total_assessments?: number;
  overdue_goals?: number;
  upcoming_appointments?: number;
  next_appointment_date?: string | null;
  policy_number?: string | null;
  coverage_limits?: string | null;
  pre_authorization_status?: 'Not Required' | 'Pending' | 'Approved' | 'Denied' | null;
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
  vitals?: Vital[];
  nutrition?: Nutrition[];
  clinicals?: Clinical[];
  stats?: {
    totalGoals: number;
    activeGoals: number;
    totalAssessments: number;
    assessmentCoverage: number;
    needsAttention: boolean;
    overdueGoals?: number;
    upcomingAppointments?: number;
  };
};

export type RegistryInsights = {
  upcomingAppointments: {
    patient_id: number;
    patient_name: string;
    partner_name: string | null;
    clinic_name: string | null;
    title: string;
    appointment_date: string;
    status: string;
  }[];
  needsAttention: {
    patient_id: number;
    patient_name: string;
    status: string;
    overdue_goals: number;
    last_assessment_at: string | null;
  }[];
  leastInteraction: {
    patient_id: number;
    patient_name: string;
    partner_name: string | null;
    clinic_name: string | null;
    active_goals: number;
    assessments_30d: number;
    last_assessment_at: string | null;
  }[];
};

export type InsightsDeepDive = {
  totals: {
    activeMembers: number;
    membersWithActiveGoals: number;
    membersWithNoActiveGoals: number;
    activeGoals: number;
    overdueGoals: number;
    completedGoals: number;
    assessments7d: number;
    assessments30d: number;
    reviews30d: number;
    activePrescriptions: number;
  };
  topParameters30d: {
    parameter_name: string;
    total: number;
  }[];
  offTrackMembers: {
    patient_id: number;
    patient_name: string;
    off_target_goals: number;
    total_active_goals: number;
    last_assessment_at: string | null;
  }[];
};

export type InsightsMemberMetricsRow = {
  patient_id: number;
  patient_name: string;
  status: string;
  overdue_goals: number;
  last_assessment_at: string | null;
  assessments_30d: number;
  next_appointment_at: string | null;
  next_appointment_status: string | null;
  off_target_numeric_goals: number;
  total_numeric_goals: number;
};

export type InsightsMemberMetricsPage = {
  total: number;
  page: number;
  pageSize: number;
  rows: InsightsMemberMetricsRow[];
};

export type PatientOnboardingPayload = {
  first_name: string;
  middle_name?: string;
  surname: string;
  email: string;
  phone: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  address?: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  emergency_contact_relation: string;
  emergency_contact_email?: string;
  partner_id?: number | null;
  clinic_id?: number | null;
  primary_diagnosis_id?: number | null;
  comorbid_conditions?: string;
  current_medications_summary?: string;
  allergies_intolerances?: string;
  past_medical_history?: string;
  surgical_history?: string;
  family_history?: string;
  social_history?: string;
  payer_id?: number | null;
  policy_number?: string;
  coverage_limits?: string;
  pre_authorization_status?: 'Not Required' | 'Pending' | 'Approved' | 'Denied';
  portal_username?: string;
  role?: UserRole;
};
