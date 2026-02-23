# Taria Health - Patient Monitoring Dashboard

A modern, patient-centric health monitoring dashboard designed to track personalized health metrics over time. It provides a clean, intuitive interface for healthcare providers to monitor patient progress against their health goals.

## Production Configuration (Shared Hosting)

The application is configured for production deployment on shared hosting environments (like cPanel with Passenger).

### Key Features
- **Standalone Build**: Optimized production build containing only necessary dependencies.
- **MySQL Integration**: Direct connection to your database using environment variables.
- **Secure Authentication**: Database-linked login with bcrypt password hashing.

### Database Schema

Import the `localhost.sql` file into your MySQL database to set up the following tables:

#### `users`
Stores user accounts for staff, navigators, physicians, and admins.
- `id`: Primary Key
- `name`: Full name
- `email`: Login email (Unique)
- `password`: BCrypt hashed password
- `role`: Access level (admin, staff, physician, navigator, payer, patient)
- `avatarUrl`: Link to profile picture

#### `patients`
Central patient records including demographic and onboarding data.
- `id`: Primary Key
- `status`: Active, Pending, Critical, etc.
- `emr_number`: Internal EMR reference
- ... (includes detailed medical and lifestyle history fields)

#### `assessments`
Records of clinical measurements (Vitals, Blood Glucose, Weight, etc.).

#### `goals`
Patient-specific health targets with operators (e.g., Blood Pressure <= 130).

#### `appointments`
Scheduled consultations between patients and clinicians.

#### `prescriptions`
Medication management including dosages, frequencies, and expiry dates.

#### `reviews`
Clinical review notes from physicians.

## Deployment Steps

1. **Environment Variables**: Set the following in your hosting control panel:
   - `DB_HOST`: Your database host (e.g., `localhost`)
   - `DB_USER`: Your database username
   - `DB_PASSWORD`: Your database password
   - `DB_DATABASE`: Your database name
   - `DB_PORT`: `3306`

2. **Build**: Run `npm run build` to generate the `.next/standalone` directory.

3. **Files to Upload**:
   - `server.js` (at root)
   - `.next/standalone` contents (mapped to your application root)
   - `public/` directory contents
   - `.next/static` directory (moved inside the standalone `public/_next/static` folder if necessary by your host)

4. **Restart**: Restart your Node.js application from your hosting panel.
