import type { User, Corporate, Patient, ClinicalParameter, Assessment, Goal, Medication, Prescription, Appointment, Review, Diagnosis } from './types';

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
    { id: 9, name: 'Temperature', type: 'numeric', unit: '°C', options: null, category: 'vital_sign' },
    { id: 10, name: 'RBS', type: 'numeric', unit: 'mmol/L', options: null, category: 'lab_result' },
    { id: 11, name: 'BMI', type: 'numeric', unit: null, options: null, category: 'clinical_measurement' },
    { id: 12, name: 'Visceral Fat', type: 'numeric', unit: null, options: null, category: 'clinical_measurement' },
    { id: 13, name: 'Body Fat %', type: 'numeric', unit: '%', options: null, category: 'clinical_measurement' },
];

export const diagnoses: Diagnosis[] = [
    { id: 1, name: 'Type 2 Diabetes', code: 'E11' },
    { id: 2, name: 'Hypertension', code: 'I10' },
    { id: 3, name: 'General Checkup', code: 'Z00.0' },
];

export const assessments: Assessment[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 1, value: '120', notes: null, is_normal: true, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 2, patient_id: 1, clinical_parameter_id: 2, value: '80', notes: null, is_normal: true, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 3, patient_id: 1, clinical_parameter_id: 5, value: '85', notes: 'Slightly above ideal weight.', is_normal: false, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z' },
    { id: 4, patient_id: 3, clinical_parameter_id: 1, value: '145', notes: 'Patient reports feeling stressed.', is_normal: false, created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z' },
    { id: 5, patient_id: 3, clinical_parameter_id: 2, value: '92', notes: null, is_normal: false, created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z' },
];

export const goals: Goal[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 5, target_value: '80', target_operator: '<=', status: 'active', notes: 'Focus on diet and exercise.', deadline: '2023-09-20', created_at: '2023-06-20T10:00:00Z' },
    { id: 2, patient_id: 3, clinical_parameter_id: 1, target_value: '130', target_operator: '<=', status: 'active', notes: 'Monitor BP twice daily.', deadline: '2023-08-19', created_at: '2023-06-19T09:00:00Z' },
];

export const medications: Medication[] = [
    { id: 1, name: 'Metformin', dosage: '500mg' },
    { id: 2, name: 'Lisinopril', dosage: '10mg' },
];

export const prescriptions: Prescription[] = [
    { id: 1, patient_id: 1, medication_id: 1, frequency: 'Once daily', notes: 'Take with breakfast.', start_date: '2023-05-16', end_date: null, created_at: '2023-05-16T09:00:00Z' },
    { id: 2, patient_id: 3, medication_id: 2, frequency: 'Once daily', notes: 'Monitor for cough.', start_date: '2023-05-17', end_date: null, created_at: '2023-05-17T09:00:00Z' },
];

export const appointments: Appointment[] = [
    { id: 1, patient_id: 1, user_id: 3, title: 'Quarterly Checkup', appointment_date: '2023-08-15T14:00:00Z', end_date: '2023-08-15T14:30:00Z', notes: 'Review lab results.', status: 'scheduled' },
    { id: 2, patient_id: 3, user_id: 3, title: 'BP Follow-up', appointment_date: '2023-07-01T10:00:00Z', end_date: '2023-07-01T10:15:00Z', notes: 'Check response to new medication.', status: 'confirmed' },
];

export const reviews: Review[] = [
    { id: 1, patient_id: 1, user_id: 3, subjective_findings: 'Patient reports feeling well, occasional fatigue.', objective_findings: 'BP 120/80, HR 75. Labs stable.', assessment: 'Diabetes well-controlled.', plan: 'Continue current medication. Follow up in 3 months.', recommendations: 'Encourage daily walks.', created_at: '2023-06-20T14:00:00Z', review_date: '2023-06-20' },
    { id: 2, patient_id: 3, user_id: 3, subjective_findings: 'Patient reports headaches.', objective_findings: 'BP 145/92.', assessment: 'Uncontrolled hypertension.', plan: 'Adjust Lisinopril dosage. Recommend low-sodium diet.', recommendations: null, created_at: '2023-06-19T09:30:00Z', review_date: '2023-06-19' }
];

export let patients: Omit<Patient, 'diagnoses' | 'prescriptions' | 'appointments' | 'reviews' | 'goals' | 'assessments'>[] = [
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
        stats: { totalGoals: 1, activeGoals: 1, totalAssessments: 4, assessmentCoverage: 100, needsAttention: false },
        date_of_diagnosis: '2020-01-15',
        payer_id: 1
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
        stats: { totalGoals: 0, activeGoals: 0, totalAssessments: 0, assessmentCoverage: 0, needsAttention: true }
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
        stats: { totalGoals: 1, activeGoals: 1, totalAssessments: 2, assessmentCoverage: 100, needsAttention: true },
        date_of_diagnosis: '2013-03-20',
        payer_id: 2
    }
];
