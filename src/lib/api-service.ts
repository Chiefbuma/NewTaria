
import type { 
    Patient, 
    User, 
    Assessment, 
    Goal, 
    Appointment, 
    Prescription, 
    Review,
    Message,
    Medication,
    ClinicalParameter
} from '@/lib/types';

async function getErrorFromResponse(res: Response): Promise<Error> {
    try {
        const data = await res.json();
        return new Error(data.error || 'Request failed');
    } catch {
        return new Error(`Request failed with status ${res.status}`);
    }
}

// --- Assessment APIs ---
export async function createAssessment(data: Partial<Assessment>): Promise<Assessment> {
    const res = await fetch('/api/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteAssessment(id: number): Promise<void> {
    const res = await fetch(`/api/assessments?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Goal APIs ---
export async function createGoal(data: Partial<Goal>): Promise<Goal> {
    const res = await fetch('/api/goals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function updateGoal(id: number, data: Partial<Goal>): Promise<Goal> {
    const res = await fetch(`/api/goals`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteGoal(id: number): Promise<void> {
    const res = await fetch(`/api/goals?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Appointment APIs ---
export async function upsertAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/appointments', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function updateAppointmentStatus(id: number, status: Appointment['status']): Promise<void> {
    const res = await fetch('/api/appointments/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Prescription APIs ---
export async function upsertPrescription(data: Partial<Prescription>): Promise<Prescription> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/prescriptions', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deletePrescription(id: number): Promise<void> {
    const res = await fetch(`/api/prescriptions?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Patient APIs ---
export async function updatePatient(id: number, data: Partial<Patient>): Promise<Patient> {
    const res = await fetch(`/api/patients`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function bulkDeletePatients(ids: number[]): Promise<void> {
    const res = await fetch('/api/patients/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Medication APIs ---
export async function fetchMedications(): Promise<Medication[]> {
    const res = await fetch('/api/medications');
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function upsertMedication(data: Partial<Medication>): Promise<Medication> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/medications', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteMedication(id: number): Promise<void> {
    const res = await fetch(`/api/medications?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function bulkDeleteMedications(ids: number[]): Promise<void> {
    const res = await fetch('/api/medications/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Clinical Parameter APIs ---
export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    const res = await fetch('/api/clinical-parameters');
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function upsertClinicalParameter(data: Partial<ClinicalParameter>): Promise<ClinicalParameter> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/clinical-parameters', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteClinicalParameter(id: number): Promise<void> {
    const res = await fetch(`/api/clinical-parameters?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function bulkDeleteParameters(ids: number[]): Promise<void> {
    const res = await fetch('/api/parameters/bulk-delete', { // Note: ensure this route matches or is implemented if needed
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function activatePatient(id: number, data: Partial<Patient>): Promise<void> {
    const res = await fetch('/api/patients/activate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

// --- Clinical Review APIs ---
export async function createReview(data: Partial<Review>): Promise<Review> {
    const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

// --- Messaging APIs ---
export async function fetchMessages(receiverId?: number): Promise<Message[]> {
    const url = receiverId ? `/api/messages?otherId=${receiverId}` : '/api/messages';
    const res = await fetch(url);
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function sendMessage(receiverId: number, content: string): Promise<Message> {
    const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiverId, content })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}
