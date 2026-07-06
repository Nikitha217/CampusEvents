package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.entity.Certificate;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.CertificateRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.service.CertificateService;
import com.campusevents.service.RegistrationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/certificates")
@CrossOrigin(origins = "*")
public class CertificateController {

    private final CertificateService certificateService;
    private final RegistrationService registrationService;
    private final CertificateRepository certificateRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public CertificateController(
            CertificateService certificateService,
            RegistrationService registrationService,
            CertificateRepository certificateRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository) {
        this.certificateService = certificateService;
        this.registrationService = registrationService;
        this.certificateRepository = certificateRepository;
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    /**
     * POST /api/certificates/generate
     */
    @PostMapping("/generate")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Certificate>> generateCertificate(@RequestBody Map<String, String> payload) {
        try {
            String studentId = payload.get("studentId");
            String studentName = payload.get("studentName");
            String eventId = payload.get("eventId");
            String eventTitle = payload.get("eventTitle");

            // 1. Validate event status = COMPLETED
            Event event = eventRepository.findById(eventId)
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            if (!"COMPLETED".equalsIgnoreCase(event.getStatus())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Event must be COMPLETED to issue certificates"));
            }

            // 2. Validate attendee attendance = PRESENT
            Registration reg = registrationRepository.findByStudentEmailAndEventId(studentId, eventId)
                    .orElseThrow(() -> new RuntimeException("Registration not found"));
            
            if (!Boolean.TRUE.equals(reg.getAttended()) && !"PRESENT".equalsIgnoreCase(reg.getAttendanceStatus())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Student must be marked as PRESENT to receive a certificate"));
            }

            Certificate certificate = certificateService.generateCertificate(studentId, studentName, eventId, eventTitle);
            return ResponseEntity.ok(ApiResponse.success("Certificate generated successfully", certificate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to generate certificate: " + e.getMessage()));
        }
    }

    /**
     * POST /api/certificates/generate/{registrationId}
     */
    @PostMapping("/generate/{registrationId}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Certificate>> generateCertificateByRegistration(@PathVariable String registrationId) {
        try {
            Registration reg = registrationService.getRegistrationById(registrationId);
            
            // 1. Validate event status = COMPLETED
            Event event = eventRepository.findById(reg.getEventId())
                    .orElseThrow(() -> new RuntimeException("Event not found"));
            if (!"COMPLETED".equalsIgnoreCase(event.getStatus())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Event must be COMPLETED to issue certificates"));
            }

            // 2. Validate attendee attendance = PRESENT
            if (!Boolean.TRUE.equals(reg.getAttended()) && !"PRESENT".equalsIgnoreCase(reg.getAttendanceStatus())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Student must be marked as PRESENT to receive a certificate"));
            }

            Certificate certificate = certificateService.generateCertificate(
                reg.getStudentEmail(), 
                reg.getStudentName(), 
                reg.getEventId(), 
                reg.getEventTitle()
            );
            return ResponseEntity.ok(ApiResponse.success("Certificate generated successfully", certificate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to generate certificate: " + e.getMessage()));
        }
    }

    /**
     * GET /api/certificates
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Certificate>>> getAllCertificates() {
        try {
            return ResponseEntity.ok(ApiResponse.success(certificateService.getAllCertificates()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch certificates: " + e.getMessage()));
        }
    }

    /**
     * GET /api/certificates/event/{eventId}
     */
    @GetMapping("/event/{eventId}")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<Certificate>>> getCertificatesByEvent(@PathVariable String eventId) {
        try {
            List<Certificate> certs = certificateService.getAllCertificates().stream()
                .filter(c -> eventId.equals(c.getEventId()))
                .collect(Collectors.toList());
            return ResponseEntity.ok(ApiResponse.success(certs));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch certificates: " + e.getMessage()));
        }
    }

    /**
     * GET /api/certificates/student/{studentId}
     * Includes endpoints for /student/{studentId} which is called by the frontend.
     */
    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Certificate>>> getCertificatesByStudent(@PathVariable String studentId) {
        try {
            return ResponseEntity.ok(ApiResponse.success(certificateService.getCertificatesByStudentId(studentId)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch certificates: " + e.getMessage()));
        }
    }

    /**
     * GET /api/certificates/download/{certificateId}
     */
    @GetMapping("/download/{certificateId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Certificate>> downloadCertificate(@PathVariable String certificateId) {
        try {
            Certificate certificate = certificateService.getCertificateById(certificateId);
            return ResponseEntity.ok(ApiResponse.success("Certificate retrieved", certificate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to download certificate: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/certificates/{certificateId}
     */
    @DeleteMapping("/{certificateId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteCertificate(@PathVariable String certificateId) {
        try {
            certificateRepository.deleteById(certificateId);
            return ResponseEntity.ok(ApiResponse.success("Certificate deleted successfully", null));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to delete certificate: " + e.getMessage()));
        }
    }
}
