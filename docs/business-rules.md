# NewTaria Business Rules and Application Logic

This document describes the business rules currently implemented in the `NewTaria` codebase. It is written from the actual application behavior in `src/lib`, `src/app/api`, and the dashboard routes, so it should be treated as the operational source of truth for how the system works today.

## 1. Business Purpose

NewTaria is a care coordination and patient monitoring platform used to:

- manage patient onboarding into a structured care program
- link patients to a payer, partner, or clinic
- assign clinical goals, assessments, prescriptions, appointments, and reviews
- track patient progress over time
- allow internal teams, partners, and patients to view data according to role-based access rules

The product is built around a central patient record and a role-aware dashboard.

## 2. Core Operating Model

The application assumes that patients are created by authorized staff, not by self-signup.

Key operating principles:

- patient self-registration is disabled
- internal staff create patient portal accounts
- every patient can be linked to a user account
- data visibility is scoped by role
- most business entities are soft-deleted rather than physically removed
- admin users manage setup data such as payers, clinics, diagnoses, medications, clinical parameters, and users

## 3. Primary Business Entities

The main domain entities are defined in [types.ts](/home/buma/projects/NewTaria/src/lib/types.ts).

### 3.1 Users

Users represent all authenticated actors in the system.

Supported roles:

- `admin`
- `staff`
- `physician`
- `clinician`
- `navigator`
- `payer`
- `partner`
- `user`
- `patient`

Business meaning:

- `admin`: full setup and operational access
- `navigator`: manages onboarding and patient journey coordination
- `staff`: internal user with access to internal areas, but not all mutation rights
- `physician` and `clinician`: clinical users with rights over assessments, reviews, and prescriptions
- `payer` and `partner`: external or organizational users whose access is restricted to their assigned partner/clinic scope
- `user` and `patient`: patient-facing roles with access only to their own record

### 3.2 Patients

Patients are the core business records of the platform. A patient can store:

- demographic details
- onboarding information
- diagnosis and comorbidities
- payer or partner association
- clinic association
- policy and coverage details
- emergency contacts
- assessments
- goals
- prescriptions
- appointments
- clinical reviews

### 3.3 Partners and Clinics

The system distinguishes between:

- `partners`
- `clinics`

Partner types include:

- `insurance`
- `clinic`
- `hospital`
- `specialist`
- `corporate`

Important business rule:

- a clinic can also have a matching partner record of type `clinic`

This allows clinics to participate in both operational routing and partner-based data scoping.

### 3.4 Clinical and Care Entities

The patient care workflow uses:

- `diagnoses`
- `clinical_parameters`
- `assessments`
- `goals`
- `medications`
- `prescriptions`
- `appointments`
- `reviews`

These are used to represent the patient’s monitored condition, targets, measured progress, treatment, and clinician oversight.

## 4. Role and Permission Rules

Role utilities are implemented in [role-utils.ts](/home/buma/projects/NewTaria/src/lib/role-utils.ts).

### 4.1 Role Grouping

Business grouping rules:

- patient roles: `user`, `patient`
- payer or partner roles: `partner`, `payer`
- clinician roles: `physician`, `clinician`
- internal roles: `admin`, `navigator`, `staff`, `physician`, `clinician`

### 4.2 Capability Rules

Current permissions:

- Admin Center access: `admin` only
- Onboarding management: `admin`, `navigator`
- Goal management: `admin`, `navigator`
- Assessment management: `admin`, `navigator`, `physician`, `clinician`
- Review management: `admin`, `navigator`, `physician`, `clinician`
- Appointment management: `admin`, `navigator`
- Prescription management: `admin`, `navigator`, `physician`, `clinician`

Important implication:

- `staff` counts as an internal user for access to internal APIs, but does not automatically receive all mutation permissions

## 5. Authentication and Session Logic

Authentication and session behavior is implemented in [actions.ts](/home/buma/projects/NewTaria/src/lib/actions.ts), [auth.ts](/home/buma/projects/NewTaria/src/lib/auth.ts), and [session.ts](/home/buma/projects/NewTaria/src/lib/session.ts).

### 5.1 Login Rule

Login is performed using:

- `phone`
- `password`

Rules:

- login fails if phone is not found
- login fails if bcrypt password comparison fails
- patient-role users are enriched with their linked `patientId`
- successful login creates a signed session cookie

### 5.2 Session Rule

The app uses a custom signed cookie:

- cookie name: `taria_session`
- lifetime: 7 days
- signature: HMAC SHA-256
- cookie flags: `httpOnly`, `sameSite=lax`, `secure` only in production

The session payload contains:

- `userId`
- `exp`
- `mustChangePassword`

### 5.3 Forced Password Change Rule

