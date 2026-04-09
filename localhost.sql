
-- Taria Health - Full Production Database Schema
-- Optimized for Next.js 15 and MySQL 8.0+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Organizations & Partners
CREATE TABLE `clinics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_clinics_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `partner_type` enum('insurance','clinic','hospital','specialist','corporate') NOT NULL DEFAULT 'insurance',
  `clinic_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_partner_name_type` (`name`, `partner_type`),
  KEY `idx_partners_type` (`partner_type`),
  KEY `idx_partners_clinic_id` (`clinic_id`),
  KEY `idx_partners_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_partner_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `diagnoses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_diagnoses_code` (`code`),
  KEY `idx_diagnoses_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. System Users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','clinician','navigator','payer','user','patient','partner') NOT NULL DEFAULT 'user',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `must_change_password` tinyint(1) NOT NULL DEFAULT 1,
  `password_changed_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_phone` (`phone`),
  KEY `idx_users_role` (`role`),
  KEY `idx_users_partner_id` (`partner_id`),
  KEY `idx_users_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_user_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `password_reset_tokens` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) NOT NULL,
  `token_hash` varchar(64) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `used_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_password_reset_tokens_hash` (`token_hash`),
  KEY `idx_password_reset_tokens_user_id` (`user_id`),
  KEY `idx_password_reset_tokens_expires_at` (`expires_at`),
  KEY `idx_password_reset_tokens_used_at` (`used_at`),
  CONSTRAINT `fk_password_reset_tokens_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Patient Records
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `patient_identifier` varchar(100) DEFAULT NULL,
  `portal_username` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female','Other') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('Active','Pending','Critical','Discharged','In Review') NOT NULL DEFAULT 'Pending',
  `emr_number` varchar(100) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int(11) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `clinic_id` int(11) DEFAULT NULL,
  `primary_diagnosis_id` int(11) DEFAULT NULL,
  `comorbid_conditions` text DEFAULT NULL,
  `current_medications_summary` text DEFAULT NULL,
  `policy_number` varchar(255) DEFAULT NULL,
  `coverage_limits` text DEFAULT NULL,
  `pre_authorization_status` enum('Not Required','Pending','Approved','Denied') DEFAULT 'Not Required',
  `corporate_id` int(11) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `date_of_diagnosis` date DEFAULT NULL,
  `primary_diagnosis` enum('Hypertension','Diabetes','Hypertension and Diabetes') DEFAULT NULL,
  `brief_medical_history` text DEFAULT NULL,
  `years_since_diagnosis` int(11) DEFAULT NULL,
  `past_medical_interventions` text DEFAULT NULL,
  `relevant_family_history` text DEFAULT NULL,
  `has_weighing_scale` tinyint(1) NOT NULL DEFAULT 0,
  `has_glucometer` tinyint(1) NOT NULL DEFAULT 0,
  `has_bp_machine` tinyint(1) NOT NULL DEFAULT 0,
  `has_tape_measure` tinyint(1) NOT NULL DEFAULT 0,
  `dietary_restrictions` text DEFAULT NULL,
  `allergies_intolerances` text DEFAULT NULL,
  `lifestyle_factors` text DEFAULT NULL,
  `social_history` text DEFAULT NULL,
  `physical_limitations` text DEFAULT NULL,
  `psychosocial_factors` text DEFAULT NULL,
  `past_medical_history` text DEFAULT NULL,
  `surgical_history` text DEFAULT NULL,
  `family_history` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `emergency_contact_email` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_patients_identifier` (`patient_identifier`),
  KEY `idx_patients_user_id` (`user_id`),
  KEY `idx_patients_navigator_id` (`navigator_id`),
  KEY `idx_patients_partner_id` (`partner_id`),
  KEY `idx_patients_clinic_id` (`clinic_id`),
  KEY `idx_patients_primary_diagnosis_id` (`primary_diagnosis_id`),
  KEY `idx_patients_status` (`status`),
  KEY `idx_patients_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_navigator` FOREIGN KEY (`navigator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_diagnosis` FOREIGN KEY (`primary_diagnosis_id`) REFERENCES `diagnoses` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Clinical Parameters
CREATE TABLE `clinical_parameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL DEFAULT 'numeric',
  `unit` varchar(50) DEFAULT NULL,
  `options` text DEFAULT NULL,
  `category` enum('vital_sign','lab_result','clinical_measurement','symptom','assessment') NOT NULL DEFAULT 'vital_sign',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_parameters_category` (`category`),
  KEY `idx_parameters_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Clinical Assessments
CREATE TABLE `assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `is_normal` tinyint(1) DEFAULT NULL,
  `measured_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_assessments_patient_param_date` (`patient_id`, `clinical_parameter_id`, `measured_at`),
  KEY `idx_assessments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_assessment_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_assessment_param` FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Health Goals
CREATE TABLE `goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<','<=','=','>=','>') NOT NULL DEFAULT '<=',
  `status` enum('active','completed','cancelled') NOT NULL DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `deadline` date NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_goals_patient_param_status` (`patient_id`, `clinical_parameter_id`, `status`),
  KEY `idx_goals_deadline` (`deadline`),
  KEY `idx_goals_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_goal_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_goal_param` FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Medications & Prescriptions
CREATE TABLE `medications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_medications_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE `prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','completed','discontinued') NOT NULL DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_prescriptions_patient_status` (`patient_id`, `status`),
  KEY `idx_prescriptions_medication_id` (`medication_id`),
  KEY `idx_prescriptions_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_presc_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_presc_med` FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Messaging
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_msg_sender` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_msg_receiver` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Clinical Reviews
CREATE TABLE `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `reviewed_by_id` int(11) NOT NULL,
  `review_date` date NOT NULL,
  `subjective_findings` text DEFAULT NULL,
  `objective_findings` text DEFAULT NULL,
  `assessment` text NOT NULL,
  `plan` text NOT NULL,
  `recommendations` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_reviews_patient_date` (`patient_id`, `review_date`),
  KEY `idx_reviews_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_rev_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_rev_user` FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Appointments
CREATE TABLE `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinician_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `appointment_date` timestamp NOT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('scheduled','confirmed','cancelled','completed','no_show','rescheduled') NOT NULL DEFAULT 'scheduled',
  `cancellation_reason` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_appointments_patient_status_date` (`patient_id`, `status`, `appointment_date`),
  KEY `idx_appointments_clinician_id` (`clinician_id`),
  KEY `idx_appointments_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_clinician` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA
INSERT INTO `clinics` (`name`, `location`) VALUES
('Nairobi Care Centre', 'Nairobi'),
('Mombasa Wellness Hub', 'Mombasa'),
('Kisumu Outreach Clinic', 'Kisumu'),
('Radiant Hospital Group', 'Nairobi');

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`) VALUES
('Aetna Insurance', 'insurance', NULL),
('Blue Cross', 'insurance', NULL),
('Self-Pay', 'insurance', NULL),
('Radiant', 'insurance', NULL),
('Nairobi Care Centre', 'clinic', 1),
('Mombasa Wellness Hub', 'clinic', 2),
('Kisumu Outreach Clinic', 'clinic', 3),
('Radiant Hospital Group', 'clinic', 4);

INSERT INTO `diagnoses` (`code`, `name`, `description`) VALUES
('E11.9', 'Type 2 diabetes mellitus without complications', 'General adult diabetes follow-up.'),
('I10', 'Essential (primary) hypertension', 'Primary blood pressure management.'),
('J45.909', 'Unspecified asthma, uncomplicated', 'Stable outpatient asthma monitoring.');

INSERT INTO `users` (`name`, `phone`, `email`, `password`, `role`, `partner_id`, `must_change_password`, `password_changed_at`) VALUES
('System Admin', '0700000001', 'admin@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'admin', NULL, 1, NULL),
('Navigator One', '0700000002', 'nav@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'navigator', 4, 1, NULL),
('Clinician One', '0700000003', 'clinician@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'clinician', 4, 1, NULL),
('Payer Liaison', '0700000004', 'payer@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'payer', 1, 1, NULL),
('Clinic Liaison', '0700000005', 'clinic@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'partner', 5, 1, NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`) VALUES 
('Systolic BP', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Diastolic BP', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
('KCB Status', 'choice', NULL, '["Good", "Average", "Bad"]', 'assessment'),
('Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm"]', 'assessment'),
('Clinic Notes', 'text', NULL, NULL, 'assessment');

-- SEED PATIENTS
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`) VALUES 
('James', 'Smith', '1985-05-15', 'Male', 'james@example.com', '0711000001', 'Active', 'Hypertension', CURDATE()),
('Robert', 'Johnson', '1972-11-20', 'Male', 'robert@example.com', '0711000002', 'Active', 'Diabetes', CURDATE()),
('Michael', 'Brown', '1960-03-10', 'Male', 'michael@example.com', '0711000003', 'Active', 'Hypertension and Diabetes', CURDATE()),
('Maria', 'Garcia', '1990-08-22', 'Female', 'maria@example.com', '0711000004', 'Active', 'Hypertension', CURDATE()),
('Sarah', 'Wilson', '1982-12-05', 'Female', 'sarah@example.com', '0711000005', 'Active', 'Diabetes', CURDATE()),
('Grace', 'Njeri', '1991-04-12', 'Female', 'grace.njeri@radiant.example.com', '0711000006', 'Active', 'Hypertension', CURDATE()),
('Peter', 'Mwangi', '1988-09-03', 'Male', 'peter.mwangi@radiant.example.com', '0711000007', 'Active', 'Diabetes', CURDATE()),
('Faith', 'Achieng', '1979-01-27', 'Female', 'faith.achieng@radiant.example.com', '0711000008', 'Active', 'Hypertension and Diabetes', CURDATE()),
('Daniel', 'Kiptoo', '1994-06-18', 'Male', 'daniel.kiptoo@radiant.example.com', '0711000009', 'Pending', 'Hypertension', CURDATE());

UPDATE `patients`
SET
  `patient_identifier` = CONCAT('PT-', YEAR(CURDATE()), '-', LPAD(`id`, 5, '0')),
  `portal_username` = CONCAT(LOWER(`first_name`), '.', LPAD(`id`, 4, '0')),
  `clinic_id` = CASE
    WHEN `email` IN ('james@example.com', 'maria@example.com') THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Nairobi Care Centre' LIMIT 1)
    WHEN `email` IN ('robert@example.com', 'sarah@example.com') THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Mombasa Wellness Hub' LIMIT 1)
    WHEN `email` = 'michael@example.com' THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Kisumu Outreach Clinic' LIMIT 1)
    WHEN `email` IN (
      'grace.njeri@radiant.example.com',
      'peter.mwangi@radiant.example.com',
      'faith.achieng@radiant.example.com',
      'daniel.kiptoo@radiant.example.com'
    ) THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Radiant Hospital Group' LIMIT 1)
    ELSE `clinic_id`
  END,
  `partner_id` = CASE
    WHEN `email` IN ('james@example.com', 'maria@example.com') THEN (SELECT `id` FROM `partners` WHERE `name` = 'Aetna Insurance' AND `partner_type` = 'insurance' LIMIT 1)
    WHEN `email` IN ('robert@example.com', 'sarah@example.com') THEN (SELECT `id` FROM `partners` WHERE `name` = 'Blue Cross' AND `partner_type` = 'insurance' LIMIT 1)
    WHEN `email` = 'michael@example.com' THEN (SELECT `id` FROM `partners` WHERE `name` = 'Self-Pay' AND `partner_type` = 'insurance' LIMIT 1)
    WHEN `email` IN (
      'grace.njeri@radiant.example.com',
      'peter.mwangi@radiant.example.com',
      'faith.achieng@radiant.example.com',
      'daniel.kiptoo@radiant.example.com'
    ) THEN (SELECT `id` FROM `partners` WHERE `name` = 'Radiant' AND `partner_type` = 'insurance' LIMIT 1)
    ELSE `partner_id`
  END,
  `primary_diagnosis_id` = CASE
    WHEN `primary_diagnosis` = 'Diabetes' THEN 1
    WHEN `primary_diagnosis` = 'Hypertension' THEN 2
    ELSE 1
  END,
  `policy_number` = CONCAT('POL-', LPAD(`id`, 5, '0')),
  `coverage_limits` = 'Standard annual outpatient cover',
  `pre_authorization_status` = 'Not Required',
  `emergency_contact_name` = CONCAT('Contact ', `id`),
  `emergency_contact_phone` = CONCAT('07220000', LPAD(`id`, 2, '0')),
  `emergency_contact_relation` = 'Sibling',
  `emergency_contact_email` = CONCAT('contact', `id`, '@example.com'),
  `allergies_intolerances` = 'None documented',
  `past_medical_history` = 'Routine follow-up care',
  `surgical_history` = 'No major surgical history reported',
  `family_history` = 'Family history captured at intake',
  `social_history` = 'Lives with family and has phone access',
  `comorbid_conditions` = CASE
    WHEN `email` = 'michael@example.com' THEN 'Obesity'
    WHEN `email` = 'sarah@example.com' THEN 'Asthma'
    WHEN `email` = 'faith.achieng@radiant.example.com' THEN 'Type 2 diabetes, dyslipidemia'
    WHEN `email` = 'daniel.kiptoo@radiant.example.com' THEN 'Obesity'
    ELSE ''
  END
WHERE `patient_identifier` IS NULL;

INSERT INTO `medications` (`name`, `dosage`) VALUES
('Metformin', '500mg'),
('Lisinopril', '10mg'),
('Amlodipine', '5mg'),
('Atorvastatin', '20mg'),
('Salbutamol Inhaler', '100mcg');

-- SEED ASSESSMENTS FOR ALL 5 PATIENTS
-- Patient 1
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`) VALUES 
(1, 1, '130', NOW()), (1, 2, '85', NOW()), (1, 3, '88', NOW()), -- Numeric
(1, 4, 'Good', NOW()), (1, 5, 'Calm', NOW()), -- Choices
(1, 6, 'Patient is adhering to low sodium diet.', NOW()); -- Text

