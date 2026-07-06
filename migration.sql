-- ============================================================
-- EVENTORA DATABASE MIGRATION
-- Features: OTP Signup, QR Attendance, Poster/Image Upload
-- Run these scripts against the `eventora` MySQL database.
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- FEATURE 1: Email OTP Verifications Table
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS email_verifications (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    email         VARCHAR(255)  NOT NULL UNIQUE,
    otp           VARCHAR(6)    NOT NULL,
    role          VARCHAR(50)   NOT NULL,
    name          VARCHAR(255)  NOT NULL,
    password_hash VARCHAR(255)  NOT NULL,
    expiry_time   DATETIME      NOT NULL,
    verified      TINYINT(1)    NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email_verifications_email (email),
    INDEX idx_email_verifications_expiry (expiry_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────────────────────
-- FEATURE 4 & 5: Poster and image URL fields are stored in
-- MongoDB (events and feedback collections).
-- No MySQL migration needed for those fields.
-- ─────────────────────────────────────────────────────────────

-- ─────────────────────────────────────────────────────────────
-- CLEANUP PROCEDURE: Remove expired OTP records
-- (Called by @Scheduled in OtpCleanupService or run manually)
-- ─────────────────────────────────────────────────────────────
DELIMITER $$
CREATE PROCEDURE IF NOT EXISTS cleanup_expired_otps()
BEGIN
    DELETE FROM email_verifications
    WHERE expiry_time < NOW() AND verified = 0;
END $$
DELIMITER ;

-- Optional: Create an event to auto-clean every hour
-- (Only if your MySQL has the Event Scheduler enabled)
-- SET GLOBAL event_scheduler = ON;
-- CREATE EVENT IF NOT EXISTS evt_cleanup_expired_otps
--   ON SCHEDULE EVERY 1 HOUR
--   DO CALL cleanup_expired_otps();

-- ─────────────────────────────────────────────────────────────
-- VERIFY
-- ─────────────────────────────────────────────────────────────
SHOW TABLES LIKE 'email_verifications';
DESCRIBE email_verifications;