If a user has `must_change_password = true`:

- the user can authenticate
- general API access is blocked
- password change route is still allowed

This forces first-time or reset users to change their password before normal usage.

### 5.4 Self-Service Registration Rule

Self-service registration is explicitly disabled.

The public registration action always returns:

- failure
- message directing the user to contact an administrator

## 6. Access Scope and Data Visibility Rules

Patient data scoping is implemented in [data.ts](/home/buma/projects/NewTaria/src/lib/data.ts) through `buildPatientScopeClause(...)`.

### 6.1 Patient Scope Rules

If the requesting user is a patient-role user:

- they may only access the patient row linked to their `user_id`

If the requesting user is a partner or payer user:

- if their partner is of type `clinic` and has a `clinic_id`, they may only access patients for that clinic
- otherwise, if they have a `partner_id`, they may only access patients linked to that partner

If the requesting user is an internal user:

- access is unrestricted by scope clause

### 6.2 Protected Fetch Behavior

The following patient-facing data fetches honor scope rules:

- patient list
- patient detail
- patient-scoped dashboard analytics

### 6.3 Patient Access Authorization

When a specific patient record is requested through authorized routes:

- the app resolves the authenticated user
- the app tries to fetch the patient within that user’s scope
- if the patient is outside scope, access is denied as `403 Forbidden`

## 7. User Lifecycle Rules

### 7.1 User Creation

Users can be created directly by admins via [users API](/home/buma/projects/NewTaria/src/app/api/users/route.ts).

Rules:

- `name`, `phone`, `email`, and `password` are required
- initial password must be at least 8 characters
- email must be unique
- phone must be unique
- password is stored as bcrypt hash
- newly created admin-managed users are forced to change password on first login

### 7.2 User Update

Rules:

- `id`, `name`, `phone`, and `email` are required
- updated email must remain unique
- updated phone must remain unique

### 7.3 User Deletion

User deletion is soft delete only.

Implemented behavior:

- `deleted_at` is set
- user is excluded from future fetches

## 8. Patient Onboarding and Activation Rules

The main onboarding logic lives in [actions.ts](/home/buma/projects/NewTaria/src/lib/actions.ts) and [data.ts](/home/buma/projects/NewTaria/src/lib/data.ts).

### 8.1 Who Can Onboard

Only users with onboarding permission may create patients:

- `admin`
- `navigator`

### 8.2 Staff-Led Registration Flow

When staff onboarding is performed:

1. the current user must have onboarding rights
2. the submitted email must not already exist as a user
3. a temporary password is generated
4. a patient identifier is generated in the format `PT-YYYY-MMDD-RAND`
5. a portal username is generated from name plus identifier suffix
6. a linked user account is created with role `user`
7. a patient onboarding record is inserted

The onboarding response returns:

- `patientId`
- `patientIdentifier`
- `portalUsername`
- `temporaryPassword`

### 8.3 Patient Creation Behavior

Current implemented onboarding behavior creates patients as:

- `status = 'Active'`
- `date_of_onboarding = CURDATE()`

This means the current onboarding path is immediate activation, not a draft-only pending flow.

### 8.4 Partner and Clinic Resolution During Onboarding

The patient’s selected funding or partner source is resolved as:

- `partner_id ?? payer_id ?? null`

Clinic resolution rule:

- if the selected partner is a clinic-type partner, its `clinic_id` becomes the patient’s clinic if none was already supplied

This ensures clinic-linked partners automatically drive clinic ownership.

### 8.5 Data Captured at Onboarding

The onboarding record can capture:

- patient identifier and portal username
- name and date of birth
- gender and contact details
- address
- clinic and partner
- primary diagnosis
- comorbidities
- medication summary
- allergies and intolerances
- medical, surgical, family, and social history
- emergency contact details
- policy number
- coverage limits
- pre-authorization status

### 8.6 Legacy or Secondary Activation Flow

There is also an explicit activation endpoint in [activate route](/home/buma/projects/NewTaria/src/app/api/patients/activate/route.ts).

This flow updates an existing patient to:

- `status = 'Active'`

and records:

- date of onboarding
- navigator
- partner
- diagnosis text
- medical history
- family history
- dietary and lifestyle factors
- psychosocial factors
- emergency contact details
- home equipment availability

Important implementation note:

- the system currently contains both an immediate-active onboarding flow and a separate activation update flow, which suggests support for both direct onboarding and older pending-patient workflows

## 9. Patient Record Maintenance Rules

Patient update behavior is currently narrower than onboarding.

The general update endpoint currently updates:

- names
- date of birth
- age
- gender
- email
- phone
- wellness date
- partner

Important note:

- not every patient field captured at onboarding is currently editable through the generic patient update endpoint

