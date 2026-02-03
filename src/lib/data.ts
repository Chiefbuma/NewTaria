import type { Patient, User, Corporate, ClinicalParameter, Assessment, Goal, Diagnosis, Medication, Prescription, Appointment, Review } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    patients as mockPatients, 
    users as mockUsers,
    corporates as mockCorporates,
    clinicalParameters as mockClinicalParameters,
    assessments as mockAssessments,
    goals as mockGoals,
    diagnoses as mockDiagnoses,
    medications as mockMedications,
    prescriptions as mockPrescriptions,
    appointments as mockAppointments,
    reviews as mockReviews,
} from './mock-data';

export async function fetchPatients(): Promise<Patient[]> {
    noStore();
    
    const enrichedPatients = mockPatients.map(patient => {
        const navigator = mockUsers.find(u => u.id === patient.navigator_id);
        const corporate = mockCorporates.find(c => c.id === patient.corporate_id);
        return {
            ...patient,
            navigator_name: navigator?.name,
            corporate_name: corporate?.name,
            assessments: mockAssessments.filter(a => a.patient_id === patient.id),
            goals: mockGoals.filter(g => g.patient_id === patient.id),
            diagnoses: mockDiagnoses.filter(d => d.id === 1 || d.id === 2), // Mock: assign some diagnoses
            prescriptions: mockPrescriptions.filter(p => p.patient_id === patient.id).map(p => ({...p, medication: mockMedications.find(m => m.id === p.medication_id)})),
            appointments: mockAppointments.filter(a => a.patient_id === patient.id).map(a => ({...a, clinician: mockUsers.find(u => u.id === a.clinician_id)})),
            reviews: mockReviews.filter(r => r.patient_id === patient.id).map(r => ({...r, reviewed_by: mockUsers.find(u => u.id === r.reviewed_by_id)?.name})),
        };
    });

    return enrichedPatients.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
    noStore();
    
    const patient = mockPatients.find(p => p.id === parseInt(id));

    if (!patient) {
        return null;
    }

    const navigator = mockUsers.find(u => u.id === patient.navigator_id);
    const corporate = mockCorporates.find(c => c.id === patient.corporate_id);

    return {
        ...patient,
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
        assessments: mockAssessments.filter(a => a.patient_id === patient.id),
        goals: mockGoals.filter(g => g.patient_id === patient.id),
        diagnoses: (patient.id === 1) ? [mockDiagnoses[0]] : (patient.id === 3) ? [mockDiagnoses[1]] : [],
        prescriptions: mockPrescriptions.filter(p => p.patient_id === patient.id).map(p => ({...p, medication: mockMedications.find(m => m.id === p.medication_id)})),
        appointments: mockAppointments.filter(a => a.patient_id === patient.id).map(a => ({...a, clinician: mockUsers.find(u => u.id === a.clinician_id)})),
        reviews: mockReviews.filter(r => r.patient_id === patient.id).map(r => ({...r, reviewed_by: mockUsers.find(u => u.id === r.reviewed_by_id)?.name})),
    };
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    return mockUsers;
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    return mockClinicalParameters;
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    return mockCorporates.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    noStore();
    return mockDiagnoses;
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    return mockMedications;
}
