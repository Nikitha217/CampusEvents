package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.entity.Role;
import com.campusevents.entity.User;
import com.campusevents.enums.ERole;
import com.campusevents.repository.RoleRepository;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.UserDetailsImpl;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * UserController – manages user CRUD for admin + self-service profile ops.
 *
 * FIX: Was an exact copy of AuthController (wrong class name + wrong mapping).
 *      Replaced with the correct user-management controller.
 */
@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    /* ── GET ALL USERS (admin only) ──────────────────────────────────────── */

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.success(userRepository.findAll()));
    }

    /* ── GET USER BY ID ──────────────────────────────────────────────────── */

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR','STUDENT')")
    public ResponseEntity<ApiResponse<User>> getUserById(
            @PathVariable Long id,
            Authentication auth) {

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        boolean isAdmin = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        // Non-admin can only fetch own profile
        if (!isAdmin && !ud.getId().equals(id)) {
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access denied"));
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return ResponseEntity.ok(ApiResponse.success(user));
    }

    /* ── GET CURRENT USER (me) ───────────────────────────────────────────── */

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(Authentication auth) {
        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        List<String> roles = ud.getAuthorities().stream()
                .map(a -> a.getAuthority()).collect(Collectors.toList());

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("id",         ud.getId());
        data.put("name",       ud.getName());
        data.put("email",      ud.getEmail());
        data.put("roles",      roles);

        // Fetch full profile for extra fields
        userRepository.findById(ud.getId()).ifPresent(u -> {
            data.put("department", u.getDepartment());
            data.put("phone",      u.getPhone());
            data.put("college",    u.getCollege());
        });

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    /* ── UPDATE PROFILE (self) ───────────────────────────────────────────── */

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<?>> updateMe(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(ud.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (body.containsKey("name")       && !body.get("name").isBlank())
            user.setName(body.get("name"));
        if (body.containsKey("department") && !body.get("department").isBlank())
            user.setDepartment(body.get("department"));
        if (body.containsKey("phone"))
            user.setPhone(body.get("phone"));
        if (body.containsKey("college"))
            user.setCollege(body.get("college"));

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully"));
    }

    /* ── CHANGE PASSWORD (self) ──────────────────────────────────────────── */

    @PutMapping("/me/password")
    public ResponseEntity<ApiResponse<?>> changePassword(
            @RequestBody Map<String, String> body,
            Authentication auth) {

        if (auth == null || !auth.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        String currentPassword = body.get("currentPassword");
        String newPassword     = body.get("newPassword");

        if (currentPassword == null || newPassword == null || newPassword.length() < 6)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("currentPassword and newPassword (min 6 chars) are required"));

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        User user = userRepository.findById(ud.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!passwordEncoder.matches(currentPassword, user.getPassword()))
            return ResponseEntity.badRequest().body(ApiResponse.error("Current password is incorrect"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully"));
    }

    /* ── TOGGLE USER ENABLED (admin) ─────────────────────────────────────── */

    @PutMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> toggleStatus(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEnabled(!Boolean.TRUE.equals(user.getEnabled()));
        return ResponseEntity.ok(ApiResponse.success(
                "User " + (user.getEnabled() ? "enabled" : "disabled"),
                userRepository.save(user)));
    }

    /* ── UPDATE USER ROLE (admin) ────────────────────────────────────────── */

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<User>> updateRole(
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roleName = body.get("role");
        if (roleName == null || roleName.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Role is required"));

        ERole eRole;
        try {
            eRole = ERole.valueOf("ROLE_" + roleName.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role: " + roleName));
        }

        Role roleEntity = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role entity not found: " + eRole));

        user.setRoles(new HashSet<>(Set.of(roleEntity)));
        return ResponseEntity.ok(ApiResponse.success("Role updated", userRepository.save(user)));
    }

    /* ── DELETE USER (admin) ─────────────────────────────────────────────── */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully"));
    }

    /* ── GET USERS BY ROLE (admin) ───────────────────────────────────────── */

    @GetMapping("/role/{role}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<User>>> getUsersByRole(@PathVariable String role) {
        ERole eRole;
        try {
            eRole = ERole.valueOf("ROLE_" + role.toUpperCase());
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role: " + role));
        }
        List<User> users = userRepository.findAll().stream()
                .filter(u -> u.getRoles() != null &&
                        u.getRoles().stream().anyMatch(r -> r.getName() == eRole))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(users));
    }
}