## 10. Partner, Clinic, Diagnosis, Medication, and Parameter Rules

### 10.1 Partner Rules

Partners are managed through upsert behavior.

Rules:

- if `id` exists, the partner is updated
- if no `id`, the system checks for an existing partner by `name + partner_type`
- if found, the record is revived by clearing `deleted_at`
- if not found, a new partner is inserted

Clinic-specific partner rule:

- a partner of type `clinic` carries a `clinic_id`

### 10.2 Clinic Rules

Clinics are also managed through upsert behavior.

Rules:

- creating or updating a clinic also maintains a corresponding partner of type `clinic`
- if the clinic already has a linked clinic partner, that partner is updated
- if not, the clinic partner is created
- if a partner with the same clinic name already exists, it is revived and linked

Deletion rule:

- deleting a clinic also soft-deletes the linked clinic-type partner

### 10.3 Diagnosis Rules

Diagnoses can be created or updated with:

- `name`
- `code`
- `description`

Deletion is soft delete.

### 10.4 Medication Rules

Medications can be created or updated with:

- `name`
- `dosage`

Deletion is soft delete.

### 10.5 Clinical Parameter Rules

Clinical parameters can be created or updated with:

- `name`
- `type`
- `unit`
- `options`
- `category`

Rules:

- `options` are stored as JSON when present
- fetched parameter options are parsed back into arrays

Deletion is soft delete.

## 11. Clinical Workflow Rules

The patient-care workflow is implemented through patient-linked child records.

### 11.1 Assessments

Assessment creation requires:

- internal authenticated user
- assessment permission
- valid `measured_at` datetime

Assessment stores:

- patient
- clinical parameter
- measured value
- notes
- normal or abnormal flag
- measurement datetime

Deletion is soft delete.

### 11.2 Goals

Goal creation and update require:

- internal authenticated user
- goal permission

Goals store:

- patient
- clinical parameter
- target value
- target operator
- status
- notes
- deadline

Deletion is soft delete.

### 11.3 Prescriptions

Prescription creation and update require:

- internal authenticated user
- prescription permission

Prescriptions store:

- patient
- medication
- dosage
- frequency
- start date
- expiry date
- notes
- status

Deletion is soft delete.

### 11.4 Appointments

Appointment creation and update require:

- internal authenticated user
- appointment permission

Appointments store:

- patient
- clinician
- title
- start datetime
- end datetime
- description
- status

Date rule:

- appointment dates are normalized into SQL datetime format before persistence

Appointment status can also be updated independently.

### 11.5 Reviews

Review creation requires:

- internal authenticated user
- review permission

Reviews store:

- patient
- reviewer
- review date
- subjective findings
- objective findings
- assessment
- plan
- recommendations
- follow-up date

## 12. Password Reset and Password Change Rules

Password recovery logic is implemented in:

- [forgot-password route](/home/buma/projects/NewTaria/src/app/api/auth/forgot-password/route.ts)
- [reset-password route](/home/buma/projects/NewTaria/src/app/api/auth/reset-password/route.ts)
- [change-password route](/home/buma/projects/NewTaria/src/app/api/auth/change-password/route.ts)

### 12.1 Forgot Password Rules

Rules:

- email is required
- response does not reveal whether the user exists
- if the user exists, a reset token is created
- token validity is 30 minutes
- in non-production only, the API returns a usable `resetUrl`

### 12.2 Reset Token Storage Rules

Security rules:

- raw tokens are never stored directly
- tokens are hashed with SHA-256 before database storage
- only one active token is allowed per user at a time
- creating a new token marks previous unused tokens as used

### 12.3 Reset Password Rules

Rules:

- reset token is required
- new password must be at least 8 characters
- token must exist
- token must be unused
- token must be unexpired

On success:

- password hash is updated
- `must_change_password` is cleared
- the reset token is consumed
- any other outstanding reset tokens for that user are invalidated

### 12.4 Change Password Rules

Rules:

- user must be authenticated
- route remains available even if password change is currently required
- current password must match
- new password must be at least 8 characters

On success:

- password hash is updated
- `must_change_password` is cleared
- all outstanding reset tokens are invalidated
- session is recreated with `mustChangePassword = false`

## 13. Dashboard and Navigation Logic

Dashboard behavior is implemented in [dashboard/page.tsx](/home/buma/projects/NewTaria/src/app/dashboard/page.tsx), [admin/page.tsx](/home/buma/projects/NewTaria/src/app/dashboard/admin/page.tsx), and [dashboard-shell.tsx](/home/buma/projects/NewTaria/src/components/dashboard/dashboard-shell.tsx).

### 13.1 Default Post-Login Routing

After the dashboard root is loaded:

