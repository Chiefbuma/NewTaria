import type { User, Corporate, Patient, ClinicalParameter, Assessment, Goal } from './types';

export const users: User[] = [
    { id: 1, name: 'Dr. Emily Carter', email: 'admin@taria.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=emily' },
    { id: 2, name: 'John Davis', email: 'navigator@taria.com', role: 'navigator', avatarUrl: 'https://i.pravatar.cc/150?u=john' }
];

export const corporates: Corporate[] = [
    { id: 1, name: 'Innovate Inc.', wellness_date: '2023-05-15' },
    { id: 2, name: 'HealthForward', wellness_date: '2023-06-01' }
];

export const clinicalParameters: ClinicalParameter[] = [
    { id: 1, name: 'Blood Pressure', type: 'numeric', unit: 'mmHg', options: null },
    { id: 2, name: 'Heart Rate', type: 'numeric', unit: 'bpm', options: null },
    { id: 3, name: 'Blood Glucose', type: 'numeric', unit: 'mg/dL', options: null },
    { id: 4, name: 'Weight', type: 'numeric', unit: 'kg', options: null },
    { id: 5, name: 'Height', type: 'numeric', unit: 'cm', options: null },
    { id: 6, name: 'Mood', type: 'choice', unit: null, options: ['Happy', 'Anxious', 'Sad', 'Calm', 'Irritable'] },
    { id: 7, name: 'Pain Level', type: 'numeric', unit: '/ 10', options: null },
];

export let assessments: Assessment[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 1, value: '120/80', notes: 'Normal reading', created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z', is_normal: true },
    { id: 2, patient_id: 1, clinical_parameter_id: 2, value: '75', notes: null, created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z', is_normal: true },
    { id: 3, patient_id: 1, clinical_parameter_id: 3, value: '95', notes: 'Fasting', created_at: '2023-06-20T10:00:00Z', measured_at: '2023-06-20T10:00:00Z', is_normal: true },
    { id: 4, patient_id: 1, clinical_parameter_id: 6, value: 'Calm', notes: 'After meditation session', created_at: '2023-06-21T11:00:00Z', measured_at: '2023-06-21T11:00:00Z', is_normal: true },
    { id: 5, patient_id: 3, clinical_parameter_id: 1, value: '145/92', notes: 'Slightly elevated', created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z', is_normal: false },
    { id: 6, patient_id: 3, clinical_parameter_id: 2, value: '88', notes: 'Resting', created_at: '2023-06-19T09:00:00Z', measured_at: '2023-06-19T09:00:00Z', is_normal: false },
];

export let goals: Goal[] = [
    { id: 1, patient_id: 1, clinical_parameter_id: 4, target_value: '80', target_operator: '<=', status: 'active', notes: 'Lose 5kg in 3 months', deadline: '2023-09-20', created_at: '2023-06-20T10:00:00Z' },
    { id: 2, patient_id: 3, clinical_parameter_id: 1, target_value: '130/85', target_operator: '<=', status: 'active', notes: 'Lower blood pressure', deadline: '2023-08-19', created_at: '2023-06-19T09:00:00Z' },
];

export let patients: Patient[] = [
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
        assessments: assessments.filter(a => a.patient_id === 1),
        goals: goals.filter(g => g.patient_id === 1),
        stats: { totalGoals: 1, activeGoals: 1, totalAssessments: 4, assessmentCoverage: 100, needsAttention: false }
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
        assessments: [],
        goals: [],
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
        assessments: assessments.filter(a => a.patient_id === 3),
        goals: goals.filter(g => g.patient_id === 3),
        stats: { totalGoals: 1, activeGoals: 1, totalAssessments: 2, assessmentCoverage: 100, needsAttention: true }
    }
];
