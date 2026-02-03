import type { User, Corporate, Patient, ClinicalParameter, Assessment, Goal, Diagnosis, Medication, Prescription, Appointment, Review } from './types';

export const users: User[] = [
    { id: 1, name: 'Dr. Emily Carter', email: 'admin@taria.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=emily' },
    { id: 2, name: 'John Davis', email: 'navigator@taria.com', role: 'navigator', avatarUrl: 'https://i.pravatar.cc/150?u=john' },
    { id: 3, name: 'Dr. Ben Stone', email: 'physician@taria.com', role: 'physician', avatarUrl: 'https://i.pravatar.cc/150?u=ben' },
];

export const corporates: Corporate[] = [
    { id: 1, name: 'Innovate Inc.', wellness_date: '2023-05-15' },
    { id: 2, name: 'HealthForward', wellness_date: '2023-06-01' }
];

export const clinicalParameters: ClinicalParameter[] = [
    { id: 1, name: 'Blood Pressure (Systolic)', type: 'numeric', unit: 'mmHg', options: null, category: 'vital_sign' },
    { id: 2, name: 'Blood Pressure (Diastolic)', type: 'numeric', unit: 'mmHg', options: null, category: 'vital_sign' },
    { id: 3, name: 'Heart Rate', type: 'numeric', unit: 'bpm', options: null, category: 'vital_sign' },
    { id: 4, name: 'Blood Glucose', type: 'numeric', unit: 'mg/dL', options: null, category: 'lab_result' },
    { id: 5, name: 'Weight', type: 'numeric', unit: 'kg', options: null, category: 'clinical_measurement' },
    { id: 6, name: 'Height', type: 'numeric', unit: 'cm', options: null, category: 'clinical_measurement' },
    { id: 7, name: 'Mood', type: 'choice', unit: null, options: ['Happy', 'Anxious', 'Sad', 'Calm', 'Irritable'], category: 'assessment' },
    { id: 8, name: 'Pain Level', type: 'numeric', unit: '/ 10', options: null, category: 'symptom' },
];

export const assessments: Assessment[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 1, value: '120', notes: null, is_normal: true, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 2, patient_id: 1, clinical_parameter_id: 2, value: '80', notes: null, is_normal: true, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 3, patient_id: 1, clinical_parameter_id: 5, value: '85', notes: 'Slightly above ideal weight.', is_normal: false, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 4, patient_id: 3, clinical_parameter_id: 1, value: '145', notes: 'Patient reports feeling stressed.', is_normal: false, created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z' },
    { id: 5, patient_id: 3, clinical_parameter_id: 2, value: '92', notes: null, is_normal: false, created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z' },
];

export const goals: Goal[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 5, target_value: '80', target_operator: '<=', status: 'active', notes: 'Focus on diet and exercise.', deadline: '2023-09-20', created_at: '2023-06-20T10:00:00Z', current_value: '85', is_overdue: false },
    { id: 2, patient_id: 3, clinical_parameter_id: 1, target_value: '130', target_operator: '<=', status: 'active', notes: 'Monitor BP twice daily.', deadline: '2023-08-19', created_at: '2023-06-19T09:00:00Z', current_value: '145', is_overdue: true },
];

export const diagnoses: Diagnosis[] = [
    { id: 1, name: 'Type 2 Diabetes', code: 'E11', description: 'Chronic condition that affects the way the body processes blood sugar.' },
    { id: 2, name: 'Hypertension', code: 'I10', description: 'A condition in which the force of the blood against the artery walls is too high.' },
];

export const medications: Medication[] = [
    { id: 1, name: 'Metformin', dosage: '500mg' },
    { id: 2, name: 'Lisinopril', dosage: '10mg' },
];

export const prescriptions: Prescription[] = [
    { id: 1, patient_id: 1, medication_id: 1, dosage: '500mg', frequency: 'twice_daily', start_date: '2023-05-16', end_date: null, notes: 'Take with meals.', status: 'active' },
    { id: 2, patient_id: 3, medication_id: 2, dosage: '10mg', frequency: 'daily', start_date: '2023-05-17', end_date: null, notes: 'Monitor for cough.', status: 'active' },
];

