import type { Patient, ClinicalParameter, User, Corporate } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    patients as mockPatients, 
    clinicalParameters as mockClinicalParameters,
    users as mockUsers,
    corporates as mockCorporates,
    vitals as mockVitals,
    nutrition as mockNutrition,
    goals as mockGoals,
    clinicals as mockClinicals,
} from './mock-data';

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export async function fetchPatients(): Promise<Patient[]> {
    noStore();
    await delay(100); // Simulate API latency
    
    // Join navigator and corporate names
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
    await delay(150);
    
    const patient = mockPatients.find(p => p.id === parseInt(id));

    if (!patient) {
        return null;
    }

    const navigator = mockUsers.find(u => u.id === patient.navigator_id);
    const corporate = mockCorporates.find(c => c.id === patient.corporate_id);

    const patientVitals = mockVitals.filter(v => v.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const patientNutrition = mockNutrition.filter(n => n.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const patientGoals = mockGoals.filter(g => g.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    const patientClinicals = mockClinicals.filter(c => c.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    return {
        ...patient,
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
        vitals: patientVitals,
        nutrition: patientNutrition,
        goals: patientGoals,
        clinicals: patientClinicals,
    };
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    await delay(50);
    return mockClinicalParameters.sort((a, b) => a.name.localeCompare(b.name));
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    await delay(50);
    return mockUsers;
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    await delay(50);
    return mockCorporates.sort((a, b) => a.name.localeCompare(b.name));
}
