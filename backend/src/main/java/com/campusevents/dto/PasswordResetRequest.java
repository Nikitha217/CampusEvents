package com.campusevents.dto;

/**
 * PasswordResetRequest DTO
 *
 * FIX: The original file was named Passwordresetrequest.java (lowercase 'r')
 *      but the class inside is PasswordResetRequest (capital R).
 *      Java requires filename == public class name.
 *      This file is named PasswordResetRequest.java to match.
 *      The old Passwordresetrequest.java should be deleted.
 */
public class PasswordResetRequest {

    private String email;
    private String token;
    private String newPassword;

    public PasswordResetRequest() {}

    public String getEmail()              { return email; }
    public void   setEmail(String e)      { this.email = e; }

    public String getToken()              { return token; }
    public void   setToken(String t)      { this.token = t; }

    public String getNewPassword()        { return newPassword; }
    public void   setNewPassword(String p){ this.newPassword = p; }
}
