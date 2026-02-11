-- Taria Health - Local Database Dump
-- ------------------------------------------------------

SET NAMES utf8;
SET time_zone = '+00:00';
SET foreign_key_checks = 0;
SET sql_mode = 'NO_AUTO_VALUE_ON_ZERO';

--
-- Drop tables if they exist
--

DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `prescriptions`;
DROP TABLE IF EXISTS `goals`;
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `medications`;
DROP TABLE IF EXISTS `diagnoses`;
DROP TABLE IF EXISTS `clinical_parameters`;
DROP TABLE IF EXISTS `payers`;
DROP TABLE IF EXISTS `corporates`;
DROP TABLE IF EXISTS `users`;

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer','patient') NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `role`, `avatarUrl`) VALUES
(1, 'Dr. Emily Carter', 'admin@taria.com', 'admin', 'https://i.pravatar.cc/150?u=emily'),
(2, 'John Davis', 'navigator@taria.com', 'navigator', 'https://i.pravatar.cc/150?u=john'),
(3, 'Dr. Ben Stone', 'physician@taria.com', 'physician', 'https://i.pravatar.cc/150?u=ben');

--
-- Table structure for table `corporates`
--

CREATE TABLE `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `corporates`
--

INSERT INTO `corporates` (`id`, `name`, `wellness_date`) VALUES
(1, 'Innovate Inc.', '2023-05-15'),
(2, 'HealthForward', '2023-06-01');

--
-- Table structure for table `payers`
--

CREATE TABLE `payers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `payers`
--

INSERT INTO `payers` (`id`, `name`) VALUES
(1, 'Aetna'),
(2, 'Cigna'),
(3, 'UnitedHealthcare'),
(4, 'Self-Pay');

--
-- Table structure for table `clinical_parameters`
--

CREATE TABLE `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` json DEFAULT NULL,
  `category` enum('vital_sign','lab_result','clinical_measurement','symptom','assessment') DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `clinical_parameters`
--

