# NewTaria Care Program Platform

NewTaria is a care program web app for tracking and supporting members living with chronic conditions over time, with an emphasis on Hypertension, Diabetes, and combined Hypertension + Diabetes. The platform helps care teams set goals, capture check-ins, monitor trends, and coordinate appointments and clinical reviews.

This README is the single source of truth for the business rules and operating model of the app.

## Care Program Overview (Non Technical)

The care program follows a simple loop:

1. A member is enrolled by the care team or by a partner organization.
2. A navigator assigns measurable goals (for example: BP <= 130, Weight <= 67kg) with deadlines.
3. Assessments (check-ins) are recorded over time by the care team and, for self-monitor-enabled parameters, by the member.
4. The system visualizes progress, highlights risk (overdue goals, lack of check-ins), and supports follow-up through appointments and clinical reviews.

## Terminology

- Member: the person enrolled in the care program (DB table is still named `patients` for historical reasons).
- Partner: an organization that sponsors or enrolls members (insurance, corporate, clinic, hospital).
- Care team: internal users who manage program operations (admin, navigator, clinician).

## Roles, Access, and Navigation

The app uses role-based access control (RBAC) plus partner scoping.

Roles:

- `admin`: full access to all pages and setup catalogs.
- `navigator`: manages enrollment/onboarding, goals, appointments, and operational follow-up.
- `clinician`: manages clinical assessments, clinical reviews, and prescriptions.
- `partner`: similar to navigator for their own scope only (members under their partner or clinic).
- `patient` / `user`: member portal access (progress dashboard, self check-ins where enabled).

Navigation rules after login:

- Member users land on their Progress Dashboard: `/dashboard/patient/:id/progress`.
- Admin users land on Admin Center: `/dashboard/admin`.
- All other staff and partner users land on Member Registry: `/dashboard/registry`.

Partner scoping rules:

- Partner users can only view or mutate member records that belong to their partner organization or clinic scope.
- API routes enforce this by checking member ownership before any write.

## Business Workflows

### 1) Partner Setup

- Partners are organizations stored in the `partners` table.
- Partner staff are normal user accounts in the `users` table with role `partner` (or `payer`) and `partner_id` set.
- Admin creates partners in Admin Center, then creates partner staff accounts in Users management.

### 2) Member Enrollment and First Login

- A care team user (admin/navigator) or a partner user can enroll a member.
- Enrollment creates a user account (phone number + temporary password) and a linked member record (`patients.user_id`).
- On first login, the member is forced to change their password.
  - Member can only proceed after confirming their current password and setting a new one.
  - The system resets the session so the “password change required” state is cleared.

### 3) Clinical Parameters

Parameters define what can be tracked over time.

- Parameter types: numeric, text, choice, image/photo, voice note.
- Parameter category: vital sign, lab result, clinical measurement, symptom, assessment.
- Self monitoring toggle:
  - Each parameter has `allow_self_monitoring`.
  - If enabled, members can submit check-ins for that parameter in the portal.
  - If disabled, members do not see the “+ check-in” controls and the patient API rejects submissions.

### 4) Goals

- Goals connect a member to a parameter plus a target and a deadline.
- Goal operator controls comparison (`<`, `<=`, `=`, `>=`, `>`).
- Goal status: active, completed, cancelled.

### 5) Assessments (Check-ins)

- An assessment is a time-stamped data point for a parameter.
- Assessments can be created by staff and, where enabled, by members.
- For member self-check-ins:
  - Members can only edit or delete their latest check-in for that parameter.
  - Upload parameters store a file URL (image or audio) produced by `/api/uploads`.

### 6) Appointments

- Appointments represent follow-ups with a clinician.
- Navigator (and partner, within scope) can schedule or update appointments.
- Members can view upcoming appointments in their portal.

### 7) Clinical Reviews

- Reviews represent a structured clinical note (assessment, plan, follow-up).
- Clinicians and navigators can create reviews.

### 8) Medications and Prescriptions

- `medications` is a reference list.
- `prescriptions` is member-specific and includes dosage, frequency, start and expiry dates, and notes.

## Security and Safety Rules

- Password hashing: bcrypt.
- First login password change: required via `users.must_change_password`.
- Account lockout:
  - Repeated failed logins increment `users.failed_login_attempts`.
  - After 5 failures, the account is temporarily locked (`users.locked_until`) for 15 minutes.
- Sessions:
  - Signed HMAC session cookie (`taria_session`) with expiry.
  - Constant-time signature compare is used to reduce timing attack risk.
- Authorization:
  - All member-scoped write APIs call a “member in scope” check before writing.
  - Partner users are allowed into the care-team app, but writes are still constrained by RBAC and scoping.

## Upload Rules (Images and Voice)

- Upload endpoint: `POST /api/uploads`.
- Validation:
  - Image uploads require an `image/*` content type.
  - Voice uploads require an `audio/*` content type.
- Size limits:
  - Images: 2MB max.
  - Voice notes: 10MB max.
- Files are stored under `public/uploads/YYYY-MM-DD/...` and returned as a URL.

## Data Model (Core Tables)

The full schema is in `localhost.sql`. Core relationships:

- `partners` 1..n `users` via `users.partner_id`
- `users` 1..0..1 `patients` via `patients.user_id`
- `patients` 1..n `goals`
- `patients` 1..n `assessments`
- `patients` 1..n `appointments`
- `patients` 1..n `reviews`
- `patients` 1..n `prescriptions`

Important fields:

- `clinical_parameters.allow_self_monitoring`: drives member self-check-in UI and API authorization.
- `assessments.created_by_user_id`: used to enforce “member can only edit/delete their latest self check-in”.

## Local Development (Docker)

Start containers:

```bash
docker compose up -d
```

Local URLs:

- App: `http://localhost:3002`
- phpMyAdmin: `http://localhost:8084`
- MySQL: `localhost:3311`

Default local seed accounts (from `localhost.sql`):

- Phone: `0700000001` (Admin), password: `TempPass123!`
- Phone: `0700000002` (Navigator), password: `TempPass123!`
- Phone: `0700000003` (Clinician), password: `TempPass123!`
- Phone: `0700000004` (Partner), password: `TempPass123!`

Default local seed member accounts (from `localhost.sql`):

- Phone: `0711000004` (Member: Maria Garcia), password: `TempPass123!`
- Phone: `0711000006` (Member: Grace Njeri), password: `TempPass123!`
- Phone: `0711000007` (Member: Peter Mwangi), password: `TempPass123!`
- Phone: `0711000008` (Member: Faith Achieng), password: `TempPass123!`
- Phone: `0711000009` (Member: Daniel Kiptoo), password: `TempPass123!`

All seed users are forced to change their password on first login.
