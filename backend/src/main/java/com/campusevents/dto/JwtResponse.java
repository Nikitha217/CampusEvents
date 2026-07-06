package com.campusevents.dto;

import java.util.List;

public class JwtResponse {

    private String token;

    private String type = "Bearer";

    private Long id;

    private String name;

    private String email;

    private List<String> roles;

    public JwtResponse(String token,
                       Long id,
                       String name,
                       String email,
                       List<String> roles) {

        this.token = token;
        this.id = id;
        this.name = name;
        this.email = email;
        this.roles = roles;
    }

    public String getToken() {
        return token;
    }

    public String getType() {
        return type;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public List<String> getRoles() {
        return roles;
    }
}