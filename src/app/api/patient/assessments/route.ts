import { NextResponse } from 'next/server';
import { authorizeApiRequest } from '@/lib/auth';
import { isPatientRole } from '@/lib/role-utils';
import {
  createAssessment,
  deleteAssessment,
  fetchAssessmentById,
  fetchClinicalParameterById,
  fetchLatestAssessmentIdForCreator,
  updateAssessment,
} from '@/lib/data';

export const runtime = 'nodejs';

function normalizeMeasuredAt(value: unknown) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const v = value.trim();
  // If the client submits date-only, keep it as local midnight to avoid timezone shifting.
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return `${v}T00:00:00`;
  return v;
}

export async function POST(req: Request) {
  try {
    const authResult = await authorizeApiRequest();
    if (authResult instanceof NextResponse) return authResult;
    if (!isPatientRole(authResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const patientId = authResult.patientId;
    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found for this account' }, { status: 400 });
    }

    const body = await req.json();
    const clinicalParameterId = Number(body?.clinical_parameter_id);
    const measuredAt = normalizeMeasuredAt(body?.measured_at);
    const value = typeof body?.value === 'string' ? body.value : String(body?.value ?? '');
    const notes = typeof body?.notes === 'string' ? body.notes : null;

    if (!clinicalParameterId || !value.trim() || !measuredAt) {
      return NextResponse.json({ error: 'clinical_parameter_id, value, and measured_at are required' }, { status: 400 });
    }

    const parameter = await fetchClinicalParameterById(clinicalParameterId);
    if (!parameter) {
      return NextResponse.json({ error: 'Clinical parameter not found' }, { status: 404 });
    }
    if (!parameter.allow_self_monitoring) {
      return NextResponse.json({ error: 'Self monitoring is not enabled for this parameter' }, { status: 403 });
    }

    const id = await createAssessment({
      patient_id: patientId,
      clinical_parameter_id: clinicalParameterId,
      created_by_user_id: authResult.id,
      value: value.trim(),
      notes,
      measured_at: measuredAt,
      is_normal: null,
    });

    return NextResponse.json({
      id,
      patient_id: patientId,
      clinical_parameter_id: clinicalParameterId,
      created_by_user_id: authResult.id,
      value: value.trim(),
      notes,
      is_normal: null,
      measured_at: measuredAt,
      created_at: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to save assessment' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authResult = await authorizeApiRequest();
    if (authResult instanceof NextResponse) return authResult;
    if (!isPatientRole(authResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const patientId = authResult.patientId;
    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found for this account' }, { status: 400 });
    }

    const body = await req.json();
    const id = Number(body?.id);
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const existing = await fetchAssessmentById(id);
    if (!existing) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    if (Number(existing.patient_id) !== Number(patientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (Number(existing.created_by_user_id ?? 0) !== Number(authResult.id)) {
      return NextResponse.json({ error: 'You can only edit your own check-ins' }, { status: 403 });
    }

    const latestId = await fetchLatestAssessmentIdForCreator(patientId, Number(existing.clinical_parameter_id), authResult.id);
    if (!latestId || latestId !== id) {
      return NextResponse.json({ error: 'Only the latest check-in can be edited' }, { status: 403 });
    }

    const parameter = await fetchClinicalParameterById(Number(existing.clinical_parameter_id));
    if (!parameter) return NextResponse.json({ error: 'Clinical parameter not found' }, { status: 404 });
    if (!parameter.allow_self_monitoring) {
      return NextResponse.json({ error: 'Self monitoring is not enabled for this parameter' }, { status: 403 });
    }

    const measuredAt = normalizeMeasuredAt(body?.measured_at);
    const value = typeof body?.value === 'string' ? body.value : String(body?.value ?? '');
    const notes = typeof body?.notes === 'string' ? body.notes : null;
    if (!measuredAt || !value.trim()) {
      return NextResponse.json({ error: 'value and measured_at are required' }, { status: 400 });
    }

    await updateAssessment(id, {
      clinical_parameter_id: existing.clinical_parameter_id,
      value: value.trim(),
      notes,
      is_normal: existing.is_normal ?? null,
      measured_at: measuredAt,
    });

    return NextResponse.json({
      ...existing,
      value: value.trim(),
      notes,
      measured_at: measuredAt,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update assessment' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const authResult = await authorizeApiRequest();
    if (authResult instanceof NextResponse) return authResult;
    if (!isPatientRole(authResult.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const patientId = authResult.patientId;
    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found for this account' }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get('id'));
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const existing = await fetchAssessmentById(id);
    if (!existing) return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
    if (Number(existing.patient_id) !== Number(patientId)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (Number(existing.created_by_user_id ?? 0) !== Number(authResult.id)) {
      return NextResponse.json({ error: 'You can only delete your own check-ins' }, { status: 403 });
    }

    const latestId = await fetchLatestAssessmentIdForCreator(patientId, Number(existing.clinical_parameter_id), authResult.id);
    if (!latestId || latestId !== id) {
      return NextResponse.json({ error: 'Only the latest check-in can be deleted' }, { status: 403 });
    }

    const parameter = await fetchClinicalParameterById(Number(existing.clinical_parameter_id));
    if (!parameter) return NextResponse.json({ error: 'Clinical parameter not found' }, { status: 404 });
    if (!parameter.allow_self_monitoring) {
      return NextResponse.json({ error: 'Self monitoring is not enabled for this parameter' }, { status: 403 });
    }

    await deleteAssessment(id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete assessment' }, { status: 500 });
  }
}
