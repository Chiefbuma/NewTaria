# Taria Health - Patient Monitoring Dashboard

A modern, patient-centric health monitoring dashboard designed to track personalized health metrics over time. It provides a clean, intuitive interface for healthcare providers to monitor patient progress against their health goals.

The application is built with a modern tech stack and follows best practices for creating a fast, user-friendly, and maintainable application.

## Features

-   **Patient-Centric Dashboard**: A central dashboard displaying a list of all patients, with key information at a glance.
-   **Two-Step Patient Intake**: A streamlined workflow that separates initial registration from detailed clinical onboarding.
-   **Comprehensive Onboarding**: A dedicated form to capture detailed patient history, lifestyle factors, and medical information.
-   **Detailed Patient View**: A comprehensive view for each patient, including:
    -   Personalized health metrics tracked over time with support for numeric, text, and choice-based goals.
    -   Interactive charts to visualize metric history.
    -   A section for patient-specific health goals.
-   **Dynamic Parameter Management**: A full-featured settings page to create, edit, and delete the clinical parameters used for tracking.
-   **Modern UI/UX**: A clean, responsive interface with smooth animations, built with ShadCN UI, Tailwind CSS, and Framer Motion.
-   **API Driven**: The application features a dedicated API layer for data management, preparing it for database integration.

## Tech Stack

-   **Framework**: **Next.js** (v14+ with App Router)
-   **Language**: **TypeScript**
-   **UI Library**: **ShadCN UI** & **Tailwind CSS**
-   **Animations**: **Framer Motion**
-   **Charting**: **Recharts**
-   **Database**: **MySQL**
-   **Containerization**: **Docker** and **Docker Compose**

## Database Schema

The following tables are used in the application.

### `users`

Stores user accounts for staff, navigators, and physicians.

```sql
CREATE TABLE `users` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('admin','staff','physician','navigator','payer') NOT NULL,
  `avatarUrl` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
);
```

### `corporates`

Stores corporate partner information.

```sql
CREATE TABLE `corporates` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `wellness_date` date NOT NULL,
  PRIMARY KEY (`id`)
);
```

### `patients`

The central table for patient information, including demographic and onboarding data.

```sql
CREATE TABLE `patients` (
  `id` int NOT NULL AUTO_INCREMENT,
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
  PRIMARY KEY (`id`),
  FOREIGN KEY (`corporate_id`) REFERENCES `corporates`(`id`),
  FOREIGN KEY (`navigator_id`) REFERENCES `users`(`id`)
);
```

### `clinical_parameters`

Stores the definitions for all trackable health metrics.

```sql
CREATE TABLE `clinical_parameters` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` enum('numeric','text','choice') NOT NULL,
  `unit` varchar(50) DEFAULT NULL,
  `options` json DEFAULT NULL,
  PRIMARY KEY (`id`)
);
```

### `assessments`

Stores each individual measurement or assessment recorded for a patient.

```sql
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
```

### `goals`

Stores the health goals set for each patient.

```sql
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
```
