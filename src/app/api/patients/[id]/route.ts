import { NextResponse } from 'next/server';
import { patients, assessments, goals, clinicalParameters, users, corporates } from '@/lib/mock-data';
import type { Patient } from '@/lib/types';

let mockPatients: Patient[] = [...patients];

function getFullPatientDetails(patient: Patient) {
    const patientAssessments = assessments.filter(a => a.patient_id === patient.id)
        .map(a => ({
            ...a,
            parameter: clinicalParameters.find(p => p.id === a.clinical_parameter_id)
        }));
    
    const patientGoals = goals.filter(g => g.patient_id === patient.id && g.status === 'active')
        .map(g => ({
            ...g,
            parameter: clinicalParameters.find(p => p.id === g.clinical_parameter_id)
        }));

    const navigator = users.find(u => u.id === patient.navigator_id);
    const corporate = corporates.find(c => c.id === patient.corporate_id);

    return {
        ...patient,
        assessments: patientAssessments.sort((a, b) => new Date(b.measured_at).getTime() - new Date(a.measured_at).getTime()),
        goals: patientGoals.sort((a,b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime()),
        navigator_name: navigator?.name,
        corporate_name: corporate?.name,
    };
}


export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const patient = mockPatients.find(p => p.id === parseInt(params.id));
    if (!patient) {
      return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
    }
    const fullDetails = getFullPatientDetails(patient);
    return NextResponse.json(fullDetails);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: 'Error fetching patient' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
    try {
        const patientId = parseInt(params.id);
        const body = await request.json();
        
        const patientIndex = mockPatients.findIndex(p => p.id === patientId);

        if (patientIndex === -1) {
            return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
        }
        
        mockPatients[patientIndex] = { ...mockPatients[patientIndex], ...body };
        
        const updatedPatient = getFullPatientDetails(mockPatients[patientIndex]);
        
        return NextResponse.json({ message: 'Patient updated successfully', patient: updatedPatient });

    } catch (error) {
        console.error('Error updating patient:', error);
        return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    try {
        const patientId = parseInt(params.id);
        const initialLength = mockPatients.length;
        mockPatients = mockPatients.filter(p => p.id !== patientId);

        if (mockPatients.length === initialLength) {
             return NextResponse.json({ message: 'Patient not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'Patient deleted successfully' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: 'Error deleting patient' }, { status: 500 });
    }
}
