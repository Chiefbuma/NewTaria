import type { User, Corporate, Patient, ClinicalParameter, Assessment, Goal, Vitals, Nutrition, Clinical } from './types';
import { subDays, formatISO } from 'date-fns';

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
    { id: 2, name: 'Blood Glucose', type: 'numeric', unit: 'mg/dL', options: null },
    { id: 3, name: 'Weight', type: 'numeric', unit: 'kg', options: null },
    { id: 4, name: 'Height', type: 'numeric', unit: 'cm', options: null },
    { id: 5, name: 'Mood', type: 'choice', unit: null, options: ['Happy', 'Neutral', 'Sad', 'Anxious'] },
    { id: 6, name: 'Sleep Quality', type: 'choice', unit: null, options: ['Excellent', 'Good', 'Fair', 'Poor'] },
    { id: 7, name: 'Daily Notes', type: 'text', unit: null, options: null }
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

export let vitals: Vitals[] = [
    { id: 1, patient_id: 1, bp_systolic: '120', bp_diastolic: '80', pulse: '75', temp: '36.8', rbs: '5.5', created_at: formatISO(subDays(new Date(), 1)) }
];

export let nutrition: Nutrition[] = [
    { id: 1, patient_id: 1, height: '175', weight: '85', visceral_fat: '9', body_fat_percent: '22', notes_nutritionist: 'Patient is advised to increase vegetable intake.', created_at: formatISO(subDays(new Date(), 1)), bmi: '27.8' }
];

export let goals: Goal[] = [
    { id: 1, patient_id: 1, discussion: 'Patient wants to lose weight and feel more energetic.', goal: 'Walk for 30 minutes, 5 days a week. Reduce sugar intake.', created_at: formatISO(subDays(new Date(), 1)) }
];

export let clinicals: Clinical[] = [
    { id: 1, patient_id: 1, notes_doctor: 'Patient is stable. Continue current medication. Follow up in 3 months.', notes_psychologist: 'Patient reports feeling positive about health journey.', created_at: formatISO(subDays(new Date(), 1)) }
];


export let assessments: Assessment[] = [
    // John Doe's Assessments
    { id: 1, patient_id: 1, clinical_parameter_id: 1, value: '120/80', notes: 'Normal reading', is_normal: true, created_at: formatISO(subDays(new Date(), 10)), measured_at: formatISO(subDays(new Date(), 10)) },
    { id: 2, patient_id: 1, clinical_parameter_id: 2, value: '110', notes: 'Post-meal', is_normal: true, created_at: formatISO(subDays(new Date(), 10)), measured_at: formatISO(subDays(new Date(), 10)) },
    { id: 3, patient_id: 1, clinical_parameter_id: 3, value: '85', notes: '', is_normal: null, created_at: formatISO(subDays(new Date(), 10)), measured_at: formatISO(subDays(new Date(), 10)) },
    { id: 4, patient_id: 1, clinical_parameter_id: 1, value: '122/81', notes: 'Slightly elevated', is_normal: false, created_at: formatISO(subDays(new Date(), 5)), measured_at: formatISO(subDays(new Date(), 5)) },
    { id: 5, patient_id: 1, clinical_parameter_id: 2, value: '115', notes: '', is_normal: true, created_at: formatISO(subDays(new Date(), 5)), measured_at: formatISO(subDays(new Date(), 5)) },
    { id: 6, patient_id: 1, clinical_parameter_id: 3, value: '85.5', notes: '', is_normal: null, created_at: formatISO(subDays(new Date(), 5)), measured_at: formatISO(subDays(new Date(), 5)) },
    { id: 7, patient_id: 1, clinical_parameter_id: 5, value: 'Happy', notes: 'Feeling good today', is_normal: null, created_at: formatISO(subDays(new Date(), 1)), measured_at: formatISO(subDays(new Date(), 1)) },
    { id: 8, patient_id: 1, clinical_parameter_id: 1, value: '118/79', notes: 'Back to normal', is_normal: true, created_at: formatISO(subDays(new Date(), 1)), measured_at: formatISO(subDays(new Date(), 1)) },
    { id: 9, patient_id: 1, clinical_parameter_id: 2, value: '105', notes: 'Fasting', is_normal: true, created_at: formatISO(subDays(new Date(), 1)), measured_at: formatISO(subDays(new Date(), 1)) },

    // Peter Jones's Assessments
    { id: 10, patient_id: 3, clinical_parameter_id: 1, value: '140/90', notes: 'High reading', is_normal: false, created_at: formatISO(subDays(new Date(), 7)), measured_at: formatISO(subDays(new Date(), 7)) },
    { id: 11, patient_id: 3, clinical_parameter_id: 3, value: '95', notes: '', is_normal: null, created_at: formatISO(subDays(new Date(), 7)), measured_at: formatISO(subDays(new Date(), 7)) },
    { id: 12, patient_id: 3, clinical_parameter_id: 1, value: '135/88', notes: 'Slightly better', is_normal: false, created_at: formatISO(subDays(new Date(), 3)), measured_at: formatISO(subDays(new Date(), 3)) },
    { id: 13, patient_id: 3, clinical_parameter_id: 6, value: 'Fair', notes: 'Woke up a few times.', is_normal: null, created_at: formatISO(subDays(new Date(), 3)), measured_at: formatISO(subDays(new Date(), 3)) },
];
