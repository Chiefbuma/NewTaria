SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

CREATE TABLE IF NOT EXISTS `clinics` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `diagnoses` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `code` varchar(50) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `partners` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `partner_type` enum('insurance','clinic','hospital','specialist','corporate') NOT NULL DEFAULT 'insurance',
  `clinic_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `deleted_at` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_partners_type` (`partner_type`),
  KEY `idx_partners_clinic_id` (`clinic_id`),
  KEY `idx_partners_deleted_at` (`deleted_at`),
  CONSTRAINT `fk_partner_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

ALTER TABLE `users`
  MODIFY COLUMN `role` enum('admin','staff','physician','clinician','navigator','payer','user','patient','partner') NOT NULL DEFAULT 'user';

CREATE TABLE IF NOT EXISTS `password_reset_tokens` (
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

ALTER TABLE `patients`
  MODIFY COLUMN `gender` enum('Male','Female','Other') DEFAULT NULL;

SET @db_name = DATABASE();

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `users` ADD COLUMN `phone` varchar(50) DEFAULT NULL AFTER `name`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'must_change_password'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `users` ADD COLUMN `must_change_password` tinyint(1) NOT NULL DEFAULT 1 AFTER `partner_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND COLUMN_NAME = 'password_changed_at'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `users` ADD COLUMN `password_changed_at` timestamp NULL DEFAULT NULL AFTER `must_change_password`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND COLUMN_NAME = 'partner_type'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `partners` ADD COLUMN `partner_type` enum(''insurance'',''clinic'',''hospital'',''specialist'',''corporate'') NOT NULL DEFAULT ''insurance'' AFTER `name`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND COLUMN_NAME = 'clinic_id'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `partners` ADD COLUMN `clinic_id` int(11) DEFAULT NULL AFTER `partner_type`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

