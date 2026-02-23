-- Taria Health - Full Database Schema and Seed Data

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- 1. Users Table
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL UNIQUE,
  `password` varchar(255) NOT NULL,
  `role` enum('admin', 'staff', 'physician', 'navigator', 'payer', 'patient') DEFAULT 'navigator',
  `avatarUrl` varchar(500) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed Users (Password is 'password')
INSERT INTO `users` VALUES 
(1, 'Dr. Emily Carter', 'admin@taria.com', '$2a$10$7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8eu.v.X.v.X.v.X.v.X.v.X.v.X.v.X.', 'admin', 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njg2NzM0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080'),
(2, 'John Davis', 'navigator@taria.com', '$2a$10$7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8eu.v.X.v.X.v.X.v.X.v.X.v.X.v.X.', 'navigator', 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njg2NzM0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080'),
(3, 'Dr. Ben Stone', 'physician@taria.com', '$2a$10$7Z8Z8Z8Z8Z8Z8Z8Z8Z8Z8eu.v.X.v.X.v.X.v.X.v.X.v.X.v.X.', 'physician', 'https://images.unsplash.com/photo-1590086782792-42dd2350140d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3NDE5ODJ8MHwxfHNlYXJjaHw0fHxwZXJzb24lMjBwb3J0cmFpdHxlbnwwfHx8fDE3Njg2NzM0NjV8MA&ixlib=rb-4.1.0&q=80&w=1080');

-- 2. Corporates Table
DROP TABLE IF EXISTS `corporates`;
CREATE TABLE `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `corporates` VALUES (1, 'Innovate Inc.', '2023-05-15'), (2, 'HealthForward', '2023-06-01');

-- 3. Payers Table
DROP TABLE IF EXISTS `payers`;
CREATE TABLE `payers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `payers` VALUES (1, 'Aetna'), (2, 'Cigna'), (3, 'UnitedHealthcare'), (4, 'Self-Pay');

-- 4. Clinical Parameters Table
DROP TABLE IF EXISTS `clinical_parameters`;
CREATE TABLE `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric', 'text', 'choice') DEFAULT 'numeric',
  `unit` varchar(50) DEFAULT NULL,
  `options` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `clinical_parameters` VALUES 
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', NULL, 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', NULL, 'lab_result'),
(5, 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', NULL, 'clinical_measurement'),
(7, 'Mood', 'choice', NULL, 'Happy,Anxious,Sad,Calm,Irritable', 'assessment'),
(8, 'Pain Level', 'numeric', '/ 10', NULL, 'symptom');

-- 5. Patients Table
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(255) NOT NULL,
  `surname` varchar(255) DEFAULT NULL,
  `age` int DEFAULT NULL,
  `gender` enum('Male', 'Female') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `status` enum('Active', 'Pending', 'Critical', 'Discharged', 'In Review') DEFAULT 'Pending',
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `emr_number` varchar(100) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int DEFAULT NULL,
  `consent_date` date DEFAULT NULL,
  `brief_medical_history` text DEFAULT NULL,
  `years_since_diagnosis` int DEFAULT NULL,
  `past_medical_interventions` text DEFAULT NULL,
  `relevant_family_history` text DEFAULT NULL,
  `has_weighing_scale` boolean DEFAULT FALSE,
  `has_glucometer` boolean DEFAULT FALSE,
  `has_bp_machine` boolean DEFAULT FALSE,
  `has_tape_measure` boolean DEFAULT FALSE,
  `dietary_restrictions` text DEFAULT NULL,
  `allergies_intolerances` text DEFAULT NULL,
  `lifestyle_factors` text DEFAULT NULL,
  `physical_limitations` text DEFAULT NULL,
  `psychosocial_factors` text DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `middle_name` varchar(255) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `corporate_id` int DEFAULT NULL,
  `payer_id` int DEFAULT NULL,
  `date_of_diagnosis` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`navigator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates` (`id`) ON DELETE SET NULL,
  FOREIGN KEY (`payer_id`) REFERENCES `payers` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `patients` VALUES 
(1, NULL, 'John', 'Doe', 39, 'Male', 'john.doe@example.com', 'Type 2 Diabetes', 'Active', '2023-05-15 10:00:00', 'EMR-001', '2023-05-16', 2, '2023-05-15', 'Diagnosed with Type 2 Diabetes in 2020.', 3, 'Started on Metformin.', 'Father has Type 2 Diabetes.', 1, 1, 1, 0, 'Low-carb.', 'None.', 'Desk job.', 'None.', 'Occasional stress.', '555-0101', '1985-04-12', NULL, '2023-05-15', 1, 1, '2020-01-10'),
(2, NULL, 'Jane', 'Smith', 33, 'Female', 'jane.smith@example.com', NULL, 'Pending', '2023-06-01 11:30:00', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, '555-0103', '1990-08-22', NULL, '2023-06-01', 2, NULL, NULL),
(3, NULL, 'Peter', 'Jones', 45, 'Male', 'peter.jones@example.com', 'Hypertension', 'Critical', '2023-05-15 10:15:00', 'EMR-003', '2023-05-17', 2, '2023-05-15', 'History of hypertension.', 10, 'Prescribed Lisinopril.', 'Mother had hypertension.', 1, 1, 1, 1, 'Low-sodium.', 'Penicillin.', 'Smoker.', 'None.', 'High-stress job.', '555-0104', '1978-11-02', NULL, '2023-05-15', 1, 2, '2013-03-20');

-- 6. Assessments Table
DROP TABLE IF EXISTS `assessments`;
CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `is_normal` boolean DEFAULT NULL,
  `measured_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `notes`, `is_normal`, `measured_at`, `created_at`) VALUES 
(1, 1, '135', 'Initial reading high.', 0, '2023-05-17 10:00:00', '2023-05-17 10:00:00'),
(1, 1, '132', NULL, 0, '2023-05-24 10:00:00', '2023-05-24 10:00:00'),
(1, 1, '128', 'Showing improvement.', 1, '2023-05-31 10:00:00', '2023-05-31 10:00:00'),
(1, 1, '125', NULL, 1, '2023-06-07 10:00:00', '2023-06-07 10:00:00'),
(1, 1, '122', 'Good progress.', 1, '2023-06-14 10:00:00', '2023-06-14 10:00:00'),
(1, 1, '120', 'Goal range achieved.', 1, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(1, 5, '88', 'Starting weight.', 0, '2023-05-17 10:00:00', '2023-05-17 10:00:00'),
(1, 5, '87.5', NULL, 0, '2023-05-24 10:00:00', '2023-05-24 10:00:00'),
(1, 5, '87', NULL, 0, '2023-05-31 10:00:00', '2023-05-31 10:00:00'),
(1, 5, '86', NULL, 0, '2023-06-07 10:00:00', '2023-06-07 10:00:00'),
(1, 5, '85.5', NULL, 0, '2023-06-14 10:00:00', '2023-06-14 10:00:00'),
(1, 5, '85', NULL, 0, '2023-06-20 10:00:00', '2023-06-20 10:00:00');

-- 7. Goals Table
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<', '<=', '=', '>=', '>') DEFAULT '<=',
  `status` enum('active', 'completed', 'cancelled') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `deadline` date NOT NULL,
  `created_at` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `goals` VALUES 
(1, 1, 5, '80', '<=', 'active', 'Focus on diet and exercise.', '2023-09-20', '2023-06-20 10:00:00'),
(2, 3, 1, '130', '<=', 'active', 'Monitor BP twice daily.', '2023-08-19', '2023-06-19 09:00:00');

-- 8. Medications Table
DROP TABLE IF EXISTS `medications`;
CREATE TABLE `medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `medications` VALUES (1, 'Metformin', '500mg'), (2, 'Lisinopril', '10mg');

-- 9. Prescriptions Table
DROP TABLE IF EXISTS `prescriptions`;
CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medication_id` int NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(255) NOT NULL,
  `start_date` date NOT NULL,
  `expiry_date` date DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `status` enum('active', 'completed', 'discontinued') DEFAULT 'active',
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`medication_id`) REFERENCES `medications` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `prescriptions` VALUES (1, 1, 1, '500mg', 'twice_daily', '2023-05-16', '2024-05-16', 'Take with meals.', 'active');

-- 10. Appointments Table
DROP TABLE IF EXISTS `appointments`;
CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinician_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `appointment_date` timestamp NOT NULL,
  `end_date` timestamp NULL DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('scheduled', 'confirmed', 'cancelled', 'completed', 'no_show', 'rescheduled') DEFAULT 'scheduled',
  `cancellation_reason` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`clinician_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `appointments` VALUES (1, 1, 3, 'Follow-up Consultation', '2023-07-15 14:00:00', '2023-07-15 14:30:00', 'Review readings.', 'scheduled', NULL);

-- 11. Reviews Table
DROP TABLE IF EXISTS `reviews`;
CREATE TABLE `reviews` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `reviewed_by_id` int NOT NULL,
  `review_date` date NOT NULL,
  `subjective_findings` text DEFAULT NULL,
  `objective_findings` text DEFAULT NULL,
  `assessment` text NOT NULL,
  `plan` text NOT NULL,
  `recommendations` text DEFAULT NULL,
  `follow_up_date` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`reviewed_by_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO `reviews` VALUES (1, 1, 3, '2023-06-20', 'Patient feels well.', 'Glucose stable.', 'Good control.', 'Continue.', 'Regular exercise.', '2023-07-15');

SET FOREIGN_KEY_CHECKS = 1;
