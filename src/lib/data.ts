import type { Patient, User, Corporate, Vital, Nutrition, Goal, Clinical } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    patients as mockPatients, 
    users as mockUsers,
    corporates as mockCorporates,
    vitals as mockVitals,
    nutrition as mockNutrition,
    goals as mockGoals,
    clinicals as mockClinicals
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

    return {
        ...patient,
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
        vitals: mockVitals.filter(v => v.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        nutrition: mockNutrition.filter(n => n.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        goals: mockGoals.filter(g => g.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
        clinicals: mockClinicals.filter(c => c.patient_id === patient.id).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    };
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    return mockUsers;
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    return mockCorporates.sort((a, b) => a.name.localeCompare(b.name));
}
