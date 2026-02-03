import type { Patient, ClinicalParameter, User } from '@/lib/types';
import { unstable_noStore as noStore } from 'next/cache';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

async function fetchFromApi(endpoint: string, options: RequestInit = {}) {
    noStore();
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to fetch ${endpoint}`);
        }
        return response.json();
    } catch (error) {
        console.error(`API Error (${endpoint}):`, error);
        if (error instanceof Error) {
            throw new Error(error.message);
        }
        throw new Error(`An unknown error occurred while fetching ${endpoint}`);
    }
}


export async function fetchPatients(): Promise<Patient[]> {
    return fetchFromApi('/patients');
}

export async function fetchPatientById(id: string): Promise<Patient | null> {
    try {
        return await fetchFromApi(`/patients/${id}`);
    } catch (error) {
        console.error(`Patient with ID ${id} not found.`);
        return null;
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    return fetchFromApi('/clinical-parameters');
}

export async function fetchUsers(): Promise<User[]> {
    return fetchFromApi('/users');
}
