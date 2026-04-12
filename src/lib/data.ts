import { db } from './db';
import crypto from 'crypto';
import type { 
    Patient, 
    User, 
    Corporate, 
    ClinicalParameter, 
    Assessment, 
    Goal, 
    Medication, 
    Prescription, 
    Appointment, 
    Review, 
    Partner,
    Clinic,
    Diagnosis,
    PatientOnboardingPayload,
    PasswordResetToken,
    RegistryInsights,
    InsightsDeepDive,
    InsightsMemberMetricsPage
} from './types';
import { unstable_noStore as noStore } from 'next/cache';
import { isPartnerRole, isPatientRole } from '@/lib/role-utils';

/**
 * Aggressive serialization helper for Next.js 15.
 * Recursively converts non-serializable MySQL types (BigInt, Date) into plain JSON-safe types.
 */
function serialize<T>(obj: T): T {
    if (obj === null || obj === undefined) return obj;
    return JSON.parse(JSON.stringify(obj, (key, value) => {
        if (typeof value === 'bigint') return Number(value);
        if (value instanceof Date) return value.toISOString();
        return value;
    }));
}

function toSqlDateTime(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    // If we get a date-only string, preserve the exact day (avoid timezone shifting).
    if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return `${date} 00:00:00`;
    }
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function toSqlDate(date: string | Date | null | undefined): string | null {
    if (!date) return null;
    const d = new Date(date);
    if (isNaN(d.getTime())) return null;
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function calculatePatientStats(patient: any) {
    const totalGoals = Number(patient.total_goals || 0);
    const activeGoals = Number(patient.active_goals || 0);
    const totalAssessments = Number(patient.total_assessments || 0);
    const overdueGoals = Number(patient.overdue_goals || 0);
    const upcomingAppointments = Number(patient.upcoming_appointments || 0);
    return {
        totalGoals,
        activeGoals,
        totalAssessments,
        assessmentCoverage: totalGoals > 0 ? Math.round((totalAssessments / totalGoals) * 100) : 0,
        needsAttention: patient.status === 'Critical' || (totalGoals > 0 && totalAssessments === 0),
        overdueGoals,
        upcomingAppointments,
    };
}

function buildPatientScopeClause(requestingUser?: User, alias = '') {
    const prefix = alias ? `${alias}.` : '';

    if (!requestingUser) {
        return { clause: '', params: [] as any[] };
    }

    if (isPatientRole(requestingUser.role)) {
        return {
            clause: ` AND ${prefix}user_id = ? `,
            params: [requestingUser.id],
        };
    }

    if (!isPartnerRole(requestingUser.role)) {
        return { clause: '', params: [] as any[] };
    }

    if (requestingUser.partner_type === 'clinic' && requestingUser.partner_clinic_id) {
        return {
            clause: ` AND ${prefix}clinic_id = ? `,
            params: [requestingUser.partner_clinic_id],
        };
    }

    if (requestingUser.partner_id) {
        return {
            clause: ` AND ${prefix}partner_id = ? `,
            params: [requestingUser.partner_id],
        };
    }

    return { clause: '', params: [] as any[] };
}

export async function canAccessPatientById(patientId: number | string, requestingUser?: User): Promise<boolean> {
    noStore();
    try {
        const scope = buildPatientScopeClause(requestingUser, 'p');
        const [rows] = await db.query(
            `
            SELECT p.id
            FROM patients p
            WHERE p.id = ? AND p.deleted_at IS NULL
            ${scope.clause}
            LIMIT 1
            `,
            [String(patientId), ...scope.params]
        );
        return Boolean((rows as any[])[0]?.id);
    } catch {
        return false;
    }
}

export async function fetchPatients(requestingUser?: User, organizationPartnerId?: number | null): Promise<Patient[]> {
    noStore();
    try {
        const scope = buildPatientScopeClause(requestingUser, 'p');
        let query = `
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   pay.partner_type as partner_type,
                   cl.name as clinic_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deadline < CURDATE() AND g.deleted_at IS NULL) as overdue_goals,
                   (SELECT COUNT(*) FROM appointments a WHERE a.patient_id = p.id AND a.appointment_date >= NOW() AND a.status IN ('scheduled','confirmed','rescheduled') AND a.deleted_at IS NULL) as upcoming_appointments,
                   (
                      SELECT a.appointment_date
                      FROM appointments a
                      WHERE
                        a.patient_id = p.id
                        AND a.appointment_date >= NOW()
                        AND a.status IN ('scheduled','confirmed','rescheduled')
                        AND a.deleted_at IS NULL
                      ORDER BY a.appointment_date ASC
                      LIMIT 1
                   ) as next_appointment_date
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE p.deleted_at IS NULL
        `;
        const params: any[] = [...scope.params];
        query += scope.clause;

        if (organizationPartnerId) {
            const [orgRows] = await db.query(
                'SELECT id, partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
                [organizationPartnerId]
            );
            const org = (orgRows as any[])[0];
            if (org) {
                if (org.partner_type === 'clinic' && org.clinic_id) {
                    query += ` AND p.clinic_id = ? `;
                    params.push(org.clinic_id);
                } else {
                    query += ` AND p.partner_id = ? `;
                    params.push(org.id);
                }
            }
        }
        query += ` ORDER BY p.created_at DESC `;
        const [rows] = await db.query(query, params);
        const mapped = (rows as any[]).map(p => ({ 
            ...p, 
            assessments: [], 
            goals: [], 
            prescriptions: [], 
            appointments: [], 
            reviews: [], 
            stats: calculatePatientStats(p) 
        }));
        return serialize(mapped);
    } catch (error) {
        console.error('fetchPatients Error:', error);
        throw new Error('Failed to fetch patients.');
    }
}

export async function fetchRegistryInsights(requestingUser?: User, organizationPartnerId?: number | null): Promise<RegistryInsights> {
    noStore();
    const scope = buildPatientScopeClause(requestingUser, 'p');
    let orgClause = '';
    const orgParams: any[] = [];

    if (organizationPartnerId) {
        const [orgRows] = await db.query(
            'SELECT id, partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [organizationPartnerId]
        );
        const org = (orgRows as any[])[0];
        if (org) {
            if (org.partner_type === 'clinic' && org.clinic_id) {
                orgClause = ' AND p.clinic_id = ? ';
                orgParams.push(org.clinic_id);
            } else {
                orgClause = ' AND p.partner_id = ? ';
                orgParams.push(org.id);
            }
        }
    }

    try {
        const [upcomingAppointmentsRows] = await db.query(
            `
            SELECT
                p.id as patient_id,
                CONCAT_WS(' ', p.first_name, p.surname) as patient_name,
                pay.name as partner_name,
                cl.name as clinic_name,
                a.title,
                a.appointment_date,
                a.status
            FROM appointments a
            INNER JOIN patients p ON a.patient_id = p.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE
                a.deleted_at IS NULL
                AND p.deleted_at IS NULL
                AND p.status <> 'Pending'
                ${scope.clause}
                ${orgClause}
                AND a.appointment_date >= NOW()
                AND a.status IN ('scheduled', 'confirmed', 'rescheduled')
            ORDER BY a.appointment_date ASC
            LIMIT 8
            `,
            [...scope.params, ...orgParams]
        );

        const [needsAttentionRows] = await db.query(
            `
            SELECT
                p.id as patient_id,
                CONCAT_WS(' ', p.first_name, p.surname) as patient_name,
                p.status,
                (
                    SELECT COUNT(*)
                    FROM goals g
                    WHERE
                        g.patient_id = p.id
                        AND g.status = 'active'
                        AND g.deadline < CURDATE()
                        AND g.deleted_at IS NULL
                ) as overdue_goals,
                (
                    SELECT MAX(a.measured_at)
                    FROM assessments a
                    WHERE a.patient_id = p.id AND a.deleted_at IS NULL
                ) as last_assessment_at
            FROM patients p
            WHERE
                p.deleted_at IS NULL
                AND p.status <> 'Pending'
                ${scope.clause}
                ${orgClause}
                AND (
                    p.status = 'Critical'
                    OR EXISTS (
                        SELECT 1
                        FROM goals g
                        WHERE
                            g.patient_id = p.id
                            AND g.status = 'active'
                            AND g.deadline < CURDATE()
                            AND g.deleted_at IS NULL
                    )
                    OR (
                        SELECT MAX(a.measured_at)
                        FROM assessments a
                        WHERE a.patient_id = p.id AND a.deleted_at IS NULL
                    ) IS NULL
                    OR (
                        SELECT MAX(a.measured_at)
                        FROM assessments a
                        WHERE a.patient_id = p.id AND a.deleted_at IS NULL
                    ) < DATE_SUB(NOW(), INTERVAL 14 DAY)
                )
            ORDER BY
                (p.status = 'Critical') DESC,
                overdue_goals DESC,
                last_assessment_at ASC
            LIMIT 8
            `,
            [...scope.params, ...orgParams]
        );

        const [leastInteractionRows] = await db.query(
            `
            SELECT
                p.id as patient_id,
                CONCAT_WS(' ', p.first_name, p.surname) as patient_name,
                pay.name as partner_name,
                cl.name as clinic_name,
                (
                    SELECT COUNT(*)
                    FROM goals g
                    WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL
                ) as active_goals,
                (
                    SELECT COUNT(*)
                    FROM assessments a
                    WHERE
                        a.patient_id = p.id
                        AND a.measured_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
                        AND a.deleted_at IS NULL
                ) as assessments_30d,
                (
                    SELECT MAX(a.measured_at)
                    FROM assessments a
                    WHERE a.patient_id = p.id AND a.deleted_at IS NULL
                ) as last_assessment_at
            FROM patients p
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE
                p.deleted_at IS NULL
                AND p.status <> 'Pending'
                ${scope.clause}
                ${orgClause}
                AND (
                    SELECT COUNT(*)
                    FROM goals g
                    WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL
                ) > 0
            ORDER BY
                assessments_30d ASC,
                last_assessment_at ASC
            LIMIT 8
            `,
            [...scope.params, ...orgParams]
        );

        return serialize({
            upcomingAppointments: (upcomingAppointmentsRows as any[]).map((row) => ({
                patient_id: Number(row.patient_id),
                patient_name: row.patient_name,
                partner_name: row.partner_name ?? null,
                clinic_name: row.clinic_name ?? null,
                title: row.title,
                appointment_date: row.appointment_date,
                status: row.status,
            })),
            needsAttention: (needsAttentionRows as any[]).map((row) => ({
                patient_id: Number(row.patient_id),
                patient_name: row.patient_name,
                status: row.status,
                overdue_goals: Number(row.overdue_goals || 0),
                last_assessment_at: row.last_assessment_at ?? null,
            })),
            leastInteraction: (leastInteractionRows as any[]).map((row) => ({
                patient_id: Number(row.patient_id),
                patient_name: row.patient_name,
                partner_name: row.partner_name ?? null,
                clinic_name: row.clinic_name ?? null,
                active_goals: Number(row.active_goals || 0),
                assessments_30d: Number(row.assessments_30d || 0),
                last_assessment_at: row.last_assessment_at ?? null,
            })),
        });
    } catch (error) {
        console.error('fetchRegistryInsights Error:', error);
        return { upcomingAppointments: [], needsAttention: [], leastInteraction: [] };
    }
}

export async function fetchInsightsDeepDive(
  requestingUser?: User,
  organizationPartnerId?: number | null
): Promise<InsightsDeepDive> {
  noStore();

  try {
    // Keep filtering consistent with fetchDashboardStats/fetchRegistryInsights.
    const scope = buildPatientScopeClause(requestingUser, 'p');
    let patientFilter = scope.clause;
    const patientParams = [...scope.params];

    if (organizationPartnerId) {
      const [orgRows] = await db.query(
        'SELECT id, partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [organizationPartnerId]
      );
      const org = (orgRows as any[])[0];
      if (org) {
        if (org.partner_type === 'clinic' && org.clinic_id) {
          patientFilter += ' AND p.clinic_id = ?';
          patientParams.push(org.clinic_id);
        } else {
          patientFilter += ' AND p.partner_id = ?';
          patientParams.push(org.id);
        }
      }
    }

    const scopedPatientsSubquery = `SELECT p.id FROM patients p WHERE p.deleted_at IS NULL ${patientFilter}`;

    const [
      activeMembersRows,
      membersWithActiveGoalsRows,
      activeGoalsRows,
      overdueGoalsRows,
      completedGoalsRows,
      assessments7dRows,
      assessments30dRows,
      reviews30dRows,
      activePrescriptionsRows,
      topParametersRows,
      offTrackRows,
    ] = await Promise.all([
      db.query(
        `SELECT COUNT(*) as count FROM patients p WHERE p.deleted_at IS NULL AND p.status <> 'Pending' ${patientFilter}`,
        patientParams
      ),
      db.query(
        `SELECT COUNT(DISTINCT g.patient_id) as count FROM goals g WHERE g.deleted_at IS NULL AND g.status = 'active' AND g.patient_id IN (${scopedPatientsSubquery})`,
        patientParams
      ),
      db.query(
        `SELECT COUNT(*) as count FROM goals g WHERE g.deleted_at IS NULL AND g.status = 'active' AND g.patient_id IN (${scopedPatientsSubquery})`,
        patientParams
      ),
      db.query(
        `SELECT COUNT(*) as count FROM goals g WHERE g.deleted_at IS NULL AND g.status = 'active' AND g.deadline < CURDATE() AND g.patient_id IN (${scopedPatientsSubquery})`,
        patientParams
      ),
      db.query(
        `SELECT COUNT(*) as count FROM goals g WHERE g.deleted_at IS NULL AND g.status = 'completed' AND g.patient_id IN (${scopedPatientsSubquery})`,
        patientParams
      ),
      db.query(
        `
        SELECT COUNT(*) as count
        FROM assessments a
        JOIN patients p ON p.id = a.patient_id
        WHERE a.deleted_at IS NULL
          AND p.deleted_at IS NULL
          ${patientFilter}
          AND a.measured_at >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)
        `,
        patientParams
      ),
      db.query(
        `
        SELECT COUNT(*) as count
        FROM assessments a
        JOIN patients p ON p.id = a.patient_id
        WHERE a.deleted_at IS NULL
          AND p.deleted_at IS NULL
          ${patientFilter}
          AND a.measured_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `,
        patientParams
      ),
      db.query(
        `
        SELECT COUNT(*) as count
        FROM reviews r
        JOIN patients p ON p.id = r.patient_id
        WHERE r.deleted_at IS NULL
          AND p.deleted_at IS NULL
          ${patientFilter}
          AND r.review_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        `,
        patientParams
      ),
      db.query(
        `
        SELECT COUNT(*) as count
        FROM prescriptions pr
        JOIN patients p ON p.id = pr.patient_id
        WHERE pr.deleted_at IS NULL
          AND p.deleted_at IS NULL
          ${patientFilter}
          AND pr.status = 'active'
        `,
        patientParams
      ),
      db.query(
        `
        SELECT cp.name as parameter_name, COUNT(*) as total
        FROM assessments a
        JOIN patients p ON p.id = a.patient_id
        JOIN clinical_parameters cp ON cp.id = a.clinical_parameter_id
        WHERE a.deleted_at IS NULL
          AND p.deleted_at IS NULL
          AND cp.deleted_at IS NULL
          ${patientFilter}
          AND a.measured_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
        GROUP BY cp.id
        ORDER BY total DESC
        LIMIT 8
        `,
        patientParams
      ),
      db.query(
        `
        SELECT
          p.id as patient_id,
          CONCAT_WS(' ', p.first_name, p.surname) as patient_name,
          SUM(
            CASE
              WHEN cp.type = 'numeric'
                AND a.id IS NOT NULL
                AND NOT (
                  (g.target_operator = '<'  AND CAST(a.value AS DECIMAL(10,4)) <  CAST(g.target_value AS DECIMAL(10,4))) OR
                  (g.target_operator = '<=' AND CAST(a.value AS DECIMAL(10,4)) <= CAST(g.target_value AS DECIMAL(10,4))) OR
                  (g.target_operator = '='  AND CAST(a.value AS DECIMAL(10,4)) =  CAST(g.target_value AS DECIMAL(10,4))) OR
                  (g.target_operator = '>=' AND CAST(a.value AS DECIMAL(10,4)) >= CAST(g.target_value AS DECIMAL(10,4))) OR
                  (g.target_operator = '>'  AND CAST(a.value AS DECIMAL(10,4)) >  CAST(g.target_value AS DECIMAL(10,4)))
                )
              THEN 1
              ELSE 0
            END
          ) as off_target_goals,
          COUNT(*) as total_active_goals,
          MAX(a.measured_at) as last_assessment_at
        FROM patients p
        JOIN goals g
          ON g.patient_id = p.id
         AND g.deleted_at IS NULL
         AND g.status = 'active'
        JOIN clinical_parameters cp
          ON cp.id = g.clinical_parameter_id
         AND cp.deleted_at IS NULL
        LEFT JOIN (
          SELECT patient_id, clinical_parameter_id, MAX(measured_at) as max_measured_at
          FROM assessments
          WHERE deleted_at IS NULL
          GROUP BY patient_id, clinical_parameter_id
        ) la
          ON la.patient_id = p.id
         AND la.clinical_parameter_id = g.clinical_parameter_id
        LEFT JOIN assessments a
          ON a.patient_id = la.patient_id
         AND a.clinical_parameter_id = la.clinical_parameter_id
         AND a.measured_at = la.max_measured_at
         AND a.deleted_at IS NULL
        WHERE p.deleted_at IS NULL
          AND p.status <> 'Pending'
          ${patientFilter}
        GROUP BY p.id
        HAVING off_target_goals > 0
        ORDER BY off_target_goals DESC, last_assessment_at ASC
        LIMIT 8
        `,
        patientParams
      ),
    ]);

    const activeMembers = Number((activeMembersRows as any)[0]?.[0]?.count ?? 0);
    const membersWithActiveGoals = Number((membersWithActiveGoalsRows as any)[0]?.[0]?.count ?? 0);

    return serialize({
      totals: {
        activeMembers,
        membersWithActiveGoals,
        membersWithNoActiveGoals: Math.max(0, activeMembers - membersWithActiveGoals),
        activeGoals: Number((activeGoalsRows as any)[0]?.[0]?.count ?? 0),
        overdueGoals: Number((overdueGoalsRows as any)[0]?.[0]?.count ?? 0),
        completedGoals: Number((completedGoalsRows as any)[0]?.[0]?.count ?? 0),
        assessments7d: Number((assessments7dRows as any)[0]?.[0]?.count ?? 0),
        assessments30d: Number((assessments30dRows as any)[0]?.[0]?.count ?? 0),
        reviews30d: Number((reviews30dRows as any)[0]?.[0]?.count ?? 0),
        activePrescriptions: Number((activePrescriptionsRows as any)[0]?.[0]?.count ?? 0),
      },
      topParameters30d: (topParametersRows as any)[0].map((row: any) => ({
        parameter_name: row.parameter_name,
        total: Number(row.total),
      })),
      offTrackMembers: (offTrackRows as any)[0].map((row: any) => ({
        patient_id: Number(row.patient_id),
        patient_name: row.patient_name,
        off_target_goals: Number(row.off_target_goals),
        total_active_goals: Number(row.total_active_goals),
        last_assessment_at: row.last_assessment_at ?? null,
      })),
    });
  } catch (error) {
    console.error('fetchInsightsDeepDive Error:', error);
    return {
      totals: {
        activeMembers: 0,
        membersWithActiveGoals: 0,
        membersWithNoActiveGoals: 0,
        activeGoals: 0,
        overdueGoals: 0,
        completedGoals: 0,
        assessments7d: 0,
        assessments30d: 0,
        reviews30d: 0,
        activePrescriptions: 0,
      },
      topParameters30d: [],
      offTrackMembers: [],
    };
  }
}

export async function fetchInsightsMemberMetricsPage(
  requestingUser?: User,
  organizationPartnerId?: number | null,
  page = 1,
  pageSize = 5
): Promise<InsightsMemberMetricsPage> {
  noStore();

  const safePage = Number.isFinite(page) ? Math.max(1, Math.floor(page)) : 1;
  const safePageSize = Number.isFinite(pageSize) ? Math.max(1, Math.min(20, Math.floor(pageSize))) : 5;
  const offset = (safePage - 1) * safePageSize;

  try {
    const scope = buildPatientScopeClause(requestingUser, 'p');
    let patientFilter = scope.clause;
    const patientParams = [...scope.params];

    if (organizationPartnerId) {
      const [orgRows] = await db.query(
        'SELECT id, partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
        [organizationPartnerId]
      );
      const org = (orgRows as any[])[0];
      if (org) {
        if (org.partner_type === 'clinic' && org.clinic_id) {
          patientFilter += ' AND p.clinic_id = ?';
          patientParams.push(org.clinic_id);
        } else {
          patientFilter += ' AND p.partner_id = ?';
          patientParams.push(org.id);
        }
      }
    }

    const [totalRows] = await db.query(
      `SELECT COUNT(*) as count FROM patients p WHERE p.deleted_at IS NULL AND p.status <> 'Pending' ${patientFilter}`,
      patientParams
    );
    const total = Number((totalRows as any[])[0]?.count ?? 0);

    const [rows] = await db.query(
      `
      SELECT
        p.id as patient_id,
        CONCAT_WS(' ', p.first_name, p.surname) as patient_name,
        p.status,
        (
          SELECT COUNT(*)
          FROM goals g
          WHERE
            g.patient_id = p.id
            AND g.status = 'active'
            AND g.deadline < CURDATE()
            AND g.deleted_at IS NULL
        ) as overdue_goals,
        (
          SELECT MAX(a.measured_at)
          FROM assessments a
          WHERE a.patient_id = p.id AND a.deleted_at IS NULL
        ) as last_assessment_at,
        (
          SELECT COUNT(*)
          FROM assessments a
          WHERE
            a.patient_id = p.id
            AND a.measured_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
            AND a.deleted_at IS NULL
        ) as assessments_30d,
        (
          SELECT a.appointment_date
          FROM appointments a
          WHERE
            a.patient_id = p.id
            AND a.deleted_at IS NULL
            AND a.appointment_date >= NOW()
            AND a.status IN ('scheduled','confirmed','rescheduled')
          ORDER BY a.appointment_date ASC
          LIMIT 1
        ) as next_appointment_at,
        (
          SELECT a.status
          FROM appointments a
          WHERE
            a.patient_id = p.id
            AND a.deleted_at IS NULL
            AND a.appointment_date >= NOW()
            AND a.status IN ('scheduled','confirmed','rescheduled')
          ORDER BY a.appointment_date ASC
          LIMIT 1
        ) as next_appointment_status,
        (
          SELECT COUNT(*)
          FROM goals g
          JOIN clinical_parameters cp ON cp.id = g.clinical_parameter_id AND cp.deleted_at IS NULL
          WHERE
            g.patient_id = p.id
            AND g.deleted_at IS NULL
            AND g.status = 'active'
            AND cp.type = 'numeric'
        ) as total_numeric_goals,
        (
          SELECT SUM(
            CASE
              WHEN a2.id IS NULL THEN 0
              WHEN NOT (
                (g.target_operator = '<'  AND CAST(a2.value AS DECIMAL(10,4)) <  CAST(g.target_value AS DECIMAL(10,4))) OR
                (g.target_operator = '<=' AND CAST(a2.value AS DECIMAL(10,4)) <= CAST(g.target_value AS DECIMAL(10,4))) OR
                (g.target_operator = '='  AND CAST(a2.value AS DECIMAL(10,4)) =  CAST(g.target_value AS DECIMAL(10,4))) OR
                (g.target_operator = '>=' AND CAST(a2.value AS DECIMAL(10,4)) >= CAST(g.target_value AS DECIMAL(10,4))) OR
                (g.target_operator = '>'  AND CAST(a2.value AS DECIMAL(10,4)) >  CAST(g.target_value AS DECIMAL(10,4)))
              )
              THEN 1
              ELSE 0
            END
          )
          FROM goals g
          JOIN clinical_parameters cp ON cp.id = g.clinical_parameter_id AND cp.deleted_at IS NULL
          LEFT JOIN (
            SELECT patient_id, clinical_parameter_id, MAX(measured_at) as max_measured_at
            FROM assessments
            WHERE deleted_at IS NULL
            GROUP BY patient_id, clinical_parameter_id
          ) la
            ON la.patient_id = g.patient_id
           AND la.clinical_parameter_id = g.clinical_parameter_id
          LEFT JOIN assessments a2
            ON a2.patient_id = la.patient_id
           AND a2.clinical_parameter_id = la.clinical_parameter_id
           AND a2.measured_at = la.max_measured_at
           AND a2.deleted_at IS NULL
          WHERE
            g.patient_id = p.id
            AND g.deleted_at IS NULL
            AND g.status = 'active'
            AND cp.type = 'numeric'
        ) as off_target_numeric_goals
      FROM patients p
      WHERE
        p.deleted_at IS NULL
        AND p.status <> 'Pending'
        ${patientFilter}
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
      `,
      [...patientParams, safePageSize, offset]
    );

    return serialize({
      total,
      page: safePage,
      pageSize: safePageSize,
      rows: (rows as any[]).map((row) => ({
        patient_id: Number(row.patient_id),
        patient_name: row.patient_name,
        status: row.status,
        overdue_goals: Number(row.overdue_goals || 0),
        last_assessment_at: row.last_assessment_at ?? null,
        assessments_30d: Number(row.assessments_30d || 0),
        next_appointment_at: row.next_appointment_at ?? null,
        next_appointment_status: row.next_appointment_status ?? null,
        off_target_numeric_goals: Number(row.off_target_numeric_goals || 0),
        total_numeric_goals: Number(row.total_numeric_goals || 0),
      })),
    });
  } catch (error) {
    console.error('fetchInsightsMemberMetricsPage Error:', error);
    return { total: 0, page: safePage, pageSize: safePageSize, rows: [] };
  }
}

export async function fetchPatientById(id: string, requestingUser?: User): Promise<Patient | null> {
    noStore();
    if (!id) return null;
    try {
        const scope = buildPatientScopeClause(requestingUser, 'p');
        const [patientRows] = await db.query(`
            SELECT p.*, 
                   u.name as navigator_name, 
                   pay.name as partner_name,
                   pay.partner_type as partner_type,
                   cl.name as clinic_name,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.deleted_at IS NULL) as total_goals,
                   (SELECT COUNT(*) FROM goals g WHERE g.patient_id = p.id AND g.status = 'active' AND g.deleted_at IS NULL) as active_goals,
                   (SELECT COUNT(*) FROM assessments a WHERE a.patient_id = p.id AND a.deleted_at IS NULL) as total_assessments
            FROM patients p
            LEFT JOIN users u ON p.navigator_id = u.id
            LEFT JOIN partners pay ON p.partner_id = pay.id
            LEFT JOIN clinics cl ON p.clinic_id = cl.id
            WHERE p.id = ? AND p.deleted_at IS NULL
            ${scope.clause}
        `, [id, ...scope.params]);
        
        const patient = (patientRows as any[])[0];
        if (!patient) return null;
        
        const [assessments] = await db.query('SELECT * FROM assessments WHERE patient_id = ? AND deleted_at IS NULL ORDER BY measured_at DESC', [id]);
        const [goals] = await db.query('SELECT * FROM goals WHERE patient_id = ? AND deleted_at IS NULL ORDER BY created_at DESC', [id]);
        const [prescriptions] = await db.query('SELECT pr.*, m.name as medication_name, m.dosage as med_dosage FROM prescriptions pr LEFT JOIN medications m ON pr.medication_id = m.id WHERE pr.patient_id = ? AND pr.deleted_at IS NULL', [id]);
        const [appointments] = await db.query('SELECT a.*, u.name as clinician_name FROM appointments a LEFT JOIN users u ON a.clinician_id = u.id WHERE a.patient_id = ? AND a.deleted_at IS NULL ORDER BY a.appointment_date ASC', [id]);
        const [reviews] = await db.query('SELECT r.*, u.name as reviewed_by FROM reviews r LEFT JOIN users u ON r.reviewed_by_id = u.id WHERE r.patient_id = ? AND r.deleted_at IS NULL ORDER BY r.review_date DESC', [id]);
        
        const basePatient = {
            ...patient,
            assessments: assessments as Assessment[],
            goals: goals as Goal[],
            prescriptions: (prescriptions as any[]).map(p => ({ 
                ...p, 
                medication: { id: p.medication_id, name: p.medication_name, dosage: p.med_dosage } 
            })),
            appointments: (appointments as any[]).map(a => ({ 
                ...a, 
                clinician: { id: a.clinician_id, name: a.clinician_name } 
            })),
            reviews: (reviews as any[]).map(r => ({ 
                ...r, 
                reviewed_by: r.reviewed_by 
            })),
        };
        
        return serialize({ ...basePatient, stats: calculatePatientStats(basePatient) });
    } catch (error) {
        console.error('fetchPatientById Error:', error);
        throw new Error('Failed to fetch patient details.');
    }
}

export async function fetchPatientByUserId(userId: number): Promise<Patient | null> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM patients WHERE user_id = ? AND deleted_at IS NULL', [userId]);
        const patient = (rows as any[])[0];
        if (!patient) return null;
        return serialize(patient as Patient);
    } catch (error) {
        console.error('fetchPatientByUserId Error:', error);
        return null;
    }
}

