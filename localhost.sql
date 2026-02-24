-- Taria Health - Production Database Schema
-- Optimized for Shared Hosting (MySQL 8.0+)

-- 1. DROP TABLES IN CORRECT ORDER
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS reviews;
DROP TABLE IF EXISTS appointments;
DROP TABLE IF EXISTS prescriptions;
DROP TABLE IF EXISTS goals;
DROP TABLE IF EXISTS assessments;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS clinical_parameters;
DROP TABLE IF EXISTS medications;
DROP TABLE IF EXISTS corporates;
DROP TABLE IF EXISTS payers;

-- 2. CREATE MASTER TABLES
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff', 'physician', 'navigator', 'payer', 'user') DEFAULT 'user',
    avatarUrl VARCHAR(500),
    payer_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clinical_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('numeric', 'text', 'choice') DEFAULT 'numeric',
    unit VARCHAR(50),
    options JSON, -- Stores array of choices if type is 'choice'
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE corporates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wellness_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. CREATE PATIENT RECORDS
CREATE TABLE patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNIQUE, -- Links to users.id for login
    first_name VARCHAR(255) NOT NULL,
    middle_name VARCHAR(255),
    surname VARCHAR(255),
    dob DATE,
    age INT,
    gender ENUM('Male', 'Female'),
    email VARCHAR(255),
    phone VARCHAR(50),
    wellness_date DATE,
    corporate_id INT,
    payer_id INT,
    navigator_id INT,
    emr_number VARCHAR(100),
    date_of_onboarding DATE,
    consent_date DATE,
    status ENUM('Active', 'Pending', 'Critical', 'Discharged', 'In Review') DEFAULT 'Pending',
    
    -- Onboarding Details
    brief_medical_history TEXT,
    years_since_diagnosis INT,
    past_medical_interventions TEXT,
    relevant_family_history TEXT,
    dietary_restrictions TEXT,
    allergies_intolerances TEXT,
    lifestyle_factors TEXT,
    physical_limitations TEXT,
    psychosocial_factors TEXT,
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    
    -- Equipment Flags
    has_weighing_scale BOOLEAN DEFAULT FALSE,
    has_glucometer BOOLEAN DEFAULT FALSE,
    has_bp_machine BOOLEAN DEFAULT FALSE,
    has_tape_measure BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (corporate_id) REFERENCES corporates(id) ON DELETE SET NULL,
    FOREIGN KEY (payer_id) REFERENCES payers(id) ON DELETE SET NULL,
    FOREIGN KEY (navigator_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 4. CREATE ACTIVITY & CLINICAL TABLES
CREATE TABLE assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinical_parameter_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,
    notes TEXT,
    is_normal BOOLEAN,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinical_parameter_id) REFERENCES clinical_parameters(id)
);

CREATE TABLE goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinical_parameter_id INT NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    target_operator ENUM('<', '<=', '=', '>=', '>') DEFAULT '<=',
    deadline DATE NOT NULL,
    notes TEXT,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinical_parameter_id) REFERENCES clinical_parameters(id)
);

CREATE TABLE prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medication_id INT NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    start_date DATE NOT NULL,
    expiry_date DATE,
    notes TEXT,
    status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);

CREATE TABLE appointments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinician_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    appointment_date DATETIME NOT NULL,
    end_date DATETIME,
    description TEXT,
    status ENUM('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled') DEFAULT 'scheduled',
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (clinician_id) REFERENCES users(id)
);

CREATE TABLE reviews (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    reviewed_by_id INT NOT NULL,
    review_date DATE NOT NULL,
    subjective_findings TEXT,
    objective_findings TEXT,
    assessment TEXT,
    plan TEXT,
    recommendations TEXT,
    follow_up_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);

CREATE TABLE messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. SEED DATA (Passwords are 'password')
INSERT INTO users (name, email, password, role) VALUES 
('Dr. Emily Carter', 'admin@taria.com', '$2a$10$px.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.', 'admin'),
('John Davis', 'navigator@taria.com', '$2a$10$px.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.', 'navigator'),
('Dr. Ben Stone', 'physician@taria.com', '$2a$10$px.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.Y.', 'physician');

INSERT INTO payers (name) VALUES ('Aetna'), ('Cigna'), ('UnitedHealthcare'), ('Self-Pay');

INSERT INTO clinical_parameters (name, type, unit, category) VALUES 
('Blood Pressure (Systolic)', 'numeric', 'mmHg', 'vital_sign'),
('Blood Pressure (Diastolic)', 'numeric', 'mmHg', 'vital_sign'),
('Heart Rate', 'numeric', 'bpm', 'vital_sign'),
('Blood Glucose', 'numeric', 'mg/dL', 'lab_result'),
('Weight', 'numeric', 'kg', 'clinical_measurement');

INSERT INTO medications (name, dosage) VALUES ('Metformin', '500mg'), ('Lisinopril', '10mg');
