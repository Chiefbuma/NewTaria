-- Taria Health - Production Schema with Soft Delete Support

-- Partners Table
CREATE TABLE IF NOT EXISTS partners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'navigator', 'clinician', 'user', 'partner') DEFAULT 'user',
    avatarUrl VARCHAR(255),
    partner_id INT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
);

-- Corporates Table
CREATE TABLE IF NOT EXISTS corporates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    wellness_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Patients Table
CREATE TABLE IF NOT EXISTS patients (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    surname VARCHAR(100),
    dob DATE,
    age INT,
    gender ENUM('Male', 'Female'),
    email VARCHAR(255),
    phone VARCHAR(50),
    status ENUM('Active', 'Pending', 'Critical', 'Discharged', 'In Review') DEFAULT 'Pending',
    emr_number VARCHAR(100),
    date_of_onboarding DATE,
    navigator_id INT,
    partner_id INT,
    corporate_id INT,
    wellness_date DATE,
    date_of_diagnosis DATE,
    brief_medical_history TEXT,
    years_since_diagnosis INT,
    past_medical_interventions TEXT,
    relevant_family_history TEXT,
    has_weighing_scale BOOLEAN DEFAULT FALSE,
    has_glucometer BOOLEAN DEFAULT FALSE,
    has_bp_machine BOOLEAN DEFAULT FALSE,
    has_tape_measure BOOLEAN DEFAULT FALSE,
    dietary_restrictions TEXT,
    allergies_intolerances TEXT,
    lifestyle_factors TEXT,
    physical_limitations TEXT,
    psychosocial_factors TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(50),
    emergency_contact_relation VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (partner_id) REFERENCES partners(id) ON DELETE SET NULL
);

-- Clinical Parameters
CREATE TABLE IF NOT EXISTS clinical_parameters (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type ENUM('numeric', 'text', 'choice') DEFAULT 'numeric',
    unit VARCHAR(50),
    options JSON, -- Store options as JSON array
    category ENUM('vital_sign', 'lab_result', 'clinical_measurement', 'symptom', 'assessment'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Assessments Table
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinical_parameter_id INT NOT NULL,
    value VARCHAR(255) NOT NULL,
    notes TEXT,
    is_normal BOOLEAN NULL,
    measured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinical_parameter_id) REFERENCES clinical_parameters(id)
);

-- Goals Table
CREATE TABLE IF NOT EXISTS goals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    clinical_parameter_id INT NOT NULL,
    target_value VARCHAR(255) NOT NULL,
    target_operator ENUM('<', '<=', '=', '>=', '>'),
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    notes TEXT,
    deadline DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinical_parameter_id) REFERENCES clinical_parameters(id)
);

-- Medications Table
CREATE TABLE IF NOT EXISTS medications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id INT NOT NULL,
    medication_id INT NOT NULL,
    dosage VARCHAR(255),
    frequency VARCHAR(255),
    start_date DATE,
    expiry_date DATE,
    notes TEXT,
    status ENUM('active', 'completed', 'discontinued') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (medication_id) REFERENCES medications(id)
);

-- Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
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
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (clinician_id) REFERENCES users(id)
);

-- Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
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
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (patient_id) REFERENCES patients(id),
    FOREIGN KEY (reviewed_by_id) REFERENCES users(id)
);

-- Messages Table
CREATE TABLE IF NOT EXISTS messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    FOREIGN KEY (sender_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- SEED DATA (Passwords are 'password')
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@taria.com', '$2a$12$jgUPVh3QVYwJvn/Xb15uIeAsncqKM5uYrtq/Eg.Giz9VK8WXyISW2', 'admin'),
('John Navigator', 'navigator@taria.com', '$2a$10$px.vNb.vOfX6XPB.Z6XPB.Z6XPB.Z6XPB.Z6XPB.Z6XPB.Z6XPB.Z6', 'navigator');

INSERT INTO clinical_parameters (name, type, unit, category) VALUES 
('Blood Pressure (Systolic)', 'numeric', 'mmHg', 'vital_sign'),
('Blood Pressure (Diastolic)', 'numeric', 'mmHg', 'vital_sign'),
('Heart Rate', 'numeric', 'bpm', 'vital_sign'),
('Weight', 'numeric', 'kg', 'clinical_measurement');

INSERT INTO medications (name, dosage) VALUES 
('Metformin', '500mg'),
('Lisinopril', '10mg');
