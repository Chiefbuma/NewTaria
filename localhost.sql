-- Taria Health - Production Database Schema
-- Optimized for Shared Hosting (MySQL 8.0+)

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Users Table (Staff & Clinicians)
CREATE TABLE IF NOT EXISTS `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer','patient') NOT NULL DEFAULT 'navigator',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Corporates Table
CREATE TABLE IF NOT EXISTS `corporates` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Payers Table
CREATE TABLE IF NOT EXISTS `payers` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Patients Table
CREATE TABLE IF NOT EXISTS `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('Active','Pending','Critical','Discharged','In Review') DEFAULT 'Pending',
  `emr_number` varchar(50) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int(11) DEFAULT NULL,
  `corporate_id` int(11) DEFAULT NULL,
  `payer_id` int(11) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `brief_medical_history` text DEFAULT NULL,
  `years_since_diagnosis` int(11) DEFAULT NULL,
  `past_medical_interventions` text DEFAULT NULL,
  `relevant_family_history` text DEFAULT NULL,
  `dietary_restrictions` text DEFAULT NULL,
  `allergies_intolerances` text DEFAULT NULL,
  `lifestyle_factors` text DEFAULT NULL,
  `physical_limitations` text DEFAULT NULL,
  `psychosocial_factors` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `has_weighing_scale` boolean NOT NULL DEFAULT 0,
  `has_glucometer` boolean NOT NULL DEFAULT 0,
  `has_bp_machine` boolean NOT NULL DEFAULT 0,
  `has_tape_measure` boolean NOT NULL DEFAULT 0,
  `consent_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`navigator_id`) REFERENCES `users`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`) ON DELETE SET NULL,
  FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 5. Clinical Parameters
CREATE TABLE IF NOT EXISTS `clinical_parameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL DEFAULT 'numeric',
  `unit` varchar(50) DEFAULT NULL,
  `options` text DEFAULT NULL, -- Comma separated JSON for choice types
  `category` enum('vital_sign','lab_result','clinical_measurement','symptom','assessment') NOT NULL DEFAULT 'vital_sign',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Assessments
CREATE TABLE IF NOT EXISTS `assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `is_normal` boolean DEFAULT NULL,
  `measured_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 7. Goals
CREATE TABLE IF NOT EXISTS `goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<','<=','=','>=','>') NOT NULL DEFAULT '<=',
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Medications
CREATE TABLE IF NOT EXISTS `medications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Prescriptions
CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `medication_id` int(11) NOT NULL,
  `dosage` varchar(255) DEFAULT NULL,
  `frequency` varchar(255) DEFAULT NULL,
  `start_date` date DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active','completed','discontinued') DEFAULT 'active',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 10. Appointments
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinician_id` int(11) NOT NULL,
  `title` varchar(255) NOT NULL,
  `appointment_date` timestamp NOT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('scheduled','confirmed','cancelled','completed','no_show','rescheduled') DEFAULT 'scheduled',
  `cancellation_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinician_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 11. Reviews
CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `reviewed_by_id` int(11) NOT NULL,
  `review_date` date NOT NULL,
  `subjective_findings` text DEFAULT NULL,
  `objective_findings` text DEFAULT NULL,
  `assessment` text DEFAULT NULL,
  `plan` text DEFAULT NULL,
  `recommendations` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- SEED DATA
-- Default Password for all: "password" (hashed)
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`) VALUES
(1, 'Dr. Emily Carter', 'admin@taria.com', '$2a$10$K7Z.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.', 'admin'),
(2, 'John Davis', 'navigator@taria.com', '$2a$10$K7Z.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.', 'navigator'),
(3, 'Dr. Ben Stone', 'physician@taria.com', '$2a$10$K7Z.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.Xv.', 'physician');

INSERT INTO `corporates` (`id`, `name`, `wellness_date`) VALUES
(1, 'Innovate Inc.', '2023-05-15'),
(2, 'HealthForward', '2023-06-01');

INSERT INTO `payers` (`id`, `name`) VALUES
(1, 'Aetna'), (2, 'Cigna'), (3, 'UnitedHealthcare'), (4, 'Self-Pay');

INSERT INTO `clinical_parameters` (`id`, `name`, `type`, `unit`, `category`) VALUES
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', 'lab_result'),
(5, 'Weight', 'numeric', 'kg', 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', 'clinical_measurement');

INSERT INTO `medications` (`id`, `name`, `dosage`) VALUES
(1, 'Metformin', '500mg'),
(2, 'Lisinopril', '10mg');

COMMIT;