export async function fetchUserById(id: number): Promise<User | null> {
    noStore();
    try {
        const [rows] = await db.query(
            `
            SELECT
                u.id,
                u.name,
                u.phone,
                u.email,
                u.role,
                u.avatarUrl,
                u.partner_id,
                u.must_change_password,
                u.password_changed_at,
                u.failed_login_attempts,
                u.locked_until,
                u.last_login_at,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.id = ? AND u.deleted_at IS NULL
            LIMIT 1
            `,
            [id]
        );

        const user = (rows as User[])[0];
        return user ? serialize(user) : null;
    } catch (error) {
        console.error('fetchUserById Error:', error);
        return null;
    }
}

export async function fetchUsers(): Promise<User[]> {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.id,
                u.name,
                u.phone,
                u.email,
                u.role,
                u.avatarUrl,
                u.partner_id,
                u.must_change_password,
                u.password_changed_at,
                u.failed_login_attempts,
                u.locked_until,
                u.last_login_at,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.deleted_at IS NULL
            ORDER BY u.name ASC
        `);
        return serialize(rows as User[]);
    } catch (error) {
        throw new Error('Failed to fetch users.');
    }
}

export async function fetchPartners(partnerType?: Partner['partner_type']): Promise<Partner[]> {
    noStore();
    try {
        const params: any[] = [];
        let query = `
            SELECT
                p.*,
                c.name as clinic_name
            FROM partners p
            LEFT JOIN clinics c ON p.clinic_id = c.id
            WHERE p.deleted_at IS NULL
        `;

        if (partnerType) {
            query += ' AND p.partner_type = ?';
            params.push(partnerType);
        }

        query += ' ORDER BY p.name ASC';
        const [rows] = await db.query(query, params);
        return serialize(rows as Partner[]);
    } catch (error) {
        throw new Error('Failed to fetch partners.');
    }
}

export async function fetchClinics(): Promise<Clinic[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinics WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Clinic[]);
    } catch (error) {
        console.error('fetchClinics Error:', error);
        return [];
    }
}

export async function fetchDiagnoses(): Promise<Diagnosis[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM diagnoses WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Diagnosis[]);
    } catch (error) {
        console.error('fetchDiagnoses Error:', error);
        return [];
    }
}

export async function fetchCorporates(): Promise<Corporate[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT id, name, created_at as wellness_date FROM partners WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Corporate[]);
    } catch (error) {
        throw new Error('Failed to fetch corporates.');
    }
}

export async function fetchClinicalParameters(): Promise<ClinicalParameter[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters WHERE deleted_at IS NULL ORDER BY name ASC');
        const parameters = (rows as any[]).map(p => ({
            ...p,
            options: typeof p.options === 'string' ? JSON.parse(p.options) : (p.options || []),
            allow_self_monitoring: Boolean(p.allow_self_monitoring),
        }));
        return serialize(parameters as ClinicalParameter[]);
    } catch (error) {
        throw new Error('Failed to fetch parameters.');
    }
}

export async function fetchClinicalParameterById(id: number): Promise<ClinicalParameter | null> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM clinical_parameters WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
        const row = (rows as any[])[0];
        if (!row) return null;
        const parameter = {
            ...row,
            options: typeof row.options === 'string' ? JSON.parse(row.options) : (row.options || []),
            allow_self_monitoring: Boolean(row.allow_self_monitoring),
        };
        return serialize(parameter as ClinicalParameter);
    } catch (error) {
        return null;
    }
}

export async function fetchMedications(): Promise<Medication[]> {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM medications WHERE deleted_at IS NULL ORDER BY name ASC');
        return serialize(rows as Medication[]);
    } catch (error) {
        throw new Error('Failed to fetch medications.');
    }
}

export async function getUserByEmail(email: string) {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.*,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.email = ? AND u.deleted_at IS NULL
        `, [email]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function getUserByPhone(phone: string) {
    noStore();
    try {
        const [rows] = await db.query(`
            SELECT
                u.*,
                p.name as partner_name,
                p.partner_type,
                p.clinic_id as partner_clinic_id
            FROM users u
            LEFT JOIN partners p ON u.partner_id = p.id
            WHERE u.phone = ? AND u.deleted_at IS NULL
            LIMIT 1
        `, [phone]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function createUser(userData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO users (name, phone, email, password, role, avatarUrl, partner_id, must_change_password, password_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [
            userData.name,
            userData.phone ?? null,
            userData.email,
            userData.password,
            userData.role || 'user',
            userData.avatarUrl || null,
            userData.partner_id || null,
            userData.must_change_password ?? true,
            userData.password_changed_at ?? null
        ]
    );
    return Number((result as any).insertId);
}

export async function createUserAndPatientOnboardingRecord(
    userData: any,
    patientIdentifier: string,
    patientData: PatientOnboardingPayload
): Promise<{ userId: number; patientId: number }> {
    const conn = await db.getConnection();
    try {
        await conn.beginTransaction();

        const [userResult] = await conn.query(
            'INSERT INTO users (name, phone, email, password, role, avatarUrl, partner_id, must_change_password, password_changed_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
                userData.name,
                userData.phone ?? null,
                userData.email,
                userData.password,
                userData.role || 'user',
                userData.avatarUrl || null,
                userData.partner_id || null,
                userData.must_change_password ?? true,
                userData.password_changed_at ?? null
            ]
        );
        const userId = Number((userResult as any).insertId);

        const selectedPartnerId = patientData.partner_id ?? patientData.payer_id ?? null;
        let resolvedClinicId = patientData.clinic_id ?? null;

        if (selectedPartnerId) {
            const [partnerRows] = await conn.query(
                'SELECT partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
                [selectedPartnerId]
            );
            const selectedPartner = (partnerRows as any[])[0];

            if (selectedPartner?.partner_type === 'clinic') {
                resolvedClinicId = selectedPartner.clinic_id ?? resolvedClinicId;
            }
        }

        const [patientResult] = await conn.query(
            `INSERT INTO patients (
                user_id,
                patient_identifier,
                portal_username,
                first_name,
                middle_name,
                surname,
                dob,
                gender,
                email,
                phone,
                address,
                status,
                date_of_onboarding,
                clinic_id,
                partner_id,
                primary_diagnosis_id,
                comorbid_conditions,
                current_medications_summary,
                allergies_intolerances,
                past_medical_history,
                surgical_history,
                family_history,
                social_history,
                emergency_contact_name,
                emergency_contact_phone,
                emergency_contact_relation,
                emergency_contact_email,
                policy_number,
                coverage_limits,
                pre_authorization_status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                userId,
                patientIdentifier,
                patientData.portal_username ?? patientData.email,
                patientData.first_name,
                patientData.middle_name ?? null,
                patientData.surname,
                toSqlDate(patientData.dob),
                patientData.gender,
                patientData.email,
                patientData.phone,
                patientData.address ?? null,
                resolvedClinicId,
                selectedPartnerId,
                patientData.primary_diagnosis_id ?? null,
                patientData.comorbid_conditions ?? null,
                patientData.current_medications_summary ?? null,
                patientData.allergies_intolerances ?? null,
                patientData.past_medical_history ?? null,
                patientData.surgical_history ?? null,
                patientData.family_history ?? null,
                patientData.social_history ?? null,
                patientData.emergency_contact_name,
                patientData.emergency_contact_phone,
                patientData.emergency_contact_relation,
                patientData.emergency_contact_email ?? null,
                patientData.policy_number ?? null,
                patientData.coverage_limits ?? null,
                patientData.pre_authorization_status ?? 'Not Required',
            ]
        );

        const patientId = Number((patientResult as any).insertId);

        await conn.commit();
        return { userId, patientId };
    } catch (error) {
        try {
            await conn.rollback();
        } catch { /* ignore */ }
        throw error;
    } finally {
        conn.release();
    }
}

export async function updateUser(id: number, userData: Partial<User> & { password?: string }): Promise<void> {
    if (userData.password) {
        await db.query(
            'UPDATE users SET name = ?, phone = ?, email = ?, role = ?, avatarUrl = ?, partner_id = ?, password = ?, must_change_password = ?, password_changed_at = ? WHERE id = ?',
            [
                userData.name,
                userData.phone ?? null,
                userData.email,
                userData.role,
                userData.avatarUrl || null,
                userData.partner_id || null,
                userData.password,
                userData.must_change_password ?? true,
                userData.password_changed_at ?? null,
                id
            ]
        );
        return;
    }

    await db.query(
        'UPDATE users SET name = ?, phone = ?, email = ?, role = ?, avatarUrl = ?, partner_id = ? WHERE id = ?',
        [userData.name, userData.phone ?? null, userData.email, userData.role, userData.avatarUrl || null, userData.partner_id || null, id]
    );
}

export async function fetchUserAuthById(id: number) {
    noStore();
    try {
        const [rows] = await db.query('SELECT * FROM users WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
        return serialize((rows as any[])[0] || null);
    } catch (error) {
        return null;
    }
}

export async function updateUserPassword(id: number, hashedPassword: string): Promise<void> {
    await db.query(
        'UPDATE users SET password = ?, must_change_password = 0, password_changed_at = NOW() WHERE id = ?',
        [hashedPassword, id]
    );
}

export async function clearPasswordResetTokensForUser(userId: number): Promise<void> {
    await db.query(
        'UPDATE password_reset_tokens SET used_at = COALESCE(used_at, NOW()) WHERE user_id = ? AND used_at IS NULL',
        [userId]
    );
}

export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date): Promise<void> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await clearPasswordResetTokensForUser(userId);
    await db.query(
        'INSERT INTO password_reset_tokens (user_id, token_hash, expires_at) VALUES (?, ?, ?)',
        [userId, tokenHash, toSqlDateTime(expiresAt)]
    );
}

export async function fetchPasswordResetToken(token: string): Promise<PasswordResetToken | null> {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const [rows] = await db.query(
        `SELECT *
         FROM password_reset_tokens
         WHERE token_hash = ?
           AND used_at IS NULL
           AND expires_at > NOW()
         ORDER BY created_at DESC
         LIMIT 1`,
        [tokenHash]
    );
    const record = (rows as PasswordResetToken[])[0];
    return record ? serialize(record) : null;
}

export async function consumePasswordResetToken(id: number): Promise<void> {
    await db.query('UPDATE password_reset_tokens SET used_at = NOW() WHERE id = ? AND used_at IS NULL', [id]);
}

export async function createPatient(patientData: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO patients (user_id, first_name, surname, email, status, partner_id) VALUES (?, ?, ?, ?, ?, ?)',
        [patientData.user_id || null, patientData.first_name, patientData.surname, patientData.email, patientData.status || 'Pending', patientData.partner_id || null]
    );
    return Number((result as any).insertId);
}

export async function createAssessment(data: any): Promise<number> {
    const measuredAt = toSqlDateTime(data.measured_at);
    if (!measuredAt) throw new Error('Invalid date format for assessment.');
    const [result] = await db.query(
        'INSERT INTO assessments (patient_id, clinical_parameter_id, created_by_user_id, value, notes, is_normal, measured_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.clinical_parameter_id, data.created_by_user_id ?? null, data.value, data.notes, data.is_normal, measuredAt]
    );
    return Number((result as any).insertId);
}

export async function updateAssessment(id: number, data: any): Promise<void> {
    const measuredAt = toSqlDateTime(data.measured_at);
    if (!measuredAt) throw new Error('Invalid date format for assessment.');
    await db.query(
        'UPDATE assessments SET clinical_parameter_id = ?, value = ?, notes = ?, is_normal = ?, measured_at = ? WHERE id = ?',
        [data.clinical_parameter_id, data.value, data.notes, data.is_normal, measuredAt, id]
    );
}

export async function fetchAssessmentById(id: number): Promise<Assessment | null> {
    noStore();
    const [rows] = await db.query('SELECT * FROM assessments WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    return serialize((rows as any[])[0] || null);
}

export async function fetchGoalById(id: number): Promise<Goal | null> {
    noStore();
    const [rows] = await db.query('SELECT * FROM goals WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    return serialize((rows as any[])[0] || null);
}

export async function fetchPrescriptionById(id: number): Promise<Prescription | null> {
    noStore();
    const [rows] = await db.query('SELECT * FROM prescriptions WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    return serialize((rows as any[])[0] || null);
}

export async function fetchAppointmentById(id: number): Promise<Appointment | null> {
    noStore();
    const [rows] = await db.query('SELECT * FROM appointments WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    return serialize((rows as any[])[0] || null);
}

export async function fetchReviewById(id: number): Promise<Review | null> {
    noStore();
    const [rows] = await db.query('SELECT * FROM reviews WHERE id = ? AND deleted_at IS NULL LIMIT 1', [id]);
    return serialize((rows as any[])[0] || null);
}

export async function fetchLatestAssessmentIdForCreator(
    patientId: number,
    clinicalParameterId: number,
    createdByUserId: number
): Promise<number | null> {
    noStore();
    const [rows] = await db.query(
        `SELECT id
         FROM assessments
         WHERE patient_id = ?
           AND clinical_parameter_id = ?
           AND created_by_user_id = ?
           AND deleted_at IS NULL
         ORDER BY created_at DESC, id DESC
         LIMIT 1`,
        [patientId, clinicalParameterId, createdByUserId]
    );
    const row = (rows as any[])[0];
    return row ? Number(row.id) : null;
}

export async function createReview(data: any): Promise<number> {
    const [result] = await db.query(
        'INSERT INTO reviews (patient_id, reviewed_by_id, review_date, subjective_findings, objective_findings, assessment, plan, recommendations, follow_up_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
        [data.patient_id, data.reviewed_by_id, toSqlDate(data.review_date), data.subjective_findings, data.objective_findings, data.assessment, data.plan, data.recommendations, toSqlDate(data.follow_up_date)]
    );
    return Number((result as any).insertId);
}

export async function upsertPartner(data: any): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE partners SET name = ?, partner_type = ?, clinic_id = ? WHERE id = ?',
            [data.name, data.partner_type || 'insurance', data.partner_type === 'clinic' ? data.clinic_id ?? null : null, data.id]
        );
        return Number(data.id);
    } else {
        const [existingRows] = await db.query(
            'SELECT id FROM partners WHERE name = ? AND partner_type = ? LIMIT 1',
            [data.name, data.partner_type || 'insurance']
        );
        const existingPartner = (existingRows as any[])[0];

        if (existingPartner) {
            await db.query(
                'UPDATE partners SET clinic_id = ?, deleted_at = NULL WHERE id = ?',
                [data.partner_type === 'clinic' ? data.clinic_id ?? null : null, existingPartner.id]
            );
            return Number(existingPartner.id);
        }

        const [result] = await db.query(
            'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
            [data.name, data.partner_type || 'insurance', data.partner_type === 'clinic' ? data.clinic_id ?? null : null]
        );
        return Number((result as any).insertId);
    }
}

export async function upsertClinic(data: Partial<Clinic>): Promise<number> {
    if (data.id) {
        await db.query('UPDATE clinics SET name = ?, location = ? WHERE id = ?', [data.name, data.location ?? null, data.id]);
        const [partnerRows] = await db.query(
            "SELECT id FROM partners WHERE clinic_id = ? AND partner_type = 'clinic' LIMIT 1",
            [data.id]
        );
        const existingPartner = (partnerRows as any[])[0];

        if (existingPartner) {
            await db.query(
                "UPDATE partners SET name = ?, deleted_at = NULL WHERE id = ?",
                [data.name, existingPartner.id]
            );
        } else {
            await db.query(
                'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
                [data.name, 'clinic', data.id]
            );
        }
        return Number(data.id);
    }

    const [result] = await db.query('INSERT INTO clinics (name, location) VALUES (?, ?)', [data.name, data.location ?? null]);
    const clinicId = Number((result as any).insertId);
    const [existingPartnerRows] = await db.query(
        "SELECT id FROM partners WHERE name = ? AND partner_type = 'clinic' LIMIT 1",
        [data.name]
    );
    const existingPartner = (existingPartnerRows as any[])[0];

    if (existingPartner) {
        await db.query(
            'UPDATE partners SET clinic_id = ?, deleted_at = NULL WHERE id = ?',
            [clinicId, existingPartner.id]
        );
    } else {
        await db.query(
            'INSERT INTO partners (name, partner_type, clinic_id) VALUES (?, ?, ?)',
            [data.name, 'clinic', clinicId]
        );
    }
    return clinicId;
}

export async function upsertDiagnosis(data: Partial<Diagnosis>): Promise<number> {
    if (data.id) {
        await db.query(
            'UPDATE diagnoses SET name = ?, code = ?, description = ? WHERE id = ?',
            [data.name, data.code ?? null, data.description ?? null, data.id]
        );
        return Number(data.id);
    }

    const [result] = await db.query(
        'INSERT INTO diagnoses (name, code, description) VALUES (?, ?, ?)',
        [data.name, data.code ?? null, data.description ?? null]
    );
    return Number((result as any).insertId);
}

export async function upsertMedication(data: any): Promise<number> {
    if (data.id) {
        await db.query('UPDATE medications SET name = ?, dosage = ? WHERE id = ?', [data.name, data.dosage, data.id]);
        return Number(data.id);
    } else {
        const [result] = await db.query('INSERT INTO medications (name, dosage) VALUES (?, ?)', [data.name, data.dosage]);
        return Number((result as any).insertId);
    }
}

export async function upsertClinicalParameter(data: any): Promise<number> {
    const optionsJson = Array.isArray(data.options) ? JSON.stringify(data.options) : null;
    const allowSelfMonitoring = data.allow_self_monitoring ? 1 : 0;
    if (data.id) {
        await db.query(
            'UPDATE clinical_parameters SET name = ?, type = ?, unit = ?, options = ?, category = ?, allow_self_monitoring = ? WHERE id = ?',
            [data.name, data.type, data.unit, optionsJson, data.category, allowSelfMonitoring, data.id]
        );
        return Number(data.id);
    } else {
        const [result] = await db.query(
            'INSERT INTO clinical_parameters (name, type, unit, options, category, allow_self_monitoring) VALUES (?, ?, ?, ?, ?, ?)',
            [data.name, data.type, data.unit, optionsJson, data.category, allowSelfMonitoring]
        );
        return Number((result as any).insertId);
    }
}

export async function recordFailedLoginAttempt(userId: number, nextAttempts: number, lockedUntil: Date | null) {
    await db.query(
        'UPDATE users SET failed_login_attempts = ?, locked_until = ? WHERE id = ?',
        [nextAttempts, lockedUntil ? toSqlDateTime(lockedUntil) : null, userId]
    );
}

export async function recordSuccessfulLogin(userId: number) {
    await db.query(
        'UPDATE users SET failed_login_attempts = 0, locked_until = NULL, last_login_at = NOW() WHERE id = ?',
        [userId]
    );
}

export async function activatePatient(id: number, data: any): Promise<void> {
    await db.query(
        'UPDATE patients SET status = "Active", dob = ?, phone = ?, gender = ?, primary_diagnosis = ?, date_of_onboarding = ?, emr_number = ?, navigator_id = ?, partner_id = ?, brief_medical_history = ?, years_since_diagnosis = ?, past_medical_interventions = ?, relevant_family_history = ?, dietary_restrictions = ?, allergies_intolerances = ?, lifestyle_factors = ?, physical_limitations = ?, psychosocial_factors = ?, emergency_contact_name = ?, emergency_contact_phone = ?, emergency_contact_relation = ?, has_weighing_scale = ?, has_glucometer = ?, has_bp_machine = ?, has_tape_measure = ? WHERE id = ?',
        [toSqlDate(data.dob), data.phone, data.gender, data.primary_diagnosis, toSqlDate(data.date_of_onboarding), data.emr_number, data.navigator_id, data.partner_id, data.brief_medical_history, data.years_since_diagnosis, data.past_medical_interventions, data.relevant_family_history, data.dietary_restrictions, data.allergies_intolerances, data.lifestyle_factors, data.physical_limitations, data.psychosocial_factors, data.emergency_contact_name, data.emergency_contact_phone, data.emergency_contact_relation, data.has_weighing_scale, data.has_glucometer, data.has_bp_machine, data.has_tape_measure, id]
    );
}

export async function createPatientOnboardingRecord(
    userId: number,
    patientIdentifier: string,
    data: PatientOnboardingPayload
): Promise<number> {
    const selectedPartnerId = data.partner_id ?? data.payer_id ?? null;
    let resolvedClinicId = data.clinic_id ?? null;

    if (selectedPartnerId) {
        const [partnerRows] = await db.query(
            'SELECT partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
            [selectedPartnerId]
        );
        const selectedPartner = (partnerRows as any[])[0];

        if (selectedPartner?.partner_type === 'clinic') {
            resolvedClinicId = selectedPartner.clinic_id ?? resolvedClinicId;
        }
    }

    const [result] = await db.query(
        `INSERT INTO patients (
            user_id,
            patient_identifier,
            portal_username,
            first_name,
            middle_name,
            surname,
            dob,
            gender,
            email,
            phone,
            address,
            status,
            date_of_onboarding,
            clinic_id,
            partner_id,
            primary_diagnosis_id,
            comorbid_conditions,
            current_medications_summary,
            allergies_intolerances,
            past_medical_history,
            surgical_history,
            family_history,
            social_history,
            emergency_contact_name,
            emergency_contact_phone,
            emergency_contact_relation,
            emergency_contact_email,
            policy_number,
            coverage_limits,
            pre_authorization_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active', CURDATE(), ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            userId,
            patientIdentifier,
            data.portal_username ?? data.email,
            data.first_name,
            data.middle_name ?? null,
            data.surname,
            toSqlDate(data.dob),
            data.gender,
            data.email,
            data.phone,
            data.address ?? null,
            resolvedClinicId,
            selectedPartnerId,
            data.primary_diagnosis_id ?? null,
            data.comorbid_conditions ?? null,
            data.current_medications_summary ?? null,
            data.allergies_intolerances ?? null,
            data.past_medical_history ?? null,
            data.surgical_history ?? null,
            data.family_history ?? null,
            data.social_history ?? null,
            data.emergency_contact_name,
            data.emergency_contact_phone,
            data.emergency_contact_relation,
            data.emergency_contact_email ?? null,
            data.policy_number ?? null,
            data.coverage_limits ?? null,
            data.pre_authorization_status ?? 'Not Required',
        ]
    );

    return Number((result as any).insertId);
}

export async function updatePatientDetails(id: number, data: any): Promise<void> {
    // Keep fields stable if callers send partial updates.
    const [existingRows] = await db.query(
        `
        SELECT
          first_name,
          middle_name,
          surname,
          dob,
          age,
          gender,
          email,
          phone,
          address,
          wellness_date,
          status,
          partner_id,
          primary_diagnosis,
          comorbid_conditions,
          current_medications_summary,
          emergency_contact_name,
          emergency_contact_phone,
          emergency_contact_relation,
          emergency_contact_email
        FROM patients
        WHERE id = ?
        LIMIT 1
        `,
        [id]
    );
    const existing = (existingRows as any[])[0] || {};

    const status = data.status ?? existing.status ?? null;
    const partnerId = data.partner_id ?? existing.partner_id ?? null;
    await db.query(
        `
        UPDATE patients
        SET
          first_name = ?,
          middle_name = ?,
          surname = ?,
          dob = ?,
          age = ?,
          gender = ?,
          email = ?,
          phone = ?,
          address = ?,
          wellness_date = ?,
          status = ?,
          partner_id = ?,
          primary_diagnosis = ?,
          comorbid_conditions = ?,
          current_medications_summary = ?,
          emergency_contact_name = ?,
          emergency_contact_phone = ?,
          emergency_contact_relation = ?,
          emergency_contact_email = ?
        WHERE id = ?
        `,
        [
          data.first_name ?? existing.first_name,
          data.middle_name ?? existing.middle_name,
          data.surname ?? existing.surname,
          toSqlDate(data.dob ?? existing.dob),
          data.age ?? existing.age,
          data.gender ?? existing.gender,
          data.email ?? existing.email,
          data.phone ?? existing.phone,
          data.address ?? existing.address ?? null,
          toSqlDate(data.wellness_date ?? existing.wellness_date),
          status ?? null,
          partnerId ?? null,
          data.primary_diagnosis ?? existing.primary_diagnosis ?? null,
          data.comorbid_conditions ?? existing.comorbid_conditions ?? null,
          data.current_medications_summary ?? existing.current_medications_summary ?? null,
          data.emergency_contact_name ?? existing.emergency_contact_name ?? null,
          data.emergency_contact_phone ?? existing.emergency_contact_phone ?? null,
          data.emergency_contact_relation ?? existing.emergency_contact_relation ?? null,
          data.emergency_contact_email ?? existing.emergency_contact_email ?? null,
          id,
        ]
    );
}

export async function createGoal(data: any): Promise<number> {
    const [result] = await db.query('INSERT INTO goals (patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.clinical_parameter_id, data.target_value, data.target_operator, data.status, data.notes, toSqlDate(data.deadline)]);
    return Number((result as any).insertId);
}

export async function updateGoal(id: number, data: any): Promise<void> {
    await db.query('UPDATE goals SET target_value = ?, target_operator = ?, status = ?, notes = ?, deadline = ? WHERE id = ?', [data.target_value, data.target_operator, data.status, data.notes, toSqlDate(data.deadline), id]);
}

export async function upsertAppointment(data: any): Promise<number> {
    const apptDate = toSqlDateTime(data.appointment_date);
    const endDate = toSqlDateTime(data.end_date);
    if (data.id) {
        await db.query('UPDATE appointments SET clinician_id = ?, title = ?, appointment_date = ?, end_date = ?, description = ?, status = ? WHERE id = ?', [data.clinician_id, data.title, apptDate, endDate, data.description, data.status, data.id]);
        return Number(data.id);
    }
    const [result] = await db.query('INSERT INTO appointments (patient_id, clinician_id, title, appointment_date, end_date, description, status) VALUES (?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.clinician_id, data.title, apptDate, endDate, data.description, data.status]);
    return Number((result as any).insertId);
}

export async function upsertPrescription(data: any): Promise<number> {
    const sDate = toSqlDate(data.start_date);
    const eDate = toSqlDate(data.expiry_date);
    if (data.id) {
        await db.query('UPDATE prescriptions SET medication_id = ?, dosage = ?, frequency = ?, start_date = ?, expiry_date = ?, notes = ?, status = ? WHERE id = ?', [data.medication_id, data.dosage, data.frequency, sDate, eDate, data.notes, data.status, data.id]);
        return Number(data.id);
    }
    const [result] = await db.query('INSERT INTO prescriptions (patient_id, medication_id, dosage, frequency, start_date, expiry_date, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [data.patient_id, data.medication_id, data.dosage, data.frequency, sDate, eDate, data.notes, data.status]);
    return Number((result as any).insertId);
}

export async function deleteAssessment(id: number): Promise<void> { await db.query('UPDATE assessments SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteGoal(id: number): Promise<void> { await db.query('UPDATE goals SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deletePrescription(id: number): Promise<void> { await db.query('UPDATE prescriptions SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function bulkDeletePatients(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE patients SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteMedications(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE medications SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteUsers(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE users SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeletePartners(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE partners SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteClinics(ids: number[]): Promise<void> {
    if (!ids.length) return;
    await db.query('UPDATE clinics SET deleted_at = NOW() WHERE id IN (?)', [ids]);
    await db.query("UPDATE partners SET deleted_at = NOW() WHERE clinic_id IN (?) AND partner_type = 'clinic'", [ids]);
}
export async function bulkDeleteDiagnoses(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE diagnoses SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function bulkDeleteParameters(ids: number[]): Promise<void> { if (ids.length) await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id IN (?)', [ids]); }
export async function updateAppointmentStatus(id: number, status: string): Promise<void> { await db.query('UPDATE appointments SET status = ? WHERE id = ?', [status, id]); }
export async function deletePartner(id: number): Promise<void> { await db.query('UPDATE partners SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteUser(id: number): Promise<void> { await db.query('UPDATE users SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteClinic(id: number): Promise<void> {
    await db.query('UPDATE clinics SET deleted_at = NOW() WHERE id = ?', [id]);
    await db.query("UPDATE partners SET deleted_at = NOW() WHERE clinic_id = ? AND partner_type = 'clinic'", [id]);
}
export async function deleteDiagnosis(id: number): Promise<void> { await db.query('UPDATE diagnoses SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteMedication(id: number): Promise<void> { await db.query('UPDATE medications SET deleted_at = NOW() WHERE id = ?', [id]); }
export async function deleteClinicalParameter(id: number): Promise<void> { await db.query('UPDATE clinical_parameters SET deleted_at = NOW() WHERE id = ?', [id]); }

export async function fetchDashboardStats(requestingUser?: User, organizationPartnerId?: number | null) {
    noStore();
    try {
        // Use an aliased patient filter so it can be reused across JOIN queries cleanly.
        const scope = buildPatientScopeClause(requestingUser, 'p');
        let patientFilter = scope.clause;
        const patientParams = [...scope.params];

        if (organizationPartnerId) {
            const [orgRows] = await db.query(
                'SELECT id, partner_type, clinic_id FROM partners WHERE id = ? AND deleted_at IS NULL LIMIT 1',
                [organizationPartnerId]
            );
            const org = (orgRows as any[])[0];
            if (org) {
                if (org.partner_type === 'clinic' && org.clinic_id) {
                    patientFilter += ' AND p.clinic_id = ?';
                    patientParams.push(org.clinic_id);
                } else {
                    patientFilter += ' AND p.partner_id = ?';
                    patientParams.push(org.id);
                }
            }
        }

        const scopedPatientsSubquery = `SELECT p.id FROM patients p WHERE p.deleted_at IS NULL ${patientFilter}`;

        // Core counts
        const [totalPatientsRows] = await db.query(`SELECT COUNT(*) as count FROM patients p WHERE p.deleted_at IS NULL ${patientFilter}`, patientParams);
        const [totalPartnersRows] = await db.query(`SELECT COUNT(*) as count FROM partners WHERE deleted_at IS NULL`);
        const [totalOnboardedRows] = await db.query(`SELECT COUNT(*) as count FROM patients p WHERE p.status != 'Pending' AND p.deleted_at IS NULL ${patientFilter}`, patientParams);
        const [totalInactiveRows] = await db.query(`SELECT COUNT(*) as count FROM patients p WHERE p.status = 'Pending' AND p.deleted_at IS NULL ${patientFilter}`, patientParams);

        const [statusRows] = await db.query(
            `
            SELECT p.status, COUNT(*) as count
            FROM patients p
            WHERE p.deleted_at IS NULL ${patientFilter}
            GROUP BY p.status
            `,
            patientParams
        );
        
        // Progress counts
        const [totalCompletedRows] = await db.query(
            `SELECT COUNT(DISTINCT g.patient_id) as count FROM goals g WHERE g.status = 'completed' AND g.deleted_at IS NULL AND g.patient_id IN (${scopedPatientsSubquery})`,
            patientParams
        );
        const [totalCriticalRows] = await db.query(
            `SELECT COUNT(DISTINCT g.patient_id) as count FROM goals g WHERE g.status = 'active' AND g.deadline < CURDATE() AND g.deleted_at IS NULL AND g.patient_id IN (${scopedPatientsSubquery})`,
            patientParams
        );
        const [totalInProgressRows] = await db.query(
            `SELECT COUNT(DISTINCT g.patient_id) as count FROM goals g WHERE g.status = 'active' AND g.deadline >= CURDATE() AND g.deleted_at IS NULL AND g.patient_id IN (${scopedPatientsSubquery})`,
            patientParams
        );

        const [upcomingAppointmentsRows] = await db.query(
            `
            SELECT COUNT(*) as count
            FROM appointments a
            JOIN patients p ON p.id = a.patient_id
            WHERE
              a.deleted_at IS NULL
              AND p.deleted_at IS NULL
              ${patientFilter}
              AND a.appointment_date >= NOW()
              AND a.status IN ('scheduled','confirmed','rescheduled')
            `,
            patientParams
        );

        const [membersWithRecentCheckIn30dRows] = await db.query(
            `
            SELECT COUNT(DISTINCT a.patient_id) as count
            FROM assessments a
            JOIN patients p ON p.id = a.patient_id
            WHERE
              a.deleted_at IS NULL
              AND p.deleted_at IS NULL
              ${patientFilter}
              AND a.measured_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
            `,
            patientParams
        );

        const [membersWithNoCheckIn14dRows] = await db.query(
            `
            SELECT COUNT(*) as count
            FROM patients p
            WHERE
              p.deleted_at IS NULL
              ${patientFilter}
              AND p.status != 'Pending'
              AND NOT EXISTS (
                SELECT 1
                FROM assessments a
                WHERE a.patient_id = p.id
                  AND a.deleted_at IS NULL
                  AND a.measured_at >= DATE_SUB(NOW(), INTERVAL 14 DAY)
              )
            `,
            patientParams
        );

        // Distributions
        const [genderRows] = await db.query(`SELECT IFNULL(p.gender, 'Not Specified') as gender, COUNT(*) as count FROM patients p WHERE p.deleted_at IS NULL ${patientFilter} GROUP BY p.gender`, patientParams);
        const [diagnosisRows] = await db.query(`SELECT IFNULL(p.primary_diagnosis, 'Not Specified') as diagnosis, COUNT(*) as count FROM patients p WHERE p.deleted_at IS NULL ${patientFilter} GROUP BY p.primary_diagnosis`, patientParams);
        
        // Age Distribution
        const [ageRows] = await db.query(`
            SELECT 
                CASE 
                    WHEN p.dob IS NULL THEN 'Not Specified'
                    WHEN TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) BETWEEN 18 AND 35 THEN '18-35'
                    WHEN TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) BETWEEN 36 AND 50 THEN '36-50'
                    WHEN TIMESTAMPDIFF(YEAR, p.dob, CURDATE()) > 50 THEN 'Above 50'
                    ELSE 'Below 18'
                END as age_group,
                COUNT(*) as count
            FROM patients p
            WHERE p.deleted_at IS NULL ${patientFilter}
            GROUP BY age_group
        `, patientParams);

        return serialize({
            totalPatients: (totalPatientsRows as any)[0]?.count || 0,
            totalPartners: (totalPartnersRows as any)[0]?.count || 0,
            totalOnboarded: (totalOnboardedRows as any)[0]?.count || 0,
            totalInactive: (totalInactiveRows as any)[0]?.count || 0,
            totalCompleted: (totalCompletedRows as any)[0]?.count || 0,
            totalCritical: (totalCriticalRows as any)[0]?.count || 0,
            totalInProgress: (totalInProgressRows as any)[0]?.count || 0,
            upcomingAppointments: (upcomingAppointmentsRows as any)[0]?.count || 0,
            membersWithRecentCheckIn30d: (membersWithRecentCheckIn30dRows as any)[0]?.count || 0,
            membersWithNoCheckIn14d: (membersWithNoCheckIn14dRows as any)[0]?.count || 0,
            statusDistribution: (statusRows as any[]).map((row) => ({
                status: row.status,
                count: Number(row.count),
            })),
            genderDistribution: (genderRows as any[]).map(row => ({
                gender: row.gender,
                count: Number(row.count)
            })),
            diagnosisDistribution: (diagnosisRows as any[]).map(row => ({
                diagnosis: row.diagnosis,
                count: Number(row.count)
            })),
            ageDistribution: (ageRows as any[]).map(row => ({
                age_group: row.age_group,
                count: Number(row.count)
            }))
        });
    } catch (error) {
        console.error('fetchDashboardStats Error:', error);
        return null;
    }
}
