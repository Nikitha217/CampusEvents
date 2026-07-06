package com.campusevents.service;

import com.campusevents.dto.GoogleUserDto;
import com.campusevents.dto.JwtResponse;
import com.campusevents.entity.Role;
import com.campusevents.entity.User;
import com.campusevents.enums.ERole;
import com.campusevents.repository.RoleRepository;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.JwtUtils;
import com.campusevents.security.UserDetailsImpl;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final NotificationService notificationService;

    public AuthService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       JwtUtils jwtUtils,
                       PasswordEncoder passwordEncoder,
                       NotificationService notificationService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.notificationService = notificationService;
    }

    public JwtResponse googleLogin(GoogleUserDto googleUser, String selectedRole) {

        if ("admin".equalsIgnoreCase(selectedRole)) {
            throw new RuntimeException(
                "Admin role cannot be assigned through Google login."
            );
        }

        User user = findOrCreateUser(googleUser, selectedRole);

        UserDetailsImpl userDetails = UserDetailsImpl.build(user);
        String jwt = jwtUtils.generateJwtToken(userDetails);

        List<String> roles = userDetails.getAuthorities()
                .stream()
                .map(a -> a.getAuthority())
                .collect(Collectors.toList());

        try {
            String roleLabel = roles.get(0).replace("ROLE_", "").toUpperCase();
            notificationService.create(
                    String.valueOf(user.getId()),
                    roleLabel,
                    "Google Login Successful",
                    "You signed in to Eventora via Google.",
                    "LOGIN",
                    String.valueOf(user.getId())
            );
        } catch (Exception ignored) {}

        return buildResponse(jwt, user, roles);
    }

    public User findOrCreateUser(GoogleUserDto googleUser, String selectedRole) {

        // ── Resolve the role entity first ─────────────────────────────────────
        ERole eRole = "coordinator".equalsIgnoreCase(selectedRole)
                ? ERole.ROLE_COORDINATOR
                : ERole.ROLE_STUDENT;

        Role role = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role not found: " + eRole));

        // ── Existing user → update role and save ──────────────────────────────
        Optional<User> existing = userRepository.findByEmail(googleUser.getEmail());
        if (existing.isPresent()) {
            User user = existing.get();

            // Always apply the selected role so returning users
            // are not stuck with their first-registration role
            Set<Role> roles = new HashSet<>();
            roles.add(role);
            user.setRoles(roles);

            return userRepository.save(user); // ✅ persists updated role
        }

        // ── New user ──────────────────────────────────────────────────────────
        User user = new User();
        user.setName(
            (googleUser.getName() != null && !googleUser.getName().isBlank())
                ? googleUser.getName()
                : googleUser.getEmail()
        );
        user.setEmail(googleUser.getEmail());
        user.setPassword(passwordEncoder.encode(UUID.randomUUID().toString()));
        user.setEnabled(true);

        Set<Role> roles = new HashSet<>();
        roles.add(role);
        user.setRoles(roles);

        User savedUser = userRepository.save(user);

        try {
            String roleLabel = eRole.name().replace("ROLE_", "").toUpperCase();

            notificationService.create(
                    "ADMIN", "ADMIN",
                    "New Google User Registered",
                    savedUser.getName() + " joined via Google as " + selectedRole,
                    "USER",
                    String.valueOf(savedUser.getId())
            );

            notificationService.create(
                    String.valueOf(savedUser.getId()),
                    roleLabel,
                    "Welcome to Eventora!",
                    "Your account was created via Google Sign-In.",
                    "USER",
                    String.valueOf(savedUser.getId())
            );
        } catch (Exception ignored) {}

        return savedUser;
    }

    private JwtResponse buildResponse(String jwt, User user, List<String> roles) {
        return new JwtResponse(
                jwt,
                user.getId(),
                user.getName(),
                user.getEmail(),
                roles
        );
    }
}