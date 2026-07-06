package com.campusevents.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.Set;

/**
 * User JPA entity.
 * SECURITY FIX: password field is @JsonIgnore — never serialised in API responses.
 */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;

    @Column(unique = true)
    private String email;

    /** SECURITY: never exposed in any API response */
    @JsonIgnore
    private String password;

    private String department;

    private String phone;

    private String college;

    private Boolean enabled = true;

    /** Token used for password-reset flow (stored hashed) */
    @JsonIgnore
    private String resetToken;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",
        joinColumns = @JoinColumn(name = "user_id"),
        inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles;

    // ── Constructors ──────────────────────────────────────────────────────────

    public User() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public Long    getId()                    { return id; }
    public void    setId(Long id)             { this.id = id; }

    public String  getName()                  { return name; }
    public void    setName(String name)       { this.name = name; }

    public String  getEmail()                 { return email; }
    public void    setEmail(String email)     { this.email = email; }

    @JsonIgnore
    public String  getPassword()              { return password; }
    public void    setPassword(String p)      { this.password = p; }

    public String  getDepartment()                   { return department; }
    public void    setDepartment(String department)  { this.department = department; }

    public String  getPhone()                 { return phone; }
    public void    setPhone(String phone)     { this.phone = phone; }

    public String  getCollege()               { return college; }
    public void    setCollege(String college) { this.college = college; }

    public Boolean getEnabled()               { return enabled; }
    public void    setEnabled(Boolean e)      { this.enabled = e; }

    @JsonIgnore
    public String  getResetToken()            { return resetToken; }
    public void    setResetToken(String t)    { this.resetToken = t; }

    public Set<Role> getRoles()               { return roles; }
    public void      setRoles(Set<Role> r)    { this.roles = r; }
}