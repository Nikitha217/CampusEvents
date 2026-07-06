package com.campusevents.service;

import com.campusevents.entity.EmailVerification;
import com.campusevents.entity.Role;
import com.campusevents.entity.User;
import com.campusevents.enums.ERole;
import com.campusevents.repository.EmailVerificationRepository;
import com.campusevents.repository.RoleRepository;
import com.campusevents.repository.UserRepository;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

/**
 * OtpService — manages the entire OTP-based signup flow:
 *   1. sendOtp()    — validate inputs, store pending registration, trigger email
 *   2. verifyOtp()  — validate OTP & expiry, create User with all fields, clean up
 *   3. resendOtp()  — invalidate old OTP, generate fresh one, keep pending data
 * 
 * Stores user details (including department, college, phone) in EmailVerification
 * until OTP is verified, then creates the User account with all fields.
 */
@Service
public class OtpService {

    private static final int    OTP_DIGITS_COUNT = 6;
    private static final int    OTP_EXPIRY_MINUTES = 10;
    private static final String[] ALLOWED_ROLES = {"student", "coordinator"};

    private final EmailVerificationRepository verificationRepository;
    private final UserRepository              userRepository;
    private final RoleRepository              roleRepository;
    private final PasswordEncoder             passwordEncoder;
    private final EmailService                emailService;

    public OtpService(EmailVerificationRepository verificationRepository,
                      UserRepository userRepository,
                      RoleRepository roleRepository,
                      PasswordEncoder passwordEncoder,
                      EmailService emailService) {
        this.verificationRepository = verificationRepository;
        this.userRepository         = userRepository;
        this.roleRepository         = roleRepository;
        this.passwordEncoder        = passwordEncoder;
        this.emailService           = emailService;
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // 1. SEND OTP — Validate and store pending registration
    // ════════════════════════════════════════════════════════════════════════════════

    @Transactional
    public void sendOtp(String name, String email, String password, String role,
                        String department, String college, String phone) {

        // Validate role
        validateRole(role);

        // Validate required fields
        if (name == null || name.isBlank())
            throw new IllegalArgumentException("Name is required");
        if (email == null || !email.contains("@"))
            throw new IllegalArgumentException("Valid email is required");
        if (password == null || password.length() < 6)
            throw new IllegalArgumentException("Password must be at least 6 characters");

        // Validate new fields
        if (department == null || department.isBlank())
            throw new IllegalArgumentException("Department is required");
        if (college == null || college.isBlank())
            throw new IllegalArgumentException("College is required");
        if (phone == null || phone.isBlank())
            throw new IllegalArgumentException("Phone number is required");

        // Validate phone is 10 digits
        String phoneDigits = phone.replaceAll("\\D", "");
        if (phoneDigits.length() != 10)
            throw new IllegalArgumentException("Phone number must be 10 digits");

        // Reject if already a registered user
        if (userRepository.existsByEmail(email))
            throw new IllegalStateException("Email is already registered. Please sign in.");

        // Remove any existing (possibly expired) pending record for this email
        verificationRepository.deleteByEmail(email);

        // Generate OTP
        String otp = generateOtp();
        String passwordHash = passwordEncoder.encode(password);
        LocalDateTime expiry = LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES);

        // Create pending registration record with ALL fields
        EmailVerification record = new EmailVerification();
        record.setEmail(email);
        record.setOtp(otp);
        record.setRole(role);
        record.setName(name);
        record.setPasswordHash(passwordHash);
        record.setExpiryTime(expiry);
        
        // ✅ NEW: Store department, college, phone
        record.setDepartment(department);
        record.setCollege(college);
        record.setPhone(phone);

        verificationRepository.save(record);

        // Send OTP email (async, fire-and-forget)
        emailService.sendOtpEmail(email, name, otp);
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // 2. VERIFY OTP — Create user with all stored fields
    // ════════════════════════════════════════════════════════════════════════════════

    @Transactional
    public User verifyOtp(String email, String otp) {

        // Retrieve pending registration
        EmailVerification record = verificationRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "No pending verification found for this email. Please request a new OTP."));

        // Check expiration
        if (record.isExpired())
            throw new IllegalStateException("OTP has expired. Please request a new one.");

        // Verify OTP code
        if (!record.getOtp().equals(otp))
            throw new IllegalArgumentException("Invalid OTP. Please try again.");

        // ✅ Create the actual user account with ALL fields (including new ones)
        User user = buildUser(record);
        User saved = userRepository.save(user);

        // Clean up the verification record
        verificationRepository.deleteByEmail(email);

        return saved;
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // 3. RESEND OTP — Generate new OTP, keep pending data
    // ════════════════════════════════════════════════════════════════════════════════

    @Transactional
    public void resendOtp(String email) {

        // Retrieve existing pending registration
        EmailVerification record = verificationRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException(
                        "No pending signup found for this email. Please start the signup process again."));

        // Reject if already a registered user
        if (userRepository.existsByEmail(email))
            throw new IllegalStateException("Email is already registered.");

        // Generate new OTP
        String newOtp = generateOtp();
        record.setOtp(newOtp);
        record.setExpiryTime(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        
        // Save back to database (all other fields remain intact)
        verificationRepository.save(record);

        // Send new OTP email
        emailService.sendOtpEmail(email, record.getName(), newOtp);
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // Private Helpers
    // ════════════════════════════════════════════════════════════════════════════════

    /**
     * Generates a 6-digit OTP using SecureRandom.
     */
    private String generateOtp() {
        SecureRandom random = new SecureRandom();
        int bound = (int) Math.pow(10, OTP_DIGITS_COUNT);
        int number = random.nextInt(bound);
        return String.format("%0" + OTP_DIGITS_COUNT + "d", number);
    }

    /**
     * Validates that the role is one of the allowed values.
     */
    private void validateRole(String role) {
        if (role == null)
            throw new IllegalArgumentException("Role is required");
        
        for (String allowed : ALLOWED_ROLES) {
            if (allowed.equalsIgnoreCase(role))
                return;
        }
        
        throw new IllegalArgumentException(
                "Invalid role. Allowed: student, coordinator. Admin cannot self-register.");
    }

    /**
     * Builds a User entity from EmailVerification record.
     * ✅ Now includes department, college, phone
     */
    private User buildUser(EmailVerification record) {
        
        // Determine role
        ERole eRole = "coordinator".equalsIgnoreCase(record.getRole())
                ? ERole.ROLE_COORDINATOR
                : ERole.ROLE_STUDENT;

        // Fetch role entity
        Role roleEntity = roleRepository.findByName(eRole)
                .orElseThrow(() -> new RuntimeException("Role not found: " + eRole));

        // Create user with all fields
        User user = new User();
        user.setName(record.getName());
        user.setEmail(record.getEmail());
        user.setPassword(record.getPasswordHash());   // already hashed in sendOtp()
        user.setEnabled(true);
        
        // ✅ NEW: Set department, college, phone
        user.setDepartment(record.getDepartment());
        user.setCollege(record.getCollege());
        user.setPhone(record.getPhone());

        // Set role
        Set<Role> roles = new HashSet<>();
        roles.add(roleEntity);
        user.setRoles(roles);

        return user;
    }
}