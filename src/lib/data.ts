import type { Patient, User, Corporate, ClinicalParameter, Assessment, Goal, Medication, Prescription, Appointment, Review, Diagnosis } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    patients as mockPatients, 
    users as mockUsers,
    corporates as mockCorporates,
    clinicalParameters as mockClinicalParameters,
    assessments as mockAssessments,
    goals as mockGoals,
    medications as mockMedications,
    prescriptions as mockPrescriptions,
    appointments as mockAppointments,
    reviews as mockReviews,
    diagnoses as mockDiagnoses
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
    const patientAssessments = mockAssessments.filter(a => a.patient_id === patient.id);
    const patientGoals = mockGoals.filter(g => g.patient_id === patient.id);
    const patientPrescriptions = mockPrescriptions.filter(p => p.patient_id === patient.id);
    const patientAppointments = mockAppointments.filter(a => a.patient_id === patient.id);
    const patientReviews = mockReviews.filter(r => r.patient_id === patient.id);
    
    // For simplicity, we're attaching all diagnoses to patients, but in a real app, you'd have a join table.
    const patientDiagnoses = mockDiagnoses; 

    return {
        ...patient,
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
        assessments: patientAssessments,
        goals: patientGoals,
        prescriptions: patientPrescriptions,
        appointments: patientAppointments,
        reviews: patientReviews,
        diagnoses: patientDiagnoses,
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

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    return mockMedications;
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    noStore();
    return mockDiagnoses;
}
