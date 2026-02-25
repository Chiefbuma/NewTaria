
-- Taria Health - Full Production Database Schema
-- Optimized for Next.js 15 and MySQL 8.0+

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- 1. Organizations & Partners
CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. System Users
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer','user','partner') NOT NULL DEFAULT 'user',
  `avatarUrl` varchar(255) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_user_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Patient Records
CREATE TABLE `patients` (
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
  `status` enum('Active','Pending','Critical','Discharged','In Review') NOT NULL DEFAULT 'Pending',
  `emr_number` varchar(100) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int(11) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
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
  `physical_limitations` text DEFAULT NULL,
  `psychosocial_factors` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_patient_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_navigator` FOREIGN KEY (`navigator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_patient_partner` FOREIGN KEY (`partner_id`) REFERENCES `partners` (`id`) ON DELETE SET NULL
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
  PRIMARY KEY (`id`)
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
  PRIMARY KEY (`id`)
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
  CONSTRAINT `fk_appt_patient` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_appt_clinician` FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SEED DATA
INSERT INTO `partners` (`name`) VALUES ('Aetna Insurance'), ('Blue Cross'), ('Self-Pay');

INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES 
('System Admin', 'admin@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'admin'),
('Navigator One', 'nav@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'navigator');

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`) VALUES 
('Systolic BP', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Diastolic BP', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
('KCB Status', 'choice', NULL, '["Good", "Average", "Bad"]', 'assessment'),
('Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm"]', 'assessment'),
('Clinic Notes', 'text', NULL, NULL, 'assessment');

-- SEED 5 PATIENTS (3 Male, 2 Female)
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`) VALUES 
('James', 'Smith', '1985-05-15', 'Male', 'james@example.com', '0711000001', 'Active', 'Hypertension', CURDATE()),
('Robert', 'Johnson', '1972-11-20', 'Male', 'robert@example.com', '0711000002', 'Active', 'Diabetes', CURDATE()),
('Michael', 'Brown', '1960-03-10', 'Male', 'michael@example.com', '0711000003', 'Active', 'Hypertension and Diabetes', CURDATE()),
('Maria', 'Garcia', '1990-08-22', 'Female', 'maria@example.com', '0711000004', 'Active', 'Hypertension', CURDATE()),
('Sarah', 'Wilson', '1982-12-05', 'Female', 'sarah@example.com', '0711000005', 'Active', 'Diabetes', CURDATE());

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

COMMIT;
