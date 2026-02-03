import type { Patient, ClinicalParameter, User, Assessment, Goal, Corporate } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';
import { 
    patients as mockPatients, 
    clinicalParameters as mockClinicalParameters,
    users as mockUsers,
    assessments as mockAssessments,
    goals as mockGoals,
    corporates as mockCorporates,
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
    await delay(150); // Simulate API latency
    
    const patient = mockPatients.find(p => p.id === parseInt(id));

    if (!patient) {
        return null;
    }

    // Aggregate and join related data, similar to how the API would
    const patientAssessments = mockAssessments.filter(a => a.patient_id === patient.id)
        .map(a => ({
            ...a,
            parameter: mockClinicalParameters.find(p => p.id === a.clinical_parameter_id)
        }));
    
    const patientGoals = mockGoals.filter(g => g.patient_id === patient.id && g.status === 'active')
        .map(g => ({
            ...g,
            parameter: mockClinicalParameters.find(p => p.id === g.clinical_parameter_id)
        }));

    const navigator = mockUsers.find(u => u.id === patient.navigator_id);
    const corporate = mockCorporates.find(c => c.id === patient.corporate_id);

    return {
        ...patient,
        assessments: patientAssessments.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()),
        goals: patientGoals.sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
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