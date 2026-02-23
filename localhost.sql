-- Taria Health - Production Database Schema & Seed Data

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- Table structure for table `users`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer','patient') NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Seed Users (Passwords are hashed 'password')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatarUrl`) VALUES
(1, 'Dr. Emily Carter', 'admin@taria.com', '$2a$10$EqfJ6V6f6V6f6V6f6V6f6u6f6V6f6V6f6V6f6V6f6V6f6V6f6V6f6', 'admin', 'https://i.pravatar.cc/150?u=emily'),
(2, 'John Davis', 'navigator@taria.com', '$2a$10$EqfJ6V6f6V6f6V6f6V6f6u6f6V6f6V6f6V6f6V6f6V6f6V6f6V6f6', 'navigator', 'https://i.pravatar.cc/150?u=john'),
(3, 'Dr. Ben Stone', 'physician@taria.com', '$2a$10$EqfJ6V6f6V6f6V6f6V6f6u6f6V6f6V6f6V6f6V6f6V6f6V6f6V6f6', 'physician', 'https://i.pravatar.cc/150?u=ben');

-- --------------------------------------------------------
-- Table structure for table `corporates`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `corporates` (`id`, `name`, `wellness_date`) VALUES
(1, 'Innovate Inc.', '2023-05-15'),
(2, 'HealthForward', '2023-06-01');

-- --------------------------------------------------------
-- Table structure for table `payers`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `payers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payers` (`id`, `name`) VALUES
(1, 'Aetna'), (2, 'Cigna'), (3, 'UnitedHealthcare'), (4, 'Self-Pay');

-- --------------------------------------------------------
-- Table structure for table `patients`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `wellness_date` date NOT NULL,
  `corporate_id` int DEFAULT NULL,
  `payer_id` int DEFAULT NULL,
  `status` enum('Active','Pending','Critical','Discharged','In Review') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `emr_number` varchar(50) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `has_glucometer` tinyint(1) DEFAULT '0',
  `has_bp_machine` tinyint(1) DEFAULT '0',
  `has_tape_measure` tinyint(1) DEFAULT '0',
  `has_weighing_scale` tinyint(1) DEFAULT '0',
  `brief_medical_history` text,
  `years_since_diagnosis` int DEFAULT NULL,
  `past_medical_interventions` text,
  `relevant_family_history` text,
  `dietary_restrictions` text,
  `allergies_intolerances` text,
  `lifestyle_factors` text,
  `physical_limitations` text,
  `psychosocial_factors` text,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `consent_date` date DEFAULT NULL,
  `navigator_id` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`),
  FOREIGN KEY (`navigator_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `patients` (`id`, `first_name`, `surname`, `age`, `gender`, `email`, `status`, `wellness_date`, `corporate_id`, `emr_number`, `date_of_onboarding`, `navigator_id`) VALUES
(1, 'John', 'Doe', 39, 'Male', 'john.doe@example.com', 'Active', '2023-05-15', 1, 'EMR-001', '2023-05-16', 2),
(2, 'Jane', 'Smith', 33, 'Female', 'jane.smith@example.com', 'Pending', '2023-06-01', 2, NULL, NULL, NULL),
(3, 'Peter', 'Jones', 45, 'Male', 'peter.jones@example.com', 'Critical', '2023-05-15', 1, 'EMR-003', '2023-05-17', 2);

-- --------------------------------------------------------
-- Table structure for table `clinical_parameters`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` json DEFAULT NULL,
  `category` enum('vital_sign','lab_result','clinical_measurement','symptom','assessment') NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clinical_parameters` (`id`, `name`, `type`, `unit`, `options`, `category`) VALUES
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', NULL, 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', NULL, 'lab_result'),
(5, 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', NULL, 'clinical_measurement');

-- --------------------------------------------------------
-- Table structure for table `assessments`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text,
  `is_normal` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `measured_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `assessments` (patient_id, clinical_parameter_id, value, measured_at, is_normal) VALUES
(1, 1, '135', '2023-05-17', 0), (1, 1, '132', '2023-05-24', 0), (1, 1, '128', '2023-05-31', 1), (1, 1, '125', '2023-06-07', 1), (1, 1, '122', '2023-06-14', 1), (1, 1, '120', '2023-06-20', 1),
(1, 2, '88', '2023-05-17', 0), (1, 2, '85', '2023-05-24', 1), (1, 2, '82', '2023-05-31', 1), (1, 2, '80', '2023-06-20', 1),
(1, 5, '88', '2023-05-17', 0), (1, 5, '87.5', '2023-05-24', 0), (1, 5, '87', '2023-05-31', 0), (1, 5, '86', '2023-06-07', 0), (1, 5, '85.5', '2023-06-14', 0), (1, 5, '85', '2023-06-20', 0);

-- --------------------------------------------------------
-- Table structure for table `goals`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<','<=','=','>=','>') NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL,
  `notes` text,
  `deadline` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `goals` (patient_id, clinical_parameter_id, target_value, target_operator, status, deadline) VALUES
(1, 5, '80', '<=', 'active', '2023-09-20'),
(3, 1, '130', '<=', 'active', '2023-08-19');

-- --------------------------------------------------------
-- Table structure for table `medications`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medications` (id, name, dosage) VALUES (1, 'Metformin', '500mg'), (2, 'Lisinopril', '10mg');

-- --------------------------------------------------------
-- Table structure for table `prescriptions`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medication_id` int NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text,
  `status` enum('active','completed','discontinued') NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `prescriptions` (patient_id, medication_id, dosage, frequency, start_date, expiry_date, status) VALUES
(1, 1, '500mg', 'Twice daily', '2023-05-16', '2024-05-16', 'active'),
(3, 2, '10mg', 'Daily', '2023-05-17', NULL, 'active');

-- --------------------------------------------------------
-- Table structure for table `appointments`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id" int NOT NULL,
  `clinician_id` int NOT NULL,
  `title" varchar(255) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `description` text,
  `status` enum('scheduled','confirmed','cancelled','completed','no_show','rescheduled') NOT NULL,
  `cancellation_reason` text,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinician_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `appointments` (patient_id, clinician_id, title, appointment_date, status) VALUES
(1, 3, 'Follow-up Consultation', '2023-07-15 14:00:00', 'scheduled'),
(3, 3, 'BP Check', '2023-07-10 09:00:00', 'confirmed'),
(1, 3, 'Quarterly Review', '2025-08-01 10:00:00', 'scheduled');

-- --------------------------------------------------------
-- Table structure for table `reviews`
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `reviewed_by_id` int NOT NULL,
  `review_date` date NOT NULL,
  `subjective_findings` text,
  `objective_findings` text,
  `assessment` text NOT NULL,
  `plan` text NOT NULL,
  `recommendations` text,
  `follow_up_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `reviews` (patient_id, reviewed_by_id, review_date, assessment, plan) VALUES
(1, 3, '2023-06-20', 'Good control of diabetes.', 'Continue current medication and diet.'),
(3, 3, '2023-06-19', 'Uncontrolled hypertension.', 'Adjust medication (Lisinopril to 20mg).');

COMMIT;
