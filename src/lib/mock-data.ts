import type { User, Corporate, Patient, Vital, Nutrition, Goal, Clinical } from './types';

export const users: User[] = [
    { id: 1, name: 'Dr. Emily Carter', email: 'admin@taria.com', role: 'admin', avatarUrl: 'https://i.pravatar.cc/150?u=emily' },
    { id: 2, name: 'John Davis', email: 'navigator@taria.com', role: 'navigator', avatarUrl: 'https://i.pravatar.cc/150?u=john' }
];

export const corporates: Corporate[] = [
    { id: 1, name: 'Innovate Inc.', wellness_date: '2023-05-15' },
    { id: 2, name: 'HealthForward', wellness_date: '2023-06-01' }
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
    }
];

export let vitals: Vital[] = [
    { id: 1, patient_id: 1, bp_systolic: 120, bp_diastolic: 80, pulse: 75, temp: 36.8, rbs: '5.5', created_at: '2023-06-20T10:00:00Z' },
    { id: 2, patient_id: 3, bp_systolic: 145, bp_diastolic: 92, pulse: 88, temp: 37.1, rbs: '6.1', created_at: '2023-06-19T09:00:00Z' },
];

export let nutrition: Nutrition[] = [
    { id: 1, patient_id: 1, height: 180, weight: 85, bmi: 26.2, visceral_fat: 9, body_fat_percent: 22, notes_nutritionist: 'Patient is slightly overweight. Recommended to increase physical activity and reduce processed foods.', created_at: '2023-06-20T10:00:00Z' },
];

export let goals: Goal[] = [
    { id: 1, patient_id: 1, discussion: 'Patient wants to improve cardiovascular health and lose some weight.', goal: 'Walk for 30 minutes, 5 times a week. Reduce sugar intake.', created_at: '2023-06-20T10:00:00Z' },
];

export let clinicals: Clinical[] = [
    { id: 1, patient_id: 1, notes_doctor: 'Patient is responding well to Metformin. Continue monitoring blood glucose levels.', notes_psychologist: 'Patient reports feeling positive about managing their condition.', created_at: '2023-06-20T10:00:00Z' },
];
