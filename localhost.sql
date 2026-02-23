DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `appointments`;
DROP TABLE IF EXISTS `prescriptions`;
DROP TABLE IF EXISTS `medications`;
DROP TABLE IF EXISTS `goals`;
DROP TABLE IF EXISTS `assessments`;
DROP TABLE IF EXISTS `clinical_parameters`;
DROP TABLE IF EXISTS `patients`;
DROP TABLE IF EXISTS `corporates`;
DROP TABLE IF EXISTS `payers`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `diagnoses`;

CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer','patient') NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);

INSERT INTO `users` (id, name, email, password, role, avatarUrl) VALUES
(1, 'Dr. Emily Carter', 'admin@taria.com', 'password', 'admin', 'https://i.pravatar.cc/150?u=emily'),
(2, 'John Davis', 'navigator@taria.com', 'password', 'navigator', 'https://i.pravatar.cc/150?u=john'),
(3, 'Dr. Ben Stone', 'physician@taria.com', 'password', 'physician', 'https://i.pravatar.cc/150?u=ben');

CREATE TABLE `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `corporates` (id, name, wellness_date) VALUES
(1, 'Innovate Inc.', '2023-05-15'),
(2, 'HealthForward', '2023-06-01');

CREATE TABLE `payers` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `payers` (id, name) VALUES
(1, 'Aetna'),
(2, 'Cigna'),
(3, 'UnitedHealthcare'),
(4, 'Self-Pay');

CREATE TABLE `patients` (
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
  `emr_number` varchar(255) DEFAULT NULL,
  `diagnosis` varchar(255) DEFAULT NULL,
  `date_of_diagnosis` date DEFAULT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`),
  FOREIGN KEY (`navigator_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`payer_id`) REFERENCES `payers`(`id`)
);

INSERT INTO `patients` (id, user_id, first_name, surname, dob, age, gender, phone, email, diagnosis, wellness_date, corporate_id, payer_id, status, created_at, emr_number, date_of_onboarding, has_glucometer, has_bp_machine, has_tape_measure, has_weighing_scale, brief_medical_history, years_since_diagnosis, past_medical_interventions, relevant_family_history, dietary_restrictions, allergies_intolerances, lifestyle_factors, physical_limitations, psychosocial_factors, emergency_contact_name, emergency_contact_phone, emergency_contact_relation, consent_date, navigator_id, date_of_diagnosis) VALUES
(1, NULL, 'John', 'Doe', '1985-04-12', 39, 'Male', '555-0101', 'john.doe@example.com', 'Type 2 Diabetes', '2023-05-15', 1, 1, 'Active', '2023-05-15 10:00:00', 'EMR-001', '2023-05-16', 1, 1, 0, 1, 'Diagnosed with Type 2 Diabetes in 2020. Generally stable.', 3, 'Started on Metformin in 2020.', 'Father has Type 2 Diabetes.', 'Low-carb diet.', 'None known.', 'Desk job, exercises 2 times a week.', 'None.', 'Reports occasional stress from work.', 'Jane Doe', '555-0102', 'Spouse', '2023-05-15', 2, '2020-01-10'),
(2, NULL, 'Jane', 'Smith', '1990-08-22', 33, 'Female', '555-0103', 'jane.smith@example.com', NULL, '2023-06-01', 2, NULL, 'Pending', '2023-06-01 11:30:00', NULL, NULL, 0, 0, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(3, NULL, 'Peter', 'Jones', '1978-11-02', 45, 'Male', '555-0104', 'peter.jones@example.com', 'Hypertension', '2023-05-15', 1, 2, 'Critical', '2023-05-15 10:15:00', 'EMR-003', '2023-05-17', 1, 1, 1, 1, 'History of hypertension.', 10, 'Prescribed Lisinopril.', 'Mother had hypertension.', 'Low-sodium diet.', 'Penicillin.', 'Smoker.', 'None.', 'High-stress job.', 'Mary Jones', '555-0105', 'Sister', '2023-05-15', 2, '2013-03-20');

CREATE TABLE `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` json DEFAULT NULL,
  `category` enum('vital_sign','lab_result','clinical_measurement','symptom','assessment') DEFAULT NULL,
  PRIMARY KEY (`id`)
);

INSERT INTO `clinical_parameters` (id, name, type, unit, options, category) VALUES
(1, 'Blood Pressure (Systolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(2, 'Blood Pressure (Diastolic)', 'numeric', 'mmHg', NULL, 'vital_sign'),
(3, 'Heart Rate', 'numeric', 'bpm', NULL, 'vital_sign'),
(4, 'Blood Glucose', 'numeric', 'mg/dL', NULL, 'lab_result'),
(5, 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement'),
(6, 'Height', 'numeric', 'cm', NULL, 'clinical_measurement'),
(7, 'Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm", "Irritable"]', 'assessment'),
(8, 'Pain Level', 'numeric', '/ 10', NULL, 'symptom');

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
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
);

INSERT INTO `assessments` (id, patient_id, clinical_parameter_id, value, notes, is_normal, created_at, measured_at) VALUES
(1, 1, 1, '135', 'Initial reading high.', 0, '2023-05-17 10:00:00', '2023-05-17 10:00:00'),
(2, 1, 2, '88', NULL, 0, '2023-05-17 10:00:00', '2023-05-17 10:00:00'),
(3, 1, 5, '88', 'Starting weight.', 0, '2023-05-17 10:00:00', '2023-05-17 10:00:00'),
(4, 3, 1, '145', 'Patient reports feeling stressed.', 0, '2023-06-19 09:00:00', '2023-06-19 09:00:00'),
(5, 3, 2, '92', NULL, 0, '2023-06-19 09:00:00', '2023-06-19 09:00:00'),
(6, 1, 1, '132', NULL, 0, '2023-05-24 10:00:00', '2023-05-24 10:00:00'),
(7, 1, 1, '128', 'Showing improvement.', 1, '2023-05-31 10:00:00', '2023-05-31 10:00:00'),
(8, 1, 1, '125', NULL, 1, '2023-06-07 10:00:00', '2023-06-07 10:00:00'),
(9, 1, 1, '122', 'Good progress.', 1, '2023-06-14 10:00:00', '2023-06-14 10:00:00'),
(10, 1, 1, '120', 'Goal range achieved.', 1, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(11, 1, 2, '85', NULL, 1, '2023-05-24 10:00:00', '2023-05-24 10:00:00'),
(12, 1, 2, '82', NULL, 1, '2023-05-31 10:00:00', '2023-05-31 10:00:00'),
(13, 1, 2, '80', NULL, 1, '2023-06-20 10:00:00', '2023-06-20 10:00:00'),
(14, 1, 5, '87.5', 'Small decrease.', 0, '2023-05-24 10:00:00', '2023-05-24 10:00:00'),
(15, 1, 5, '87', 'Consistent loss.', 0, '2023-05-31 10:00:00', '2023-05-31 10:00:00'),
(16, 1, 5, '86', NULL, 0, '2023-06-07 10:00:00', '2023-06-07 10:00:00'),
(17, 1, 5, '85.5', NULL, 0, '2023-06-14 10:00:00', '2023-06-14 10:00:00'),
(18, 1, 5, '85', 'Slightly above ideal weight.', 0, '2023-06-20 10:00:00', '2023-06-20 10:00:00');

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
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinical_parameter_id`) REFERENCES `clinical_parameters`(`id`)
);

