package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.GoogleRequest;
import com.campusevents.dto.GoogleUserDto;
import com.campusevents.dto.JwtResponse;
import com.campusevents.dto.LoginRequest;
import com.campusevents.dto.OtpRequest;
import com.campusevents.dto.PasswordResetRequest;
import com.campusevents.dto.SignupRequest;
import com.campusevents.dto.VerifyOtpRequest;
import com.campusevents.entity.Role;
import com.campusevents.entity.User;
import com.campusevents.enums.ERole;
import com.campusevents.repository.RoleRepository;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.JwtUtils;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.AuthService;
import com.campusevents.service.GoogleAuthService;
import com.campusevents.service.NotificationService;
import com.campusevents.service.OtpService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * AuthController — extended with OTP-based signup flow (Features 1 & 2).
 *
 * NEW endpoints:
 *   POST /api/auth/send-otp    — send 6-digit OTP to email
 *   POST /api/auth/verify-otp  — verify OTP and create account
 *   POST /api/auth/resend-otp  — resend a fresh OTP
 *
 * All pre-existing endpoints are PRESERVED unchanged.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtUtils jwtUtils;
    private final NotificationService notificationService;
    private final GoogleAuthService googleAuthService;
    private final AuthService authService;
    private final OtpService otpService;

    public AuthController(AuthenticationManager authenticationManager,
                          UserRepository userRepository,
                          RoleRepository roleRepository,
                          PasswordEncoder encoder,
                          JwtUtils jwtUtils,
                          NotificationService notificationService,
                          GoogleAuthService googleAuthService,
                          AuthService authService,
                          OtpService otpService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtUtils = jwtUtils;
        this.notificationService = notificationService;
        this.googleAuthService = googleAuthService;
        this.authService = authService;
        this.otpService = otpService;
    }

    /* ═══════════════════════════════════════════════════════════════════════
       EXISTING ENDPOINTS (unchanged)
       ═══════════════════════════════════════════════════════════════════════ */

    @PostMapping("/signin")
    public ResponseEntity<ApiResponse<JwtResponse>> signin(@RequestBody LoginRequest req) {

        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword()));

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        String jwt = jwtUtils.generateJwtToken(ud);

        List<String> roles = ud.getAuthorities().stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        try {
            String role = roles.get(0).replace("ROLE_", "");
            notificationService.create(String.valueOf(ud.getId()), role,
                    "Login Successful", "You logged into Eventora", "LOGIN",
                    String.valueOf(ud.getId()));
        } catch (Exception ignored) {}

        JwtResponse body = new JwtResponse(jwt, ud.getId(), ud.getName(), ud.getEmail(), roles);
        return ResponseEntity.ok(ApiResponse.success("Login successful", body));
    }

    @PostMapping("/google")
    public ResponseEntity<ApiResponse<JwtResponse>> googleLogin(@RequestBody GoogleRequest req) {

        if (req.getIdToken() == null || req.getIdToken().isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Google ID token is required"));

        String role = req.getSelectedRole();
        if (role == null || role.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Selected role is required"));

        if ("admin".equalsIgnoreCase(role))
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Admin role cannot be assigned via Google login"));

        try {
            GoogleUserDto googleUser = googleAuthService.verifyToken(req.getIdToken());
            JwtResponse jwt = authService.googleLogin(googleUser, role);
            return ResponseEntity.ok(ApiResponse.success("Google login successful", jwt));
        } catch (Exception e) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Google authentication failed: " + e.getMessage()));
        }
    }

    /** Legacy direct-signup — still works for backwards-compat / admin use */
    @PostMapping("/signup")
    public ResponseEntity<ApiResponse<?>> signup(@RequestBody SignupRequest req) {

        if ("admin".equalsIgnoreCase(req.getRole()))
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Admin accounts cannot be self-registered"));

        if (userRepository.existsByEmail(req.getEmail()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email is already registered"));

        User user = new User();
        user.setName(req.getName());
        user.setEmail(req.getEmail());
        user.setPassword(encoder.encode(req.getPassword()));
        user.setDepartment(req.getDepartment());
        user.setCollege(req.getCollege());
        user.setPhone(req.getPhone());
        user.setEnabled(true);

        ERole eRole = "coordinator".equalsIgnoreCase(req.getRole())
                ? ERole.ROLE_COORDINATOR : ERole.ROLE_STUDENT;

        Role roleEntity = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role not found"));

        user.setRoles(new HashSet<>(Set.of(roleEntity)));
        User saved = userRepository.save(user);

        try {
            notificationService.create("ADMIN", "ADMIN",
                    "New User Registered", saved.getName() + " registered as " + eRole.name(),
                    "USER", String.valueOf(saved.getId()));
            notificationService.create(String.valueOf(saved.getId()), eRole.name().replace("ROLE_", ""),
                    "Welcome to Eventora", "Your account has been created successfully.",
                    "USER", String.valueOf(saved.getId()));
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.ok("Registration successful. Please sign in."));
    }

    @GetMapping("/test-auth")
    public ResponseEntity<ApiResponse<Map<String, Object>>> testAuth(Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        List<String> roles = ud.getAuthorities().stream()
                .map(a -> a.getAuthority()).collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("id",    ud.getId());
        data.put("name",  ud.getName());
        data.put("email", ud.getEmail());
        data.put("roles", roles);

        return ResponseEntity.ok(ApiResponse.success(data));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<?>> updateProfile(
            @RequestBody SignupRequest req, Authentication authentication) {

        if (authentication == null || !authentication.isAuthenticated())
            return ResponseEntity.status(401).body(ApiResponse.error("Not authenticated"));

        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(ud.getId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (req.getName() != null && !req.getName().isBlank())
            user.setName(req.getName());
        if (req.getDepartment() != null && !req.getDepartment().isBlank())
            user.setDepartment(req.getDepartment());

        userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<?>> forgotPassword(@RequestBody PasswordResetRequest req) {

        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty())
            return ResponseEntity.ok(ApiResponse.ok(
                    "If that email is registered, a reset link has been sent."));

        User user = userOpt.get();
        String token = UUID.randomUUID().toString();
        user.setResetToken(encoder.encode(token));
        userRepository.save(user);

        try {
            notificationService.create(
                    String.valueOf(user.getId()), "STUDENT",
                    "Password Reset Requested",
                    "Your reset token: " + token + " (valid for 1 hour)",
                    "SYSTEM", String.valueOf(user.getId()));
        } catch (Exception ignored) {}

        Map<String, String> data = new HashMap<>();
        data.put("token", token);
        data.put("email", req.getEmail());

        return ResponseEntity.ok(ApiResponse.success(
                "Password reset token generated. Check notifications.", data));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<?>> resetPassword(@RequestBody PasswordResetRequest req) {

        if (req.getEmail() == null || req.getToken() == null || req.getNewPassword() == null)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Email, token and new password are required"));

        if (req.getNewPassword().length() < 6)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Password must be at least 6 characters"));

        Optional<User> userOpt = userRepository.findByEmail(req.getEmail());
        if (userOpt.isEmpty())
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid request"));

        User user = userOpt.get();

        if (user.getResetToken() == null ||
                !encoder.matches(req.getToken(), user.getResetToken()))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid or expired reset token"));

        user.setPassword(encoder.encode(req.getNewPassword()));
        user.setResetToken(null);
        userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.ok("Password reset successful. Please sign in."));
    }

    /* ═══════════════════════════════════════════════════════════════════════
       NEW OTP ENDPOINTS (Feature 1)
       ═══════════════════════════════════════════════════════════════════════ */

    /**
     * Step 1 of OTP signup: validate inputs, generate OTP, send email.
     *
     * POST /api/auth/send-otp
     * Body: { name, email, password, role, department, college, phone }
     * Response: { message: "OTP Sent" }
     */
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<?>> sendOtp(@RequestBody OtpRequest req) {
        try {
            otpService.sendOtp(
                    req.getName(),
                    req.getEmail(),
                    req.getPassword(),
                    req.getRole(),
                    req.getDepartment(),
                    req.getCollege(),
                    req.getPhone());
            return ResponseEntity.ok(ApiResponse.ok("OTP Sent"));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(409).body(ApiResponse.error(e.getMessage()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to send OTP. Please try again."));
        }
    }

    /**
     * Step 2 of OTP signup: verify OTP, create account.
     *
     * POST /api/auth/verify-otp
     * Body: { email, otp }
     * Response: { message: "Account Created Successfully" }
     */
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<?>> verifyOtp(@RequestBody VerifyOtpRequest req) {
        try {
            User created = otpService.verifyOtp(req.getEmail(), req.getOtp());

            // Send welcome notification
            try {
                notificationService.create(String.valueOf(created.getId()), "STUDENT",
                        "Welcome to Eventora", "Your account has been created successfully.",
                        "USER", String.valueOf(created.getId()));
                notificationService.create("ADMIN", "ADMIN",
                        "New User Registered", created.getName() + " joined Eventora",
                        "USER", String.valueOf(created.getId()));
            } catch (Exception ignored) {}

            return ResponseEntity.ok(ApiResponse.ok("Account Created Successfully"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Account creation failed. Please try again."));
        }
    }

    /**
     * Resend OTP — generates a new OTP without re-entering registration details.
     *
     * POST /api/auth/resend-otp
     * Body: { email }
     * Response: { message: "OTP Resent" }
     */
    @PostMapping("/resend-otp")
    public ResponseEntity<ApiResponse<?>> resendOtp(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email == null || email.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        try {
            otpService.resendOtp(email);
            return ResponseEntity.ok(ApiResponse.ok("OTP Resent"));
        } catch (IllegalStateException | IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to resend OTP."));
        }
    }
}
