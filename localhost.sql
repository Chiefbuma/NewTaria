-- Taria Health - Database Schema and Initial Data
-- Use this script to initialize your MySQL database.

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for users
-- ----------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','navigator','physician','staff','user','partner') DEFAULT 'user',
  `avatarUrl` varchar(500) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for partners
-- ----------------------------
DROP TABLE IF EXISTS `partners`;
CREATE TABLE `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for patients
-- ----------------------------
DROP TABLE IF EXISTS `patients`;
CREATE TABLE `patients` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `user_id` int(11) DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `gender` enum('Male','Female') DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(50) DEFAULT NULL,
  `status` enum('Active','Pending','Critical','Discharged','In Review') DEFAULT 'Pending',
  `emr_number` varchar(100) DEFAULT NULL,
  `date_of_onboarding` date DEFAULT NULL,
  `navigator_id` int(11) DEFAULT NULL,
  `partner_id` int(11) DEFAULT NULL,
  `corporate_id` int(11) DEFAULT NULL,
  `wellness_date` date DEFAULT NULL,
  `date_of_diagnosis` date DEFAULT NULL,
  `brief_medical_history` text DEFAULT NULL,
  `primary_diagnosis` enum('Hypertension','Diabetes','Hypertension and Diabetes') DEFAULT NULL,
  `years_since_diagnosis` int(11) DEFAULT NULL,
  `past_medical_interventions` text DEFAULT NULL,
  `relevant_family_history` text DEFAULT NULL,
  `has_weighing_scale` tinyint(1) DEFAULT 0,
  `has_glucometer` tinyint(1) DEFAULT 0,
  `has_bp_machine` tinyint(1) DEFAULT 0,
  `has_tape_measure` tinyint(1) DEFAULT 0,
  `dietary_restrictions` text DEFAULT NULL,
  `allergies_intolerances` text DEFAULT NULL,
  `lifestyle_factors` text DEFAULT NULL,
  `physical_limitations` text DEFAULT NULL,
  `psychosocial_factors` text DEFAULT NULL,
  `emergency_contact_name` varchar(255) DEFAULT NULL,
  `emergency_contact_phone` varchar(50) DEFAULT NULL,
  `emergency_contact_relation` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `navigator_id` (`navigator_id`),
  CONSTRAINT `patients_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `patients_ibfk_2` FOREIGN KEY (`navigator_id`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for clinical_parameters
-- ----------------------------
DROP TABLE IF EXISTS `clinical_parameters`;
CREATE TABLE `clinical_parameters` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` text DEFAULT NULL,
  `category` varchar(100) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for assessments
-- ----------------------------
DROP TABLE IF EXISTS `assessments`;
CREATE TABLE `assessments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text DEFAULT NULL,
  `is_normal` tinyint(1) DEFAULT NULL,
  `measured_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinical_parameter_id` (`clinical_parameter_id`),
  CONSTRAINT `assessments_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE,
  CONSTRAINT `assessments_ibfk_2` FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for goals
-- ----------------------------
DROP TABLE IF EXISTS `goals`;
CREATE TABLE `goals` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `patient_id` int(11) NOT NULL,
  `clinical_parameter_id` int(11) NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` enum('<','<=','=','>=','>') NOT NULL,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `notes` text DEFAULT NULL,
  `deadline` date DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  CONSTRAINT `goals_ibfk_1` FOREIGN KEY (`patient_id`) REFERENCES `patients` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Table structure for messages
-- ----------------------------
DROP TABLE IF EXISTS `messages`;
CREATE TABLE `messages` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `sender_id` int(11) NOT NULL,
  `receiver_id` int(11) NOT NULL,
  `content` text NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `sender_id` (`sender_id`),
  KEY `receiver_id` (`receiver_id`),
  CONSTRAINT `messages_ibfk_1` FOREIGN KEY (`sender_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `messages_ibfk_2` FOREIGN KEY (`receiver_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ----------------------------
-- Initial Data
-- ----------------------------

-- Add default Admin and Navigator
INSERT INTO `users` (`name`, `email`, `password`, `role`) VALUES 
('System Admin', 'admin@taria.com', '$2a$10$K7Z.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.', 'admin'),
('John Navigator', 'navigator@taria.com', '$2a$10$K7Z.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.Z7X.X.', 'navigator');

-- Add Partners
INSERT INTO `partners` (`name`) VALUES ('Aetna'), ('Cigna'), ('UnitedHealthcare');

-- Add Clinical Parameters
INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`) VALUES 
('Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
('Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
('Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm"]', 'assessment'),
('KCB Status', 'choice', NULL, '["Good", "Better", "Worst"]', 'assessment'),
('Qualitative Progress', 'text', NULL, NULL, 'assessment');

-- Add 5 Sample Patients (3 Male, 2 Female)
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`) VALUES 
('Michael', 'Ondieki', '1985-05-15', 'Male', 'michael@example.com', '0711223344', 'Active', 'Hypertension', '2024-01-10'),
('Sarah', 'Wambui', '1992-08-22', 'Female', 'sarah@example.com', '0722334455', 'Active', 'Diabetes', '2024-01-15'),
('David', 'Kariuki', '1970-11-03', 'Male', 'david@example.com', '0733445566', 'Critical', 'Hypertension and Diabetes', '2024-01-20'),
('Emily', 'Atieno', '1965-02-28', 'Female', 'emily@example.com', '0744556677', 'Active', 'Hypertension', '2024-02-01'),
('Joseph', 'Oloo', '1998-12-12', 'Male', 'joseph@example.com', '0755667788', 'Pending', NULL, NULL);

-- Add Assessments for each Active/Critical Patient
-- Patient 1 (Michael)
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `notes`, `measured_at`) VALUES 
(1, 1, '130', 'Post-exercise', NOW()),
(1, 2, '85', NULL, NOW()),
(1, 3, '82', 'Slightly over target', NOW()),
(1, 4, 'Calm', 'Patient feels stable', NOW()),
(1, 5, 'Better', 'Improving adherence', NOW()),
(1, 6, 'Patient is responding well to Lisinopril.', NULL, NOW());

