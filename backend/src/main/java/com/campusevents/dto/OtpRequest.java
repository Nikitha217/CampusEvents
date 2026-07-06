package com.campusevents.dto;

/**
 * OtpRequest — Request body for POST /api/auth/send-otp
 * 
 * Contains all registration data needed to:
 *   1. Validate and store pending verification
 *   2. Send OTP to email
 *   3. Create user account after OTP verification
 */
public class OtpRequest {

    private String name;
    private String email;
    private String password;
    private String role;           // "student" or "coordinator"
    
    private String department;     // ← NEW
    private String college;        // ← NEW
    private String phone;          // ← NEW

    // ── Constructors ──────────────────────────────────────────────────────

    public OtpRequest() {}

    public OtpRequest(String name, String email, String password, String role,
                      String department, String college, String phone) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.role = role;
        this.department = department;
        this.college = college;
        this.phone = phone;
    }

    // ── Getters ───────────────────────────────────────────────────────────

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public String getRole() {
        return role;
    }

    public String getDepartment() {
        return department;
    }

    public String getCollege() {
        return college;
    }

    public String getPhone() {
        return phone;
    }

    // ── Setters ───────────────────────────────────────────────────────────

    public void setName(String name) {
        this.name = name;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public void setDepartment(String department) {
        this.department = department;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    // ── toString ──────────────────────────────────────────────────────────

    @Override
    public String toString() {
        return "OtpRequest{" +
                "name='" + name + '\'' +
                ", email='" + email + '\'' +
                ", role='" + role + '\'' +
                ", department='" + department + '\'' +
                ", college='" + college + '\'' +
                ", phone='" + phone + '\'' +
                '}';
    }
}