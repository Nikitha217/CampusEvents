package com.campusevents.dto;

public class GoogleRequest {

    private String idToken;
    private String selectedRole; // "student" or "coordinator"

    public GoogleRequest() {}

    public String getIdToken() {
        return idToken;
    }

    public void setIdToken(String idToken) {
        this.idToken = idToken;
    }

    public String getSelectedRole() {
        return selectedRole;
    }

    public void setSelectedRole(String selectedRole) {
        this.selectedRole = selectedRole;
    }
}
