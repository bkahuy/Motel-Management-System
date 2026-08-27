-- ==========================================================
-- Motel Management System - Database Initialization Script
-- MySQL 8.x Compatible
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `motel_management`
    DEFAULT CHARACTER SET utf8mb4
    DEFAULT COLLATE utf8mb4_unicode_ci;

USE `motel_management`;

-- 1. Table: roles
CREATE TABLE IF NOT EXISTS `roles` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(50) NOT NULL UNIQUE,
    `description` VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 2. Table: users
CREATE TABLE IF NOT EXISTS `users` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(255) NOT NULL,
    `full_name` VARCHAR(100) NOT NULL,
    `phone` VARCHAR(20) NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `role_id` BIGINT NOT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_users_role` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. Table: buildings
CREATE TABLE IF NOT EXISTS `buildings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `address` VARCHAR(255) NOT NULL,
    `description` TEXT NULL,
    `total_floors` INT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Table: services
CREATE TABLE IF NOT EXISTS `services` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL UNIQUE,
    `price` DECIMAL(12, 2) NOT NULL,
    `unit` VARCHAR(50) NOT NULL,
    `description` TEXT NULL,
    `active` BOOLEAN NOT NULL DEFAULT TRUE,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 5. Table: rooms
CREATE TABLE IF NOT EXISTS `rooms` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `building_id` BIGINT NOT NULL,
    `room_number` VARCHAR(50) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `area` DECIMAL(6, 2) NOT NULL,
    `max_occupants` INT NOT NULL DEFAULT 2,
    `deposit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `status` VARCHAR(30) NOT NULL DEFAULT 'AVAILABLE',
    `description` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_rooms_building` FOREIGN KEY (`building_id`) REFERENCES `buildings` (`id`),
    CONSTRAINT `uk_building_room_number` UNIQUE (`building_id`, `room_number`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 6. Table: room_services (Many-to-Many)
CREATE TABLE IF NOT EXISTS `room_services` (
    `room_id` BIGINT NOT NULL,
    `service_id` BIGINT NOT NULL,
    PRIMARY KEY (`room_id`, `service_id`),
    CONSTRAINT `fk_rs_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_rs_service` FOREIGN KEY (`service_id`) REFERENCES `services` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 7. Table: tenants
CREATE TABLE IF NOT EXISTS `tenants` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `full_name` VARCHAR(100) NOT NULL,
    `identity_number` VARCHAR(20) NOT NULL UNIQUE,
    `date_of_birth` DATE NULL,
    `gender` VARCHAR(10) NULL,
    `phone` VARCHAR(20) NOT NULL,
    `email` VARCHAR(100) NULL,
    `address` VARCHAR(255) NULL,
    `occupation` VARCHAR(100) NULL,
    `user_id` BIGINT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_tenants_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
    INDEX `idx_tenant_identity` (`identity_number`),
    INDEX `idx_tenant_phone` (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 8. Table: contracts
CREATE TABLE IF NOT EXISTS `contracts` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `contract_code` VARCHAR(50) NOT NULL UNIQUE,
    `room_id` BIGINT NOT NULL,
    `tenant_id` BIGINT NOT NULL,
    `start_date` DATE NOT NULL,
    `end_date` DATE NOT NULL,
    `rent_price` DECIMAL(12, 2) NOT NULL,
    `deposit` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `payment_cycle` VARCHAR(30) NOT NULL DEFAULT 'MONTHLY',
    `status` VARCHAR(30) NOT NULL DEFAULT 'ACTIVE',
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_contracts_room` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`),
    CONSTRAINT `fk_contracts_tenant` FOREIGN KEY (`tenant_id`) REFERENCES `tenants` (`id`),
    INDEX `idx_contract_code` (`contract_code`),
    INDEX `idx_contract_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 9. Table: meter_readings
CREATE TABLE IF NOT EXISTS `meter_readings` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `contract_id` BIGINT NOT NULL,
    `reading_month` VARCHAR(7) NOT NULL,
    `electricity_previous` INT NOT NULL,
    `electricity_current` INT NOT NULL,
    `water_previous` INT NOT NULL,
    `water_current` INT NOT NULL,
    `reading_date` DATE NOT NULL,
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_mr_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
    CONSTRAINT `uk_contract_reading_month` UNIQUE (`contract_id`, `reading_month`),
    INDEX `idx_meter_reading_month` (`reading_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 10. Table: invoices
CREATE TABLE IF NOT EXISTS `invoices` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `invoice_code` VARCHAR(50) NOT NULL UNIQUE,
    `contract_id` BIGINT NOT NULL,
    `billing_month` VARCHAR(7) NOT NULL,
    `room_fee` DECIMAL(12, 2) NOT NULL,
    `electricity_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `water_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `service_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `other_fee` DECIMAL(12, 2) NOT NULL DEFAULT 0.00,
    `total_amount` DECIMAL(12, 2) NOT NULL,
    `due_date` DATE NOT NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'UNPAID',
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_invoices_contract` FOREIGN KEY (`contract_id`) REFERENCES `contracts` (`id`),
    CONSTRAINT `uk_contract_billing_month` UNIQUE (`contract_id`, `billing_month`),
    INDEX `idx_invoice_code` (`invoice_code`),
    INDEX `idx_invoice_status` (`status`),
    INDEX `idx_invoice_billing_month` (`billing_month`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 11. Table: invoice_items
CREATE TABLE IF NOT EXISTS `invoice_items` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` BIGINT NOT NULL,
    `item_type` VARCHAR(30) NOT NULL,
    `description` VARCHAR(255) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL DEFAULT 1.00,
    `unit_price` DECIMAL(12, 2) NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    CONSTRAINT `fk_items_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 12. Table: payments
CREATE TABLE IF NOT EXISTS `payments` (
    `id` BIGINT AUTO_INCREMENT PRIMARY KEY,
    `invoice_id` BIGINT NOT NULL,
    `amount` DECIMAL(12, 2) NOT NULL,
    `payment_method` VARCHAR(30) NOT NULL,
    `payment_date` DATETIME NOT NULL,
    `transaction_code` VARCHAR(100) NULL,
    `status` VARCHAR(30) NOT NULL DEFAULT 'COMPLETED',
    `notes` TEXT NULL,
    `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    `updated_at` DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_payments_invoice` FOREIGN KEY (`invoice_id`) REFERENCES `invoices` (`id`),
    INDEX `idx_payment_date` (`payment_date`),
    INDEX `idx_payment_transaction_code` (`transaction_code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