INSERT INTO `goals` (id, patient_id, clinical_parameter_id, target_value, target_operator, status, notes, deadline, created_at) VALUES
(1, 1, 5, '80', '<=', 'active', 'Focus on diet and exercise.', '2023-09-20', '2023-06-20 10:00:00'),
(2, 3, 1, '130', '<=', 'active', 'Monitor BP twice daily.', '2023-08-19', '2023-06-19 09:00:00');

CREATE TABLE `medications` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `dosage` varchar(255),
  PRIMARY KEY (`id`)
);

INSERT INTO `medications` (id, name, dosage) VALUES
(1, 'Metformin', '500mg'),
(2, 'Lisinopril', '10mg');

CREATE TABLE `prescriptions` (
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
);

INSERT INTO `prescriptions` (id, patient_id, medication_id, dosage, frequency, start_date, expiry_date, notes, status) VALUES
(1, 1, 1, '500mg', 'twice_daily', '2023-05-16', '2024-05-16', 'Take with meals.', 'active'),
(2, 3, 2, '10mg', 'daily', '2023-05-17', NULL, 'Monitor for cough.', 'active');

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
  FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
  FOREIGN KEY (`clinician_id`) REFERENCES `users`(`id`)
);

INSERT INTO `appointments` (id, patient_id, clinician_id, title, appointment_date, end_date, description, status, cancellation_reason) VALUES
(1, 1, 3, 'Follow-up Consultation', '2023-07-15 14:00:00', '2023-07-15 14:30:00', 'Review recent blood sugar levels.', 'scheduled', NULL),
(2, 3, 3, 'BP Check', '2023-07-10 09:00:00', '2023-07-10 09:15:00', NULL, 'confirmed', NULL),
(3, 1, 3, 'Quarterly Review', '2025-08-01 10:00:00', '2025-08-01 10:30:00', 'Review progress on goals.', 'scheduled', NULL);

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
    `follow_up_date` date,
    PRIMARY KEY (`id`),
    FOREIGN KEY (`patient_id`) REFERENCES `patients`(`id`),
    FOREIGN KEY (`reviewed_by_id`) REFERENCES `users`(`id`)
);

INSERT INTO `reviews` (id, patient_id, reviewed_by_id, review_date, subjective_findings, objective_findings, assessment, plan, recommendations, follow_up_date) VALUES
(1, 1, 3, '2023-06-20', 'Patient reports feeling well.', 'Blood glucose levels are stable.', 'Good control of diabetes.', 'Continue current medication and diet.', 'Encourage regular exercise.', '2023-07-15'),
(2, 3, 3, '2023-06-19', 'Patient reports occasional headaches.', 'BP remains elevated.', 'Uncontrolled hypertension.', 'Adjust medication (Lisinopril to 20mg).', 'Low-sodium diet, stress management techniques.', '2023-07-10');