export const appointments: Appointment[] = [
    { id: 1, patient_id: 1, clinician_id: 3, title: 'Follow-up Consultation', appointment_date: '2023-07-15T14:00:00Z', end_date: '2023-07-15T14:30:00Z', description: 'Review recent blood sugar levels.', status: 'scheduled', cancellation_reason: null },
    { id: 2, patient_id: 3, clinician_id: 3, title: 'BP Check', appointment_date: '2023-07-10T09:00:00Z', end_date: '2023-07-10T09:15:00Z', description: null, status: 'confirmed', cancellation_reason: null },
];

export const reviews: Review[] = [
    { id: 1, patient_id: 1, reviewed_by_id: 3, review_date: '2023-06-20', subjective_findings: 'Patient reports feeling well.', objective_findings: 'Blood glucose levels are stable.', assessment: 'Good control of diabetes.', plan: 'Continue current medication and diet.', recommendations: 'Encourage regular exercise.', follow_up_date: '2023-07-15' },
    { id: 2, patient_id: 3, reviewed_by_id: 3, review_date: '2023-06-19', subjective_findings: 'Patient reports occasional headaches.', objective_findings: 'BP remains elevated.', assessment: 'Uncontrolled hypertension.', plan: 'Adjust medication (Lisinopril to 20mg).', recommendations: 'Low-sodium diet, stress management techniques.', follow_up_date: '2023-07-10' },
];


export let patients: Omit<Patient, 'assessments' | 'goals' | 'diagnoses' | 'prescriptions' | 'appointments' | 'reviews'>[] = [
    {
        id: 1,
        first_name: 'John',
        surname: 'Doe',
        dob: '1985-04-12',
        age: 39,
        sex: 'Male',
        phone: '555-0101',
        email: 'john.doe@example.com',
        wellness_date: '2023-05-15',
        corporate_id: 1,
        status: 'Active',
        created_at: '2023-05-15T10:00:00Z',
        date_of_onboarding: '2023-05-16',
        has_glucometer: true,
        has_bp_machine: true,
        has_tape_measure: false,
        brief_medical_history: 'Diagnosed with Type 2 Diabetes in 2020. Generally stable.',
        years_since_diagnosis: 3,
        emergency_contact_name: 'Jane Doe',
        emergency_contact_phone: '555-0102',
        emergency_contact_relation: 'Spouse',
        consent_date: '2023-05-15',
        navigator_id: 2,
        middle_name: 'A',
        date_of_diagnosis: '2020-01-10',
    },
    {
        id: 2,
        first_name: 'Jane',
        surname: 'Smith',
        dob: '1990-08-22',
        age: 33,
        sex: 'Female',
        phone: '555-0103',
        email: 'jane.smith@example.com',
        wellness_date: '2023-06-01',
        corporate_id: 2,
        status: 'Pending',
        created_at: '2023-06-01T11:30:00Z',
        date_of_onboarding: null,
        has_glucometer: false,
        has_bp_machine: false,
        has_tape_measure: false,
        brief_medical_history: null,
        years_since_diagnosis: null,
        emergency_contact_name: null,
        emergency_contact_phone: null,
        emergency_contact_relation: null,
        consent_date: null,
        navigator_id: null,
        middle_name: null,
        date_of_diagnosis: null,
    },
    {
        id: 3,
        first_name: 'Peter',
        surname: 'Jones',
        dob: '1978-11-02',
        age: 45,
        sex: 'Male',
        phone: '555-0104',
        email: 'peter.jones@example.com',
        wellness_date: '2023-05-15',
        corporate_id: 1,
        status: 'Critical',
        created_at: '2023-05-15T10:15:00Z',
        date_of_onboarding: '2023-05-17',
        has_glucometer: true,
        has_bp_machine: true,
        has_tape_measure: true,
        brief_medical_history: 'History of hypertension.',
        years_since_diagnosis: 10,
        emergency_contact_name: 'Mary Jones',
        emergency_contact_phone: '555-0105',
        emergency_contact_relation: 'Sister',
        consent_date: '2023-05-15',
        navigator_id: 2,
        middle_name: 'B',
        date_of_diagnosis: '2013-03-20',
    }
];
