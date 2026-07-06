package com.campusevents.dto;

/**
 * LoginRequest DTO
 *
 * FIX: Was referenced by AuthController but never existed in the dto package.
 *      Added here to resolve the compilation error.
 */
public class LoginRequest {

    private String email;
    private String password;

    public LoginRequest() {}

    public LoginRequest(String email, String password) {
        this.email    = email;
        this.password = password;
    }

    public String getEmail()              { return email; }
    public void   setEmail(String email)  { this.email = email; }

    public String getPassword()               { return password; }
    public void   setPassword(String password){ this.password = password; }
}
