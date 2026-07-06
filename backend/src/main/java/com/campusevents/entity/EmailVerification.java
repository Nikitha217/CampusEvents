package com.campusevents.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores pending email OTP verifications.
 * Records include complete registration data needed to create user account.
 * Record is deleted once the OTP is consumed (account created).
 */
@Entity
@Table(name = "email_verifications")
public class EmailVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false, length = 6)
    private String otp;

    @Column(nullable = false)
    private String role;  // "student" or "coordinator"

    @Column(nullable = false)
    private String name;

    /** BCrypt-hashed password — ready to store directly in users table */
    @Column(name = "password_hash", nullable = false)
    private String passwordHash;

    @Column(name = "expiry_time", nullable = false)
    private LocalDateTime expiryTime;

    @Column(nullable = false)
    private Boolean verified = false;

    // ────────────────────────────────────────────────────────────────────────────
    // NEW FIELDS — Store additional user details during pending registration
    // ────────────────────────────────────────────────────────────────────────────

    @Column(nullable = false)
    private String department;  // "CSE", "IT", "ECE", etc.

    @Column(nullable = false)
    private String college;     // College/Institution name

    @Column(nullable = false, length = 20)
    private String phone;       // 10-digit phone number

    // ── Constructors ──────────────────────────────────────────────────────────

    public EmailVerification() {}

    /**
     * Constructor with original fields (for backwards compatibility)
     */
    public EmailVerification(String email, String otp, String role,
                             String name, String passwordHash, LocalDateTime expiryTime) {
        this.email        = email;
        this.otp          = otp;
        this.role         = role;
        this.name         = name;
        this.passwordHash = passwordHash;
        this.expiryTime   = expiryTime;
        this.verified     = false;
    }

    /**
     * Constructor with all fields (including new ones)
     */
    public EmailVerification(String email, String otp, String role,
                             String name, String passwordHash, LocalDateTime expiryTime,
                             String department, String college, String phone) {
        this.email        = email;
        this.otp          = otp;
        this.role         = role;
        this.name         = name;
        this.passwordHash = passwordHash;
        this.expiryTime   = expiryTime;
        this.verified     = false;
        this.department   = department;
        this.college      = college;
        this.phone        = phone;
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String h) {
        this.passwordHash = h;
    }

    public LocalDateTime getExpiryTime() {
        return expiryTime;
    }

    public void setExpiryTime(LocalDateTime t) {
        this.expiryTime = t;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    // ─── NEW GETTERS / SETTERS ──────────────────────────────────────────────

    public String getDepartment() {
        return department;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // ── Utility Methods ───────────────────────────────────────────────────────

    /**
     * Check if OTP has expired
     */
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiryTime);
    }

    // ── toString ──────────────────────────────────────────────────────────────

    @Override
    public String toString() {
        return "EmailVerification{" +
                "id=" + id +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", name='" + name + '\'' +
                ", department='" + department + '\'' +
                ", college='" + college + '\'' +
                ", phone='" + phone + '\'' +
                ", expiryTime=" + expiryTime +
                ", verified=" + verified +
                '}';
    }
}