- unauthenticated users are redirected to `/`
- patient-role users with a linked patient record are redirected to `/dashboard/patient/{patientId}/progress`
- admins are redirected to `/dashboard/admin?section=dashboard`
- everyone else is redirected to `/dashboard/registry`

### 13.2 Sidebar Structure

Main dashboard sections:

- Patient Registry
- Onboarding Module
- Admin Center

Visibility rules:

- Patient Registry: available to non-patient dashboard users
- Onboarding Module: visible to `admin` and `navigator`
- Admin Center: visible to `admin` only

### 13.3 Admin Center Sections

Admin setup sections are:

- dashboard
- payers
- clinics
- diagnoses
- medications
- clinical-parameters
- users

### 13.4 Patient Dashboard Experience

Patient-role users use a simplified dashboard shell:

- no normal internal sidebar workflow
- progress page becomes the default destination

## 14. Reporting and Dashboard Analytics Rules

Dashboard analytics are produced by `fetchDashboardStats(...)` in [data.ts](/home/buma/projects/NewTaria/src/lib/data.ts).

### 14.1 Summary Metrics

The dashboard currently calculates:

- total patients
- total partners
- total onboarded patients
- total inactive or pending patients
- patients with completed goals
- patients with overdue active goals
- patients with active in-progress goals

### 14.2 Distribution Metrics

The dashboard also calculates:

- gender distribution
- diagnosis distribution
- age distribution

Age buckets:

- `Below 18`
- `18-35`
- `36-50`
- `Above 50`
- `Not Specified`

### 14.3 Scope Rule for Analytics

Analytics respect the same patient visibility rules described in Section 6.

That means:

- internal users see unrestricted analytics
- partner and payer users see only their scoped patients
- patient-role users are limited to their own scope if analytics are queried through scoped patient logic

## 15. Soft Delete and Data Lifecycle Rules

The application primarily uses soft delete through `deleted_at`.

Entities currently soft-deleted:

- patients
- users
- partners
- clinics
- diagnoses
- medications
- clinical parameters
- goals
- assessments
- prescriptions

Important behavior:

- soft-deleted records are filtered out of normal fetches
- bulk delete endpoints also use soft delete
- deleting a clinic cascades soft deletion to its clinic-type partner record

## 16. Data Integrity and Validation Rules

Current implementation-level validation rules include:

- user passwords must be at least 8 characters
- reset passwords must be at least 8 characters
- assessment dates must be valid datetimes
- appointment dates are normalized before save
- reset tokens must be active and unexpired
- onboarding requires an authorized current user
- onboarding prevents duplicate user email creation
- admin user creation prevents duplicate email and phone
- admin user update prevents conflicting email and phone

Important current limitation:

- some uniqueness and business constraints are enforced in application logic rather than fully guaranteed in the SQL layer

## 17. Operational Notes and Current Implementation Nuances

These are important to understand when using or extending the system:

- self-service patient signup is intentionally disabled
- current onboarding creates active patients immediately
- a second explicit patient activation flow still exists for expanded onboarding capture
- patient updates do not yet expose every onboarding field for later editing
- clinic management automatically synchronizes a corresponding clinic-type partner
- partner or clinic users do not get global access; they are restricted by partner or clinic ownership
- first-login and reset users are forced through password change before normal API use

## 18. Recommended Use of the System

Based on the current business logic, the intended operating pattern is:

1. admins configure master data:
   payers, clinics, diagnoses, medications, parameters, and users
2. navigators or admins onboard patients into the platform
3. patients are linked to a partner or clinic at creation time
4. clinicians and navigators manage the patient’s care plan and monitoring records
5. admins and internal teams track performance from the dashboard
6. patients access their own progress view through the patient portal

## 19. Source of Truth

This document is derived from the current implementation in:

- [types.ts](/home/buma/projects/NewTaria/src/lib/types.ts)
- [role-utils.ts](/home/buma/projects/NewTaria/src/lib/role-utils.ts)
- [actions.ts](/home/buma/projects/NewTaria/src/lib/actions.ts)
- [auth.ts](/home/buma/projects/NewTaria/src/lib/auth.ts)
- [session.ts](/home/buma/projects/NewTaria/src/lib/session.ts)
- [data.ts](/home/buma/projects/NewTaria/src/lib/data.ts)
- [dashboard/page.tsx](/home/buma/projects/NewTaria/src/app/dashboard/page.tsx)
- [admin/page.tsx](/home/buma/projects/NewTaria/src/app/dashboard/admin/page.tsx)
- [dashboard-shell.tsx](/home/buma/projects/NewTaria/src/components/dashboard/dashboard-shell.tsx)

If the implementation changes, this document should be updated alongside the code.
