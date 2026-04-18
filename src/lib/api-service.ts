
import type { 
    Patient, 
    User, 
    Assessment, 
    Goal, 
    Appointment, 
    Prescription, 
    Review,
    Medication,
    ClinicalParameter,
    Clinic,
    Diagnosis,
    Partner
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

// Patient self-monitoring (patient portal).
export async function createPatientAssessment(data: Pick<Assessment, 'clinical_parameter_id' | 'value' | 'measured_at'> & { notes?: string | null }): Promise<Assessment> {
    const res = await fetch('/api/patient/assessments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function updatePatientAssessment(data: Pick<Assessment, 'id' | 'value' | 'measured_at'> & { notes?: string | null }): Promise<Assessment> {
    const res = await fetch('/api/patient/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deletePatientAssessment(id: number): Promise<void> {
    const res = await fetch(`/api/patient/assessments?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function deleteAssessment(id: number): Promise<void> {
    const res = await fetch(`/api/assessments?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function updateAssessment(id: number, data: Partial<Assessment>): Promise<Assessment> {
    const res = await fetch('/api/assessments', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...data })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
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

export async function deleteAppointment(id: number): Promise<void> {
    const res = await fetch('/api/appointments', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
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

// --- Reference Data APIs ---
export async function fetchPayers(): Promise<Partner[]> {
    const res = await fetch('/api/partners?type=insurance');
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function fetchPartners(type?: Partner['partner_type']): Promise<Partner[]> {
    const query = type ? `?type=${type}` : '';
    const res = await fetch(`/api/partners${query}`);
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function fetchClinics(): Promise<Clinic[]> {
    const res = await fetch('/api/clinics');
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function upsertClinic(data: Partial<Clinic>): Promise<Clinic> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/clinics', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteClinic(id: number): Promise<void> {
    const res = await fetch(`/api/clinics?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function bulkDeleteClinics(ids: number[]): Promise<void> {
    const res = await fetch('/api/clinics/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
    });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    const res = await fetch('/api/diagnoses');
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function upsertDiagnosis(data: Partial<Diagnosis>): Promise<Diagnosis> {
    const method = data.id ? 'PUT' : 'POST';
    const res = await fetch('/api/diagnoses', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    });
    if (!res.ok) throw await getErrorFromResponse(res);
    return res.json();
}

export async function deleteDiagnosis(id: number): Promise<void> {
    const res = await fetch(`/api/diagnoses?id=${id}`, { method: 'DELETE' });
    if (!res.ok) throw await getErrorFromResponse(res);
}

export async function bulkDeleteDiagnoses(ids: number[]): Promise<void> {
    const res = await fetch('/api/diagnoses/bulk-delete', {
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
    const res = await fetch('/api/clinical-parameters/bulk-delete', {
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