-- Patient 2
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`) VALUES 
(2, 1, '145', NOW()), (2, 2, '95', NOW()), (2, 3, '102', NOW()), 
(2, 4, 'Bad', NOW()), (2, 5, 'Anxious', NOW()), 
(2, 6, 'Experiencing headaches in the mornings.', NOW());

-- Patient 3
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`) VALUES 
(3, 1, '120', NOW()), (3, 2, '80', NOW()), (3, 3, '75', NOW()), 
(3, 4, 'Good', NOW()), (3, 5, 'Happy', NOW()), 
(3, 6, 'Weight loss program yielding results.', NOW());

-- Patient 4
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`) VALUES 
(4, 1, '135', NOW()), (4, 2, '88', NOW()), (4, 3, '68', NOW()), 
(4, 4, 'Average', NOW()), (4, 5, 'Calm', NOW()), 
(4, 6, 'Mild allergic reaction noted.', NOW());

-- Patient 5
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`) VALUES 
(5, 1, '128', NOW()), (5, 2, '82', NOW()), (5, 3, '72', NOW()), 
(5, 4, 'Good', NOW()), (5, 5, 'Happy', NOW()), 
(5, 6, 'Consistent monitoring of glucose levels.', NOW());

INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `notes`, `deadline`) VALUES
(1, 1, '130', '<=', 'active', 'Maintain healthy blood pressure control.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2, 3, '95', '<=', 'active', 'Support gradual weight reduction.', DATE_ADD(CURDATE(), INTERVAL 45 DAY)),
(3, 2, '85', '<=', 'active', 'Reduce diastolic blood pressure.', DATE_ADD(CURDATE(), INTERVAL 21 DAY)),
(4, 4, 'Good', '=', 'active', 'Keep self-management status rated as good.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(5, 5, 'Calm', '=', 'active', 'Improve mood stability and adherence.', DATE_ADD(CURDATE(), INTERVAL 14 DAY));

INSERT INTO `prescriptions` (`patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `expiry_date`, `notes`, `status`) VALUES
(1, 2, '10mg', 'daily', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Monitor blood pressure weekly.', 'active'),
(2, 1, '500mg', 'twice daily', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Take with meals.', 'active'),
(3, 3, '5mg', 'daily', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Evening dose preferred.', 'active'),
(4, 4, '20mg', 'nightly', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Lipid management support.', 'active'),
(5, 5, '2 puffs', 'as needed', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Use for wheezing episodes.', 'active');

INSERT INTO `reviews` (`patient_id`, `reviewed_by_id`, `review_date`, `subjective_findings`, `objective_findings`, `assessment`, `plan`, `recommendations`, `follow_up_date`) VALUES
(1, 3, CURDATE(), 'Patient reports stable blood pressure readings at home.', 'Clinic readings remain within target range.', 'Hypertension well controlled.', 'Continue current therapy.', 'Maintain low-sodium diet and walking program.', DATE_ADD(CURDATE(), INTERVAL 30 DAY)),
(2, 3, CURDATE(), 'Patient notes improved energy with medication adherence.', 'Weight remains above target but stable.', 'Diabetes follow-up ongoing.', 'Continue metformin and nutrition support.', 'Reduce sugary drinks and review fasting readings.', DATE_ADD(CURDATE(), INTERVAL 21 DAY));

INSERT INTO `appointments` (`patient_id`, `clinician_id`, `title`, `appointment_date`, `end_date`, `description`, `status`) VALUES
(1, 3, 'Hypertension Review', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 30 MINUTE), 'Routine blood pressure follow-up.', 'scheduled'),
(2, 3, 'Diabetes Nutrition Check', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 30 MINUTE), 'Review glucose trends and diet plan.', 'confirmed'),
(5, 3, 'Respiratory Follow-up', DATE_ADD(NOW(), INTERVAL 14 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 14 DAY), INTERVAL 30 MINUTE), 'Assess asthma symptom control.', 'scheduled');

INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`) VALUES
(1, 2, 'Please review today''s onboarding queue before noon.'),
(2, 1, 'Received. I will finish the pending registry updates shortly.'),
(3, 2, 'I have added new follow-up appointments for the active care list.');

COMMIT;
