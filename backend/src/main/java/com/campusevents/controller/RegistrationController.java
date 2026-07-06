package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.EmailService;
import com.campusevents.service.NotificationService;
import com.campusevents.service.QrCodeService;
import com.campusevents.service.RegistrationSearchService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * RegistrationController — extended with:
 *   - Email notifications on approve/reject (Feature 2)
 *   - QR code generation on approval (Feature 8)
 *   - QR-based attendance scanning endpoint (Feature 8)
 *
 * All pre-existing endpoints are PRESERVED.
 */
@RestController
@RequestMapping("/api/registrations")
@CrossOrigin(origins = "*")
public class RegistrationController {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final QrCodeService qrCodeService;
    private final RegistrationSearchService registrationSearchService;

    public RegistrationController(RegistrationRepository registrationRepository,
                                  EventRepository eventRepository,
                                  NotificationService notificationService,
                                  EmailService emailService,
                                  QrCodeService qrCodeService,
                                  RegistrationSearchService registrationSearchService) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.qrCodeService = qrCodeService;
        this.registrationSearchService = registrationSearchService;
    }

    /* ─── REGISTER ───────────────────────────────────────────────────────── */

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Registration>> register(
            @RequestBody Registration registration,
            Authentication authentication) {

        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        registration.setStudentEmail(ud.getEmail());

        boolean already = registrationRepository
                .findByStudentEmail(ud.getEmail())
                .stream()
                .anyMatch(r -> r.getEventId().equals(registration.getEventId()));

        if (already)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("You are already registered for this event"));

        Optional<Event> eventOpt = eventRepository.findById(registration.getEventId());
        if (eventOpt.isPresent()) {
            Event event = eventOpt.get();
            if (event.getMaxParticipants() != null) {
                long currentCount = registrationRepository.findByEventId(registration.getEventId()).size();
                if (currentCount >= event.getMaxParticipants())
                    return ResponseEntity.badRequest()
                            .body(ApiResponse.error("Event is full — no more registrations accepted"));
            }
        }

        registration.setStatus("PENDING");
        registration.setAttendanceStatus("PENDING");
        registration.setCertificateIssued(false);
        registration.setAttended(false);
        registration.setCertificateEligible(false);

        Registration saved = registrationRepository.save(registration);

        try {
            notificationService.create("ADMIN", "ADMIN",
                    "New Registration", saved.getStudentName() + " registered for " + saved.getEventTitle(),
                    "REGISTRATION", saved.getId());

            if (registration.getCoordinatorId() != null && !registration.getCoordinatorId().isEmpty()) {
                notificationService.create(registration.getCoordinatorId(), "COORDINATOR",
                        "New Event Registration",
                        saved.getStudentName() + " registered for your event " + saved.getEventTitle(),
                        "REGISTRATION", saved.getId());
            }
        } catch (Exception ignored) {}

        return ResponseEntity.ok(ApiResponse.success("Registered successfully", saved));
    }

    /* ─── GET ALL ────────────────────────────────────────────────────────── */

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<Registration>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(registrationRepository.findAll()));
    }

    /* ─── GET SEARCH/PAGINATED (Coordinator Dashboard) ───────────────────── */
    // Moved to CoordinatorParticipantController

    /* ─── GET BY STUDENT EMAIL ───────────────────────────────────────────── */

    @GetMapping("/student/{email}")
    @PreAuthorize("hasAnyRole('STUDENT','COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<Registration>>> getByStudent(
            @PathVariable String email,
            Authentication authentication) {

        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        boolean isStudent = ud.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));

        if (isStudent && !ud.getEmail().equals(email))
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("Access denied: cannot view others' registrations"));

        return ResponseEntity.ok(ApiResponse.success(
                registrationRepository.findByStudentEmail(email)));
    }

    /* ─── GET BY EVENT ───────────────────────────────────────────────────── */

    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<Registration>>> getByEvent(
            @PathVariable String eventId) {
        return ResponseEntity.ok(ApiResponse.success(
                registrationRepository.findByEventId(eventId)));
    }

    /* ─── CANCEL / DELETE ────────────────────────────────────────────────── */

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<?>> cancel(
            @PathVariable String id,
            Authentication authentication) {

        Optional<Registration> opt = registrationRepository.findById(id);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(ApiResponse.error("Registration not found"));

        Registration reg = opt.get();
        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();

        boolean isStudent = ud.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        if (isStudent && !ud.getEmail().equals(reg.getStudentEmail()))
            return ResponseEntity.status(403)
                    .body(ApiResponse.error("You can only cancel your own registrations"));

        // Remove QR image file if present
        if (reg.getQrImagePath() != null) {
            qrCodeService.deleteQrImage(reg.getQrImagePath());
        }

        registrationRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Registration cancelled successfully"));
    }

    /* ─── APPROVE (with QR generation + email) ───────────────────────────── */

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Registration>> approve(@PathVariable String id) {

        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        reg.setStatus("APPROVED");

        // Generate QR code (Feature 8)
        try {
            String qrCode = "REG" + reg.getId().toUpperCase().replace("-", "").substring(0, 8);
            reg.setQrCode(qrCode);
            String qrImagePath = qrCodeService.generateQrImage(qrCode, reg.getId());
            reg.setQrImagePath(qrImagePath);
        } catch (Exception e) {
            // QR generation failure is non-fatal — registration still approved
        }

        Registration saved = registrationRepository.save(reg);

        // In-app notification
        notificationService.create(reg.getStudentEmail(), "STUDENT",
                "Registration Approved",
                "Your registration for " + reg.getEventTitle() + " has been approved.",
                "REGISTRATION", reg.getId());

        // Email notification (Feature 2 — async)
        emailService.sendRegistrationApprovedEmail(
                reg.getStudentEmail(), reg.getStudentName(), reg.getEventTitle());

        return ResponseEntity.ok(ApiResponse.success("Registration approved", saved));
    }

    /* ─── REJECT (with email) ────────────────────────────────────────────── */

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Registration>> reject(@PathVariable String id) {

        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        reg.setStatus("REJECTED");
        Registration saved = registrationRepository.save(reg);

        // In-app notification
        notificationService.create(reg.getStudentEmail(), "STUDENT",
                "Registration Rejected",
                "Your registration for " + reg.getEventTitle() + " has been rejected.",
                "REGISTRATION", reg.getId());

        // Email notification (Feature 2 — async)
        emailService.sendRegistrationRejectedEmail(
                reg.getStudentEmail(), reg.getStudentName(), reg.getEventTitle());

        return ResponseEntity.ok(ApiResponse.success("Registration rejected", saved));
    }

    /* ─── MARK ATTENDANCE ────────────────────────────────────────────────── */

    @PutMapping("/{id}/attendance")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Registration>> markAttendance(
            @PathVariable String id,
            @RequestParam String status) {

        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        String s = status.toUpperCase();
        if (!s.equals("PRESENT") && !s.equals("ABSENT") && !s.equals("PENDING"))
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Status must be PRESENT, ABSENT or PENDING"));

        reg.setAttendanceStatus(s);
        boolean present = "PRESENT".equals(s);
        reg.setAttended(present);
        reg.setCertificateEligible(present);

        if (present) {
            reg.setAttendanceTime(java.time.Instant.now().toString());
        }

        Registration saved = registrationRepository.save(reg);

        notificationService.create(reg.getStudentEmail(), "STUDENT",
                "Attendance Updated",
                "Your attendance for " + reg.getEventTitle() + " is marked as " + s,
                "ATTENDANCE", reg.getId());

        return ResponseEntity.ok(ApiResponse.success("Attendance updated", saved));
    }

    /* ─── MARK CERTIFICATE ISSUED (with email) ───────────────────────────── */

    @PutMapping("/{id}/certificate-issued")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Registration>> markCertificateIssued(@PathVariable String id) {

        Registration reg = registrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registration not found"));

        reg.setCertificateIssued(true);
        Registration saved = registrationRepository.save(reg);

        // Email notification (Feature 2 — async)
        emailService.sendCertificateIssuedEmail(
                reg.getStudentEmail(), reg.getStudentName(), reg.getEventTitle());

        return ResponseEntity.ok(ApiResponse.success("Certificate issued flag updated", saved));
    }

    /* ─── QR ATTENDANCE SCAN (Feature 8) ────────────────────────────────── */

    /**
     * POST /api/attendance/scan
     * Body: { "qrCode": "REG12345" }
     *
     * Marks attendance PRESENT if valid QR, prevents duplicates.
     */
    @PostMapping("/attendance/scan")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> scanQrAttendance(
            @RequestBody java.util.Map<String, String> body) {

        String qrCode = body.get("qrCode");
        if (qrCode == null || qrCode.isBlank())
            return ResponseEntity.badRequest().body(ApiResponse.error("QR code is required"));

        Optional<Registration> opt = registrationRepository.findByQrCode(qrCode);
        if (opt.isEmpty())
            return ResponseEntity.status(404).body(ApiResponse.error("Invalid QR"));

        Registration reg = opt.get();

        if ("PRESENT".equalsIgnoreCase(reg.getAttendanceStatus()))
            return ResponseEntity.ok(ApiResponse.ok("Attendance already recorded"));

        reg.setAttendanceStatus("PRESENT");
        reg.setAttended(true);
        reg.setCertificateEligible(true);
        reg.setAttendanceTime(java.time.Instant.now().toString());
        registrationRepository.save(reg);

        notificationService.create(reg.getStudentEmail(), "STUDENT",
                "Attendance Marked", "Your attendance for " + reg.getEventTitle()
                        + " has been marked as PRESENT via QR scan.",
                "ATTENDANCE", reg.getId());

        return ResponseEntity.ok(ApiResponse.ok("Attendance marked successfully"));
    }
}