ALTER TABLE `partners`
  MODIFY COLUMN `partner_type` enum('insurance','clinic','hospital','specialist','corporate') NOT NULL DEFAULT 'insurance';

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'clinics' AND INDEX_NAME = 'idx_clinics_deleted_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `clinics` ADD INDEX `idx_clinics_deleted_at` (`deleted_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'diagnoses' AND INDEX_NAME = 'uk_diagnoses_code'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `diagnoses` ADD UNIQUE INDEX `uk_diagnoses_code` (`code`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'diagnoses' AND INDEX_NAME = 'idx_diagnoses_deleted_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `diagnoses` ADD INDEX `idx_diagnoses_deleted_at` (`deleted_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND INDEX_NAME = 'idx_partners_type'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `partners` ADD INDEX `idx_partners_type` (`partner_type`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND INDEX_NAME = 'idx_partners_clinic_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `partners` ADD INDEX `idx_partners_clinic_id` (`clinic_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND INDEX_NAME = 'idx_partners_deleted_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `partners` ADD INDEX `idx_partners_deleted_at` (`deleted_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'partners' AND CONSTRAINT_NAME = 'fk_partner_clinic'
);
SET @sql = IF(@constraint_exists = 0, 'ALTER TABLE `partners` ADD CONSTRAINT `fk_partner_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'patient_identifier'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `patient_identifier` varchar(100) DEFAULT NULL AFTER `user_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'portal_username'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `portal_username` varchar(255) DEFAULT NULL AFTER `patient_identifier`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'address'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `address` text DEFAULT NULL AFTER `phone`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'clinic_id'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `clinic_id` int(11) DEFAULT NULL AFTER `partner_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'primary_diagnosis_id'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `primary_diagnosis_id` int(11) DEFAULT NULL AFTER `clinic_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'comorbid_conditions'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `comorbid_conditions` text DEFAULT NULL AFTER `primary_diagnosis_id`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'current_medications_summary'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `current_medications_summary` text DEFAULT NULL AFTER `comorbid_conditions`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'policy_number'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `policy_number` varchar(255) DEFAULT NULL AFTER `current_medications_summary`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'coverage_limits'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `coverage_limits` text DEFAULT NULL AFTER `policy_number`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'pre_authorization_status'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `pre_authorization_status` enum(''Not Required'',''Pending'',''Approved'',''Denied'') DEFAULT ''Not Required'' AFTER `coverage_limits`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'social_history'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `social_history` text DEFAULT NULL AFTER `lifestyle_factors`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'past_medical_history'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `past_medical_history` text DEFAULT NULL AFTER `psychosocial_factors`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'surgical_history'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `surgical_history` text DEFAULT NULL AFTER `past_medical_history`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'family_history'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `family_history` text DEFAULT NULL AFTER `surgical_history`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @column_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND COLUMN_NAME = 'emergency_contact_email'
);
SET @sql = IF(@column_exists = 0, 'ALTER TABLE `patients` ADD COLUMN `emergency_contact_email` varchar(255) DEFAULT NULL AFTER `emergency_contact_relation`', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND INDEX_NAME = 'uk_users_phone'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `users` ADD UNIQUE INDEX `uk_users_phone` (`phone`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_role'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `users` ADD INDEX `idx_users_role` (`role`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_partner_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `users` ADD INDEX `idx_users_partner_id` (`partner_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'users' AND INDEX_NAME = 'idx_users_deleted_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `users` ADD INDEX `idx_users_deleted_at` (`deleted_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'password_reset_tokens' AND INDEX_NAME = 'idx_password_reset_tokens_user_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `password_reset_tokens` ADD INDEX `idx_password_reset_tokens_user_id` (`user_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'password_reset_tokens' AND INDEX_NAME = 'idx_password_reset_tokens_expires_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `password_reset_tokens` ADD INDEX `idx_password_reset_tokens_expires_at` (`expires_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'password_reset_tokens' AND INDEX_NAME = 'idx_password_reset_tokens_used_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `password_reset_tokens` ADD INDEX `idx_password_reset_tokens_used_at` (`used_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'uk_patients_identifier'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD UNIQUE INDEX `uk_patients_identifier` (`patient_identifier`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_partner_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD INDEX `idx_patients_partner_id` (`partner_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_clinic_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD INDEX `idx_patients_clinic_id` (`clinic_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_primary_diagnosis_id'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD INDEX `idx_patients_primary_diagnosis_id` (`primary_diagnosis_id`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_status'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD INDEX `idx_patients_status` (`status`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND INDEX_NAME = 'idx_patients_deleted_at'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `patients` ADD INDEX `idx_patients_deleted_at` (`deleted_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND CONSTRAINT_NAME = 'fk_patient_clinic'
);
SET @sql = IF(@constraint_exists = 0, 'ALTER TABLE `patients` ADD CONSTRAINT `fk_patient_clinic` FOREIGN KEY (`clinic_id`) REFERENCES `clinics` (`id`) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @constraint_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'patients' AND CONSTRAINT_NAME = 'fk_patient_diagnosis'
);
SET @sql = IF(@constraint_exists = 0, 'ALTER TABLE `patients` ADD CONSTRAINT `fk_patient_diagnosis` FOREIGN KEY (`primary_diagnosis_id`) REFERENCES `diagnoses` (`id`) ON DELETE SET NULL', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'assessments' AND INDEX_NAME = 'idx_assessments_patient_param_date'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `assessments` ADD INDEX `idx_assessments_patient_param_date` (`patient_id`, `clinical_parameter_id`, `measured_at`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'goals' AND INDEX_NAME = 'idx_goals_patient_param_status'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `goals` ADD INDEX `idx_goals_patient_param_status` (`patient_id`, `clinical_parameter_id`, `status`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @index_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = @db_name AND TABLE_NAME = 'appointments' AND INDEX_NAME = 'idx_appointments_patient_status_date'
);
SET @sql = IF(@index_exists = 0, 'ALTER TABLE `appointments` ADD INDEX `idx_appointments_patient_status_date` (`patient_id`, `status`, `appointment_date`)', 'SELECT 1');
PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

INSERT INTO `clinics` (`name`, `location`)
SELECT 'Nairobi Care Centre', 'Nairobi' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinics` WHERE `name` = 'Nairobi Care Centre' AND `deleted_at` IS NULL);

INSERT INTO `clinics` (`name`, `location`)
SELECT 'Mombasa Wellness Hub', 'Mombasa' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinics` WHERE `name` = 'Mombasa Wellness Hub' AND `deleted_at` IS NULL);

INSERT INTO `clinics` (`name`, `location`)
SELECT 'Kisumu Outreach Clinic', 'Kisumu' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinics` WHERE `name` = 'Kisumu Outreach Clinic' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Aetna Insurance', 'insurance', NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Aetna Insurance' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Blue Cross', 'insurance', NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Blue Cross' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Self-Pay', 'insurance', NULL FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Self-Pay' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Nairobi Care Centre', 'clinic', `id` FROM `clinics`
WHERE `name` = 'Nairobi Care Centre'
  AND NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Nairobi Care Centre' AND `partner_type` = 'clinic' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Mombasa Wellness Hub', 'clinic', `id` FROM `clinics`
WHERE `name` = 'Mombasa Wellness Hub'
  AND NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Mombasa Wellness Hub' AND `partner_type` = 'clinic' AND `deleted_at` IS NULL);

INSERT INTO `partners` (`name`, `partner_type`, `clinic_id`)
SELECT 'Kisumu Outreach Clinic', 'clinic', `id` FROM `clinics`
WHERE `name` = 'Kisumu Outreach Clinic'
  AND NOT EXISTS (SELECT 1 FROM `partners` WHERE `name` = 'Kisumu Outreach Clinic' AND `partner_type` = 'clinic' AND `deleted_at` IS NULL);

UPDATE `partners` SET `partner_type` = 'insurance', `clinic_id` = NULL
WHERE `name` IN ('Aetna Insurance', 'Blue Cross', 'Self-Pay') AND `deleted_at` IS NULL;

UPDATE `partners` p
JOIN `clinics` c ON p.`name` = c.`name`
SET p.`partner_type` = 'clinic',
    p.`clinic_id` = c.`id`
WHERE p.`name` IN ('Nairobi Care Centre', 'Mombasa Wellness Hub', 'Kisumu Outreach Clinic')
  AND p.`deleted_at` IS NULL;

INSERT INTO `diagnoses` (`code`, `name`, `description`)
SELECT 'E11.9', 'Type 2 diabetes mellitus without complications', 'General adult diabetes follow-up.' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `diagnoses` WHERE `code` = 'E11.9' AND `deleted_at` IS NULL);

INSERT INTO `diagnoses` (`code`, `name`, `description`)
SELECT 'I10', 'Essential (primary) hypertension', 'Primary blood pressure management.' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `diagnoses` WHERE `code` = 'I10' AND `deleted_at` IS NULL);

INSERT INTO `diagnoses` (`code`, `name`, `description`)
SELECT 'J45.909', 'Unspecified asthma, uncomplicated', 'Stable outpatient asthma monitoring.' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `diagnoses` WHERE `code` = 'J45.909' AND `deleted_at` IS NULL);

INSERT IGNORE INTO `users` (`name`, `phone`, `email`, `password`, `role`, `partner_id`, `must_change_password`, `password_changed_at`) VALUES
('System Admin', '0700000001', 'admin@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'admin', NULL, 1, NULL),
('Navigator One', '0700000002', 'nav@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'navigator', NULL, 1, NULL),
('Clinician One', '0700000003', 'clinician@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'clinician', NULL, 1, NULL),
('Payer Liaison', '0700000004', 'payer@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'payer', NULL, 1, NULL),
('Clinic Liaison', '0700000005', 'clinic@taria.com', '$2a$10$K7L1OJq5Z6y.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.Y8uX.', 'partner', NULL, 1, NULL);

UPDATE `users`
SET `phone` = CASE
  WHEN `email` = 'admin@taria.com' THEN '0700000001'
  WHEN `email` = 'nav@taria.com' THEN '0700000002'
  WHEN `email` = 'clinician@taria.com' THEN '0700000003'
  WHEN `email` = 'payer@taria.com' THEN '0700000004'
  WHEN `email` = 'clinic@taria.com' THEN '0700000005'
  ELSE `phone`
END
WHERE `deleted_at` IS NULL
  AND (`phone` IS NULL OR `phone` = '');

UPDATE `users`
SET `must_change_password` = 1
WHERE `deleted_at` IS NULL
  AND (`must_change_password` IS NULL OR `must_change_password` = 0)
  AND `password_changed_at` IS NULL;

UPDATE `users`
SET `partner_id` = (SELECT `id` FROM `partners` WHERE `name` = 'Nairobi Care Centre' AND `partner_type` = 'clinic' AND `deleted_at` IS NULL LIMIT 1)
WHERE `email` IN ('nav@taria.com', 'clinician@taria.com')
  AND (`partner_id` IS NULL OR `partner_id` = 0);

UPDATE `users`
SET `partner_id` = (SELECT `id` FROM `partners` WHERE `name` = 'Aetna Insurance' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL LIMIT 1)
WHERE `email` = 'payer@taria.com'
  AND (`partner_id` IS NULL OR `partner_id` = 0);

UPDATE `users`
SET `partner_id` = (SELECT `id` FROM `partners` WHERE `name` = 'Mombasa Wellness Hub' AND `partner_type` = 'clinic' AND `deleted_at` IS NULL LIMIT 1)
WHERE `email` = 'clinic@taria.com'
  AND (`partner_id` IS NULL OR `partner_id` = 0);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'Systolic BP', 'numeric', 'mmHg', NULL, 'vital_sign' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'Systolic BP' AND `deleted_at` IS NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'Diastolic BP', 'numeric', 'mmHg', NULL, 'vital_sign' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'Diastolic BP' AND `deleted_at` IS NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'Weight', 'numeric', 'kg', NULL, 'clinical_measurement' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'Weight' AND `deleted_at` IS NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'KCB Status', 'choice', NULL, '["Good", "Average", "Bad"]', 'assessment' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'KCB Status' AND `deleted_at` IS NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'Mood', 'choice', NULL, '["Happy", "Anxious", "Sad", "Calm"]', 'assessment' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'Mood' AND `deleted_at` IS NULL);

INSERT INTO `clinical_parameters` (`name`, `type`, `unit`, `options`, `category`)
SELECT 'Clinic Notes', 'text', NULL, NULL, 'assessment' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `clinical_parameters` WHERE `name` = 'Clinic Notes' AND `deleted_at` IS NULL);

INSERT INTO `medications` (`name`, `dosage`)
SELECT 'Metformin', '500mg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `medications` WHERE `name` = 'Metformin' AND `deleted_at` IS NULL);

INSERT INTO `medications` (`name`, `dosage`)
SELECT 'Lisinopril', '10mg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `medications` WHERE `name` = 'Lisinopril' AND `deleted_at` IS NULL);

INSERT INTO `medications` (`name`, `dosage`)
SELECT 'Amlodipine', '5mg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `medications` WHERE `name` = 'Amlodipine' AND `deleted_at` IS NULL);

INSERT INTO `medications` (`name`, `dosage`)
SELECT 'Atorvastatin', '20mg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `medications` WHERE `name` = 'Atorvastatin' AND `deleted_at` IS NULL);

INSERT INTO `medications` (`name`, `dosage`)
SELECT 'Salbutamol Inhaler', '100mcg' FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM `medications` WHERE `name` = 'Salbutamol Inhaler' AND `deleted_at` IS NULL);

SET @patients_empty = (SELECT COUNT(*) = 0 FROM `patients`);

INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`)
SELECT 'James', 'Smith', '1985-05-15', 'Male', 'james@example.com', '0711000001', 'Active', 'Hypertension', CURDATE() FROM DUAL WHERE @patients_empty;
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`)
SELECT 'Robert', 'Johnson', '1972-11-20', 'Male', 'robert@example.com', '0711000002', 'Active', 'Diabetes', CURDATE() FROM DUAL WHERE @patients_empty;
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`)
SELECT 'Michael', 'Brown', '1960-03-10', 'Male', 'michael@example.com', '0711000003', 'Active', 'Hypertension and Diabetes', CURDATE() FROM DUAL WHERE @patients_empty;
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`)
SELECT 'Maria', 'Garcia', '1990-08-22', 'Female', 'maria@example.com', '0711000004', 'Active', 'Hypertension', CURDATE() FROM DUAL WHERE @patients_empty;
INSERT INTO `patients` (`first_name`, `surname`, `dob`, `gender`, `email`, `phone`, `status`, `primary_diagnosis`, `date_of_onboarding`)
SELECT 'Sarah', 'Wilson', '1982-12-05', 'Female', 'sarah@example.com', '0711000005', 'Active', 'Diabetes', CURDATE() FROM DUAL WHERE @patients_empty;

UPDATE `patients`
SET
  `patient_identifier` = COALESCE(NULLIF(`patient_identifier`, ''), CONCAT('PT-', YEAR(COALESCE(`date_of_onboarding`, CURDATE())), '-', LPAD(`id`, 5, '0'))),
  `portal_username` = COALESCE(NULLIF(`portal_username`, ''), CONCAT(LOWER(`first_name`), '.', LPAD(`id`, 4, '0'))),
  `clinic_id` = COALESCE(`clinic_id`, CASE
    WHEN `id` IN (1, 4) THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Nairobi Care Centre' AND `deleted_at` IS NULL LIMIT 1)
    WHEN `id` IN (2, 5) THEN (SELECT `id` FROM `clinics` WHERE `name` = 'Mombasa Wellness Hub' AND `deleted_at` IS NULL LIMIT 1)
    ELSE (SELECT `id` FROM `clinics` WHERE `name` = 'Kisumu Outreach Clinic' AND `deleted_at` IS NULL LIMIT 1)
  END),
  `partner_id` = COALESCE(`partner_id`, CASE
    WHEN `id` IN (1, 4) THEN (SELECT `id` FROM `partners` WHERE `name` = 'Aetna Insurance' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL LIMIT 1)
    WHEN `id` IN (2, 5) THEN (SELECT `id` FROM `partners` WHERE `name` = 'Blue Cross' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL LIMIT 1)
    ELSE (SELECT `id` FROM `partners` WHERE `name` = 'Self-Pay' AND `partner_type` = 'insurance' AND `deleted_at` IS NULL LIMIT 1)
  END),
  `primary_diagnosis_id` = COALESCE(`primary_diagnosis_id`, CASE
    WHEN `primary_diagnosis` = 'Diabetes' THEN (SELECT `id` FROM `diagnoses` WHERE `code` = 'E11.9' AND `deleted_at` IS NULL LIMIT 1)
    WHEN `primary_diagnosis` = 'Hypertension' THEN (SELECT `id` FROM `diagnoses` WHERE `code` = 'I10' AND `deleted_at` IS NULL LIMIT 1)
    ELSE (SELECT `id` FROM `diagnoses` WHERE `code` = 'E11.9' AND `deleted_at` IS NULL LIMIT 1)
  END),
  `policy_number` = COALESCE(NULLIF(`policy_number`, ''), CONCAT('POL-', LPAD(`id`, 5, '0'))),
  `coverage_limits` = COALESCE(NULLIF(`coverage_limits`, ''), 'Standard annual outpatient cover'),
  `pre_authorization_status` = COALESCE(`pre_authorization_status`, 'Not Required'),
  `emergency_contact_name` = COALESCE(NULLIF(`emergency_contact_name`, ''), CONCAT('Contact ', `id`)),
  `emergency_contact_phone` = COALESCE(NULLIF(`emergency_contact_phone`, ''), CONCAT('07220000', LPAD(`id`, 2, '0'))),
  `emergency_contact_relation` = COALESCE(NULLIF(`emergency_contact_relation`, ''), 'Sibling'),
  `emergency_contact_email` = COALESCE(NULLIF(`emergency_contact_email`, ''), CONCAT('contact', `id`, '@example.com')),
  `allergies_intolerances` = COALESCE(`allergies_intolerances`, 'None documented'),
  `past_medical_history` = COALESCE(`past_medical_history`, 'Routine follow-up care'),
  `surgical_history` = COALESCE(`surgical_history`, 'No major surgical history reported'),
  `family_history` = COALESCE(`family_history`, 'Family history captured at intake'),
  `social_history` = COALESCE(`social_history`, 'Lives with family and has phone access'),
  `comorbid_conditions` = COALESCE(`comorbid_conditions`, CASE WHEN `id` = 3 THEN 'Obesity' WHEN `id` = 5 THEN 'Asthma' ELSE '' END)
WHERE `deleted_at` IS NULL;

SET @assessments_empty = (SELECT COUNT(*) = 0 FROM `assessments`);
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 1, 1, '130', NOW() FROM DUAL WHERE @assessments_empty;
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 1, 2, '85', NOW() FROM DUAL WHERE @assessments_empty;
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 1, 3, '88', NOW() FROM DUAL WHERE @assessments_empty;
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 2, 1, '145', NOW() FROM DUAL WHERE @assessments_empty;
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 2, 2, '95', NOW() FROM DUAL WHERE @assessments_empty;
INSERT INTO `assessments` (`patient_id`, `clinical_parameter_id`, `value`, `measured_at`)
SELECT 3, 1, '120', NOW() FROM DUAL WHERE @assessments_empty;

SET @goals_empty = (SELECT COUNT(*) = 0 FROM `goals`);
INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `notes`, `deadline`)
SELECT 1, 1, '130', '<=', 'active', 'Maintain healthy blood pressure control.', DATE_ADD(CURDATE(), INTERVAL 30 DAY) FROM DUAL WHERE @goals_empty;
INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `notes`, `deadline`)
SELECT 2, 3, '95', '<=', 'active', 'Support gradual weight reduction.', DATE_ADD(CURDATE(), INTERVAL 45 DAY) FROM DUAL WHERE @goals_empty;
INSERT INTO `goals` (`patient_id`, `clinical_parameter_id`, `target_value`, `target_operator`, `status`, `notes`, `deadline`)
SELECT 3, 2, '85', '<=', 'active', 'Reduce diastolic blood pressure.', DATE_ADD(CURDATE(), INTERVAL 21 DAY) FROM DUAL WHERE @goals_empty;

SET @prescriptions_empty = (SELECT COUNT(*) = 0 FROM `prescriptions`);
INSERT INTO `prescriptions` (`patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `expiry_date`, `notes`, `status`)
SELECT 1, 2, '10mg', 'daily', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Monitor blood pressure weekly.', 'active' FROM DUAL WHERE @prescriptions_empty;
INSERT INTO `prescriptions` (`patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `expiry_date`, `notes`, `status`)
SELECT 2, 1, '500mg', 'twice daily', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Take with meals.', 'active' FROM DUAL WHERE @prescriptions_empty;
INSERT INTO `prescriptions` (`patient_id`, `medication_id`, `dosage`, `frequency`, `start_date`, `expiry_date`, `notes`, `status`)
SELECT 5, 5, '2 puffs', 'as needed', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 30 DAY), 'Use for wheezing episodes.', 'active' FROM DUAL WHERE @prescriptions_empty;

SET @reviews_empty = (SELECT COUNT(*) = 0 FROM `reviews`);
INSERT INTO `reviews` (`patient_id`, `reviewed_by_id`, `review_date`, `subjective_findings`, `objective_findings`, `assessment`, `plan`, `recommendations`, `follow_up_date`)
SELECT 1, 3, CURDATE(), 'Patient reports stable blood pressure readings at home.', 'Clinic readings remain within target range.', 'Hypertension well controlled.', 'Continue current therapy.', 'Maintain low-sodium diet and walking program.', DATE_ADD(CURDATE(), INTERVAL 30 DAY) FROM DUAL WHERE @reviews_empty;
INSERT INTO `reviews` (`patient_id`, `reviewed_by_id`, `review_date`, `subjective_findings`, `objective_findings`, `assessment`, `plan`, `recommendations`, `follow_up_date`)
SELECT 2, 3, CURDATE(), 'Patient notes improved energy with medication adherence.', 'Weight remains above target but stable.', 'Diabetes follow-up ongoing.', 'Continue metformin and nutrition support.', 'Reduce sugary drinks and review fasting readings.', DATE_ADD(CURDATE(), INTERVAL 21 DAY) FROM DUAL WHERE @reviews_empty;

SET @appointments_empty = (SELECT COUNT(*) = 0 FROM `appointments`);
INSERT INTO `appointments` (`patient_id`, `clinician_id`, `title`, `appointment_date`, `end_date`, `description`, `status`)
SELECT 1, 3, 'Hypertension Review', DATE_ADD(NOW(), INTERVAL 7 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 7 DAY), INTERVAL 30 MINUTE), 'Routine blood pressure follow-up.', 'scheduled' FROM DUAL WHERE @appointments_empty;
INSERT INTO `appointments` (`patient_id`, `clinician_id`, `title`, `appointment_date`, `end_date`, `description`, `status`)
SELECT 2, 3, 'Diabetes Nutrition Check', DATE_ADD(NOW(), INTERVAL 10 DAY), DATE_ADD(DATE_ADD(NOW(), INTERVAL 10 DAY), INTERVAL 30 MINUTE), 'Review glucose trends and diet plan.', 'confirmed' FROM DUAL WHERE @appointments_empty;

SET @messages_empty = (SELECT COUNT(*) = 0 FROM `messages`);
INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`)
SELECT 1, 2, 'Please review today''s onboarding queue before noon.' FROM DUAL WHERE @messages_empty;
INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`)
SELECT 2, 1, 'Received. I will finish the pending registry updates shortly.' FROM DUAL WHERE @messages_empty;
INSERT INTO `messages` (`sender_id`, `receiver_id`, `content`)
SELECT 3, 2, 'I have added new follow-up appointments for the active care list.' FROM DUAL WHERE @messages_empty;

SHOW TABLES;
SELECT COUNT(*) AS partners FROM `partners`;
SELECT COUNT(*) AS clinics FROM `clinics`;
SELECT COUNT(*) AS diagnoses FROM `diagnoses`;
SELECT COUNT(*) AS clinical_parameters FROM `clinical_parameters`;
SELECT COUNT(*) AS medications FROM `medications`;
SELECT COUNT(*) AS users FROM `users`;
SELECT COUNT(*) AS patients FROM `patients`;
SELECT COUNT(*) AS assessments FROM `assessments`;
SELECT COUNT(*) AS goals FROM `goals`;
SELECT COUNT(*) AS prescriptions FROM `prescriptions`;
SELECT COUNT(*) AS reviews FROM `reviews`;
SELECT COUNT(*) AS appointments FROM `appointments`;
SELECT COUNT(*) AS messages FROM `messages`;