-- Patient 2 (Sarah)
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `notes`, `measured_at`) VALUES 
(2, 1, '120', 'Target met', NOW()),
(2, 2, '80', NULL, NOW()),
(2, 3, '65', 'Stable weight', NOW()),
(2, 4, 'Happy', 'Excellent mood', NOW()),
(2, 5, 'Good', 'Full adherence', NOW()),
(2, 6, 'Blood sugar levels are within normal range this week.', NULL, NOW());

-- Patient 3 (David)
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `notes`, `measured_at`) VALUES 
(3, 1, '155', 'High - requires review', NOW()),
(3, 2, '98', NULL, NOW()),
(3, 3, '95', 'Significant gain', NOW()),
(3, 4, 'Anxious', 'Worried about readings', NOW()),
(3, 5, 'Worst', 'Missed doses reported', NOW()),
(3, 6, 'Urgent follow-up required regarding medication adjustment.', NULL, NOW());

-- Patient 4 (Emily)
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `notes`, `measured_at`) VALUES 
(4, 1, '135', 'Moderate', NOW()),
(4, 2, '88', NULL, NOW()),
(4, 3, '72', 'Stable', NOW()),
(4, 4, 'Calm', 'Normal', NOW()),
(4, 5, 'Better', 'Doing okay', NOW()),
(4, 6, 'Stable overall, maintaining current regimen.', NULL, NOW());

-- Add Goals
INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `deadline`) VALUES 
(1, 1, '120', '<=', 'active', '2024-12-31'),
(2, 3, '64', '<=', 'completed', '2024-06-01'),
(3, 1, '130', '<=', 'active', '2024-03-01');

SET FOREIGN_KEY_CHECKS = 1;
