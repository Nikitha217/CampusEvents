package com.campusevents.dto;

/**
 * Request body for POST /api/auth/verify-otp
 */
public class VerifyOtpRequest {

    private String name;
    private String email;
    private String password;
    private String role;
    private String department;
    private String college;
    private String phone;
    private String otp;

    public VerifyOtpRequest() {}

    public String getName() { return name; }
    public void   setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void   setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void   setPassword(String password) { this.password = password; }

    public String getRole() { return role; }
    public void   setRole(String role) { this.role = role; }

    public String getDepartment() { return department; }
    public void   setDepartment(String department) { this.department = department; }

    public String getCollege() { return college; }
    public void   setCollege(String college) { this.college = college; }

    public String getPhone() { return phone; }
    public void   setPhone(String phone) { this.phone = phone; }

    public String getOtp()   { return otp; }
    public void   setOtp(String otp) { this.otp = otp; }
}