INSERT INTO `clinical_parameters` (`id`, `name`, `type`, `unit`, `options`, `category`) VALUES
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', NULL, 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', NULL, 'lab_result'),
(5, 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', NULL, 'clinical_measurement'),
(7, 'Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm", "Irritable"]', 'assessment'),
(8, 'Pain Level', 'numeric', '/ 10', NULL, 'symptom');

--
-- Table structure for table `diagnoses`
--

CREATE TABLE `diagnoses` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `code` varchar(50) DEFAULT NULL,
  `description` text,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `diagnoses`
--

INSERT INTO `diagnoses` (`id`, `name`, `code`, `description`) VALUES
(1, 'Type 2 Diabetes', 'E11', 'Chronic condition that affects the way the body processes blood sugar.'),
(2, 'Hypertension', 'I10', 'A condition in which the force of the blood against the artery walls is too high.');

--
-- Table structure for table `medications`
--

CREATE TABLE `medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `medications`
--

INSERT INTO `medications` (`id`, `name`, `dosage`) VALUES
(1, 'Metformin', '500mg'),
(2, 'Lisinopril', '10mg');

--
-- Table structure for table `patients`
--

CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
  `user_id` int DEFAULT NULL,
  `first_name` varchar(100) NOT NULL,
  `middle_name` varchar(100) DEFAULT NULL,
  `surname` varchar(100) DEFAULT NULL,
  `dob` date DEFAULT NULL,
  `age` int DEFAULT NULL,
  `sex` enum('Male','Female','Other') DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `wellness_date` date NOT NULL,
  `corporate_id` int DEFAULT NULL,
  `payer_id` int DEFAULT NULL,
  `status` enum('Active','Pending','Critical','Discharged','In Review') NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `date_of_onboarding` date DEFAULT NULL,
  `has_glucometer` tinyint(1) DEFAULT '0',
  `has_bp_machine` tinyint(1) DEFAULT '0',
  `has_tape_measure` tinyint(1) DEFAULT '0',
  `brief_medical_history` text,
  `years_since_diagnosis` int DEFAULT NULL,
  `emergency_contact_name` varchar(100) DEFAULT NULL,
  `emergency_contact_phone` varchar(20) DEFAULT NULL,
  `emergency_contact_relation` varchar(50) DEFAULT NULL,
  `consent_date` date DEFAULT NULL,
  `navigator_id` int DEFAULT NULL,
  `emr_number` varchar(255) DEFAULT NULL,
  `has_weighing_scale` tinyint(1) DEFAULT '0',
  `past_medical_interventions` text,
  `relevant_family_history` text,
  `dietary_restrictions` text,
  `allergies_intolerances` text,
  `lifestyle_factors` text,
  `physical_limitations` text,
  `psychosocial_factors` text,
  `date_of_diagnosis` date DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `corporate_id` (`corporate_id`),
  KEY `navigator_id` (`navigator_id`),
  KEY `payer_id` (`payer_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Dumping data for table `patients`
--

INSERT INTO `patients` (`id`, `user_id`, `first_name`, `middle_name`, `surname`, `dob`, `age`, `sex`, `phone`, `email`, `wellness_date`, `corporate_id`, `payer_id`, `status`, `created_at`, `date_of_onboarding`, `has_glucometer`, `has_bp_machine`, `has_tape_measure`, `brief_medical_history`, `years_since_diagnosis`, `emergency_contact_name`, `emergency_contact_phone`, `emergency_contact_relation`, `consent_date`, `navigator_id`, `emr_number`, `has_weighing_scale`, `past_medical_interventions`, `relevant_family_history`, `dietary_restrictions`, `allergies_intolerances`, `lifestyle_factors`, `physical_limitations`, `psychosocial_factors`, `date_of_diagnosis`, `diagnosis`) VALUES
(1, NULL, 'John', NULL, 'Doe', '1985-04-12', 39, 'Male', '555-0101', 'john.doe@example.com', '2023-05-15', 1, 1, 'Active', '2023-05-15 10:00:00', '2023-05-16', 1, 1, 0, 'Diagnosed with Type 2 Diabetes in 2020. Generally stable.', 3, 'Jane Doe', '555-0102', 'Spouse', '2023-05-15', 2, 'EMR-001', 1, 'Started on Metformin in 2020.', 'Father has Type 2 Diabetes.', 'Low-carb diet.', 'None known.', 'Desk job, exercises 2 times a week.', 'None.', 'Reports occasional stress from work.', '2020-01-10', 'Type 2 Diabetes'),
(2, NULL, 'Jane', NULL, 'Smith', '1990-08-22', 33, 'Female', '555-0103', 'jane.smith@example.com', '2023-06-01', 2, NULL, 'Pending', '2023-06-01 11:30:00', NULL, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, NULL, 'Peter', NULL, 'Jones', '1978-11-02', 45, 'Male', '555-0104', 'peter.jones@example.com', '2023-05-15', 1, 2, 'Critical', '2023-05-15 10:15:00', '2023-05-17', 1, 1, 1, 'History of hypertension.', 10, 'Mary Jones', '555-0105', 'Sister', '2023-05-15', 2, 'EMR-003', 1, 'Prescribed Lisinopril.', 'Mother had hypertension.', 'Low-sodium diet.', 'Penicillin.', 'Smoker.', 'None.', 'High-stress job.', '2013-03-20', 'Hypertension');

--
-- Table structure for table `assessments`
--

CREATE TABLE `assessments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `value` varchar(255) NOT NULL,
  `notes` text,
  `is_normal` tinyint(1) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `measured_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinical_parameter_id` (`clinical_parameter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `assessments`
--

INSERT INTO `assessments` (`id`, `patient_id`, `clinical_parameter_id`, `value`, `notes`, `is_normal`, `created_at`, `measured_at`) VALUES
(1, 1, 1, '120', NULL, 1, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(2, 1, 2, '80', NULL, 1, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(3, 1, 5, '85', 'Slightly above ideal weight.', 0, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(4, 3, 1, '145', 'Patient reports feeling stressed.', 0, '2023-06-19 09:00:00', '2023-06-19 09:00:00'),
(5, 3, 2, '92', NULL, 0, '2023-06-19 09:00:00', '2023-06-19 09:00:00');

--
-- Table structure for table `goals`
--

CREATE TABLE `goals` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinical_parameter_id` int NOT NULL,
  `target_value` varchar(255) NOT NULL,
  `target_operator` varchar(10) NOT NULL,
  `status` enum('active','completed','cancelled') NOT NULL,
  `notes` text,
  `deadline` date NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinical_parameter_id` (`clinical_parameter_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `goals`
--

INSERT INTO `goals` (`id`, `patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `notes`, `deadline`, `created_at`) VALUES
(1, 1, 5, '80', '<=', 'active', 'Focus on diet and exercise.', '2023-09-20', '2023-06-20 10:00:00'),
(2, 3, 1, '130', '<=', 'active', 'Monitor BP twice daily.', '2023-08-19', '2023-06-19 09:00:00');

--
-- Table structure for table `prescriptions`
--

CREATE TABLE `prescriptions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `medication_id` int NOT NULL,
  `dosage` varchar(255) NOT NULL,
  `frequency` varchar(50) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date DEFAULT NULL,
  `notes` text,
  `status` enum('active','completed','discontinued') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `medication_id` (`medication_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `prescriptions`
--

INSERT INTO `prescriptions` (`id`, `patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `end_date`, `notes`, `status`) VALUES
(1, 1, 1, '500mg', 'twice_daily', '2023-05-16', NULL, 'Take with meals.', 'active'),
(2, 3, 2, '10mg', 'daily', '2023-05-17', NULL, 'Monitor for cough.', 'active');

--
-- Table structure for table `appointments`
--

CREATE TABLE `appointments` (
  `id` int NOT NULL AUTO_INCREMENT,
  `patient_id` int NOT NULL,
  `clinician_id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `appointment_date` datetime NOT NULL,
  `end_date` datetime DEFAULT NULL,
  `description` text,
  `status` enum('scheduled','confirmed','cancelled','completed','no_show','rescheduled') NOT NULL,
  `cancellation_reason` text,
  PRIMARY KEY (`id`),
  KEY `patient_id` (`patient_id`),
  KEY `clinician_id` (`clinician_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `appointments`
--

INSERT INTO `appointments` (`id`, `patient_id`, `clinician_id`, `title`, `appointment_date`, `end_date`, `description`, `status`, `cancellation_reason`) VALUES
(1, 1, 3, 'Follow-up Consultation', '2023-07-15 14:00:00', '2023-07-15 14:30:00', 'Review recent blood sugar levels.', 'scheduled', NULL),
(2, 3, 3, 'BP Check', '2023-07-10 09:00:00', '2023-07-10 09:15:00', NULL, 'confirmed', NULL),
(3, 1, 3, 'Quarterly Review', '2025-08-01 10:00:00', '2025-08-01 10:30:00', 'Review progress on goals.', 'scheduled', NULL);

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
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
    KEY `patient_id` (`patient_id`),
    KEY `reviewed_by_id` (`reviewed_by_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `patient_id`, `reviewed_by_id`, `review_date`, `subjective_findings`, `objective_findings`, `assessment`, `plan`, `recommendations`, `follow_up_date`) VALUES
(1, 1, 3, '2023-06-20', 'Patient reports feeling well.', 'Blood glucose levels are stable.', 'Good control of diabetes.', 'Continue current medication and diet.', 'Encourage regular exercise.', '2023-07-15'),
(2, 3, 3, '2023-06-19', 'Patient reports occasional headaches.', 'BP remains elevated.', 'Uncontrolled hypertension.', 'Adjust medication (Lisinopril to 20mg).', 'Low-sodium diet, stress management techniques.', '2023-07-10');


SET foreign_key_checks = 1;
