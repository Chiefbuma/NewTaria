
-- Taria Health Database Schema and Seed Data
-- Import this file into your MySQL database (e.g., gledcapi_whiskedelight)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'staff', 'physician', 'navigator', 'payer', 'patient') NOT NULL DEFAULT 'navigator',
  `avatarUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Records of users (Password for all is 'password')
-- ----------------------------
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `avatarUrl`) VALUES
(1, 'Dr. Emily Carter', 'admin@taria.com', '$2a$10$Kiq6.Sls8Z.pH.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.', 'admin', 'https://i.pravatar.cc/150?u=emily'),
(2, 'John Davis', 'navigator@taria.com', '$2a$10$Kiq6.Sls8Z.pH.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.', 'navigator', 'https://i.pravatar.cc/150?u=john'),
(3, 'Dr. Ben Stone', 'physician@taria.com', '$2a$10$Kiq6.Sls8Z.pH.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.Z.', 'physician', 'https://i.pravatar.cc/150?u=ben');

-- ----------------------------
-- Table structure for clinical_parameters
-- ----------------------------
DROP TABLE IF EXISTS `clinical_parameters`;
CREATE TABLE `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric', 'text', 'choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` text, -- JSON string for choice options
  `category` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clinical_parameters` (`id`, `name`, `type`, `unit`, `options`, `category`) VALUES
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', NULL, 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', NULL, 'lab_result'),
(5, 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', NULL, 'clinical_measurement');

-- ----------------------------
-- Table structure for corporates
-- ----------------------------
DROP TABLE IF EXISTS `corporates`;
CREATE TABLE `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `corporates` (`id`, `name`, `wellness_date`) VALUES
(1, 'Innovate Inc.', '2023-05-15'),
(2, 'HealthForward', '2023-06-01');

-- ----------------------------
-- Table structure for payers
-- ----------------------------
DROP TABLE IF EXISTS `payers`;
CREATE TABLE `payers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payers` (`id`, `name`) VALUES (1, 'Aetna'), (2, 'Cigna'), (3, 'UnitedHealthcare'), (4, 'Self-Pay');

-- ----------------------------
-- Table structure for patients
-- ----------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` varchar(20) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `corporate_id` int DEFAULT NULL,
  `payer_id` int DEFAULT NULL,
  `status` varchar(50) NOT NULL DEFAULT 'Pending',
  `emr_number` varchar(100) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int DEFAULT NULL,
  `consent_date` date DEFAULT NULL,
  `brief_medical_history` text,
  `years_since_diagnosis` int DEFAULT NULL,
  `past_medical_interventions` text,
  `relevant_family_history` text,
  `has_weighing_scale` boolean DEFAULT 0,
  `has_glucometer` boolean DEFAULT 0,
  `has_bp_machine` boolean DEFAULT 0,
  `has_tape_measure` boolean DEFAULT 0,
  `dietary_restrictions` text,
  `allergies_intolerances` text,
  `lifestyle_factors` text,
  `physical_limitations` text,
  `psychosocial_factors` text,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`),
  FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`),
  FOREIGN KEY (`navigator_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `patients` (`id`, `first_name`, `surname`, `age`, `gender`, `status`, `corporate_id`, `wellness_date`, `date_of_onboarding`) VALUES
(1, 'John', 'Doe', 39, 'Male', 'Active', 1, '2023-05-15', '2023-05-16'),
(2, 'Jane', 'Smith', 33, 'Female', 'Pending', 2, '2023-06-01', NULL),
(3, 'Peter', 'Jones', 45, 'Male', 'Critical', 1, '2023-05-15', '2023-05-17');

-- ----------------------------
-- Table structure for assessments
-- ----------------------------
DROP TABLE IF EXISTS `assessments`;
CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text,
  `is_normal` boolean DEFAULT NULL,
  `measured_at` timestamp NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data for John Doe (Patient 1)
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`, `is_normal`) VALUES
(1, 1, '135', '2023-05-17 10:00:00', 0),
(1, 1, '132', '2023-05-24 10:00:00', 0),
(1, 1, '128', '2023-05-31 10:00:00', 1),
(1, 1, '125', '2023-06-07 10:00:00', 1),
(1, 5, '88', '2023-05-17 10:00:00', 0),
(1, 5, '87.5', '2023-05-24 10:00:00', 0),
(1, 5, '87', '2023-05-31 10:00:00', 0);

-- ----------------------------
-- Table structure for goals
-- ----------------------------
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<', '<=', '=', '>=', '>') NOT NULL DEFAULT '<=',
  `status` enum('active', 'completed', 'cancelled') NOT NULL DEFAULT 'active',
  `deadline` date NOT NULL,
  `notes` text,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `deadline`, `status`) VALUES
(1, 1, '120', '<=', '2023-09-20', 'active'),
(1, 5, '80', '<=', '2023-09-20', 'active');

-- ----------------------------
-- Table structure for appointments
-- ----------------------------
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinician_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `description` text,
  `status` enum('scheduled','confirmed','cancelled','completed','no_show','rescheduled') NOT NULL DEFAULT 'scheduled',
  `cancellation_reason` text,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinician_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `appointments` (`patient_id`, `clinician_id`, `title`, `appointment_date`, `status`) VALUES
(1, 3, 'Follow-up Consultation', '2025-07-15 14:00:00', 'scheduled');

-- ----------------------------
-- Table structure for reviews
-- ----------------------------
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `reviewed_by_id` int NOT NULL,
  `review_date` date NOT NULL,
  `subjective_findings` text,
  `objective_findings` text,
  `assessment` text,
  `plan` text,
  `recommendations` text,
  `follow_up_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `reviews` (`patient_id`, `reviewed_by_id`, `review_date`, `plan`) VALUES
(1, 3, '2023-06-20', 'Continue current medication and diet.'),
(3, 3, '2023-06-19', 'Adjust medication (Lisinopril to 20mg).');

-- ----------------------------
-- Table structure for medications
-- ----------------------------
DROP TABLE IF EXISTS `medications`;
CREATE TABLE `medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medications` (`id`, `name`, `dosage`) VALUES (1, 'Metformin', '500mg'), (2, 'Lisinopril', '10mg');

-- ----------------------------
-- Table structure for prescriptions
-- ----------------------------
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medication_id` int NOT NULL,
  `dosage` varchar(100) NOT NULL,
  `frequency` varchar(100) NOT NULL,
  `start_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text,
  `status` enum('active', 'completed', 'discontinued') NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`medication_id`) REFERENCES `medications`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `prescriptions` (`patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `status`) VALUES
(1, 1, '500mg', 'twice daily', '2023-05-16', 'active');

SET FOREIGN_KEY_CHECKS = 1;
