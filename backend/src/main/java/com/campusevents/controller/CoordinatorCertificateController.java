package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.CoordinatorCertificateDto;
import com.campusevents.dto.CoordinatorCertificateStatsDto;
import com.campusevents.entity.Certificate;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.CertificateRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.repository.UserRepository;
import com.campusevents.entity.User;
import com.campusevents.service.CertificateService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/coordinator/certificates")
@CrossOrigin(origins = "*")
@PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
public class CoordinatorCertificateController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final CertificateRepository certificateRepository;
    private final CertificateService certificateService;
    private final UserRepository userRepository;

    public CoordinatorCertificateController(
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            CertificateRepository certificateRepository,
            CertificateService certificateService,
            UserRepository userRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.certificateRepository = certificateRepository;
        this.certificateService = certificateService;
        this.userRepository = userRepository;
    }

    private String encodeToken(String id) {
        return Base64.getEncoder().encodeToString(id.getBytes());
    }

    private String decodeToken(String token) {
        return new String(Base64.getDecoder().decode(token));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CoordinatorCertificateDto>>> getCertificates(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Event> myEvents = eventRepository.findByCoordinatorEmail(email);
            List<CoordinatorCertificateDto> dtoList = new ArrayList<>();

            for (Event event : myEvents) {
                List<Registration> registrations = registrationRepository.findByEventId(event.getId());
                for (Registration reg : registrations) {
                    
                    String attendance = reg.getAttendanceStatus() != null ? reg.getAttendanceStatus() : (Boolean.TRUE.equals(reg.getAttended()) ? "PRESENT" : "ABSENT");
                    boolean isEligible = "APPROVED".equalsIgnoreCase(reg.getStatus()) && "PRESENT".equalsIgnoreCase(attendance);
                    
                    String resolvedStudentId = reg.getStudentEmail();
                    if (resolvedStudentId != null && resolvedStudentId.contains("@")) {
                        Optional<User> userOpt = userRepository.findByEmail(resolvedStudentId);
                        if (userOpt.isPresent()) {
                            resolvedStudentId = userOpt.get().getId().toString();
                        }
                    }
                    
                    Optional<Certificate> existingCert = certificateRepository.findFirstByStudentIdAndEventId(resolvedStudentId, event.getId());
                    boolean isIssued = existingCert.isPresent() || Boolean.TRUE.equals(reg.getCertificateIssued());
                    
                    String status = "REJECTED";
                    if (isIssued) {
                        status = "ISSUED";
                    } else if (isEligible) {
                        status = "ELIGIBLE";
                    } else if ("PRESENT".equalsIgnoreCase(attendance)) {
                        status = "PENDING";
                    }
                    
                    CoordinatorCertificateDto dto = new CoordinatorCertificateDto();
                    dto.setToken(encodeToken(reg.getId()));
                    dto.setRegistrationId(reg.getId());
                    dto.setEventId(event.getId());
                    dto.setStudentName(reg.getStudentName());
                    dto.setStudentEmail(reg.getStudentEmail());
                    dto.setEventTitle(event.getTitle());
                    dto.setCategory(event.getCategory());
                    dto.setAttendanceStatus(attendance);
                    dto.setCertificateIssued(isIssued);
                    dto.setStatus(status);
                    
                    if (isIssued) {
                        dto.setIssuedDate(existingCert.get().getIssuedDate().toString());
                    } else {
                        dto.setIssuedDate(null);
                    }
                    
                    dtoList.add(dto);
                }
            }

            return ResponseEntity.ok(ApiResponse.success(dtoList));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch certificates data: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CoordinatorCertificateStatsDto>> getCertificateStats(Authentication authentication) {
        try {
            String email = authentication.getName();
            List<Event> myEvents = eventRepository.findByCoordinatorEmail(email);
            long total = 0;
            long eligible = 0;
            long issued = 0;
            long pending = 0;
            long rejected = 0;

            for (Event event : myEvents) {
                List<Registration> registrations = registrationRepository.findByEventId(event.getId());
                for (Registration reg : registrations) {
                    total++;
                    
                    String attendance = reg.getAttendanceStatus() != null ? reg.getAttendanceStatus() : (Boolean.TRUE.equals(reg.getAttended()) ? "PRESENT" : "ABSENT");
                    boolean isEligible = "APPROVED".equalsIgnoreCase(reg.getStatus()) && "PRESENT".equalsIgnoreCase(attendance);
                    
                    String resolvedStudentId = reg.getStudentEmail();
                    if (resolvedStudentId != null && resolvedStudentId.contains("@")) {
                        Optional<User> userOpt = userRepository.findByEmail(resolvedStudentId);
                        if (userOpt.isPresent()) {
                            resolvedStudentId = userOpt.get().getId().toString();
                        }
                    }
                    boolean isIssued = certificateRepository.findFirstByStudentIdAndEventId(resolvedStudentId, event.getId()).isPresent() || Boolean.TRUE.equals(reg.getCertificateIssued());
                    
                    if (isIssued) {
                        issued++;
                    } else if (isEligible) {
                        eligible++;
                    } else if ("PRESENT".equalsIgnoreCase(attendance)) {
                        pending++;
                    } else {
                        rejected++;
                    }
                }
            }

            CoordinatorCertificateStatsDto stats = new CoordinatorCertificateStatsDto(total, eligible, issued, pending);
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch certificate stats: " + e.getMessage()));
        }
    }

    @PostMapping("/issue/{registrationId}")
    public ResponseEntity<ApiResponse<Certificate>> issueCertificate(@PathVariable String registrationId) {
        try {
            Registration reg = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new RuntimeException("Registration not found"));
                    
            // Check if already issued
            String resolvedStudentId = reg.getStudentEmail();
            if (resolvedStudentId != null && resolvedStudentId.contains("@")) {
                Optional<User> userOpt = userRepository.findByEmail(resolvedStudentId);
                if (userOpt.isPresent()) {
                    resolvedStudentId = userOpt.get().getId().toString();
                }
            }
            Optional<Certificate> existingCert = certificateRepository.findFirstByStudentIdAndEventId(resolvedStudentId, reg.getEventId());
            if (existingCert.isPresent() || Boolean.TRUE.equals(reg.getCertificateIssued())) {
                return ResponseEntity.badRequest().body(ApiResponse.error("Certificate already issued for this student"));
            }

            Certificate certificate = certificateService.generateCertificate(
                reg.getStudentEmail(),
                reg.getStudentName(),
                reg.getEventId(),
                reg.getEventTitle()
            );

            return ResponseEntity.ok(ApiResponse.success("Certificate issued successfully", certificate));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to issue certificate: " + e.getMessage()));
        }
    }

    @GetMapping("/download/{registrationId}")
    public ResponseEntity<?> downloadCertificate(@PathVariable String registrationId) {
        try {
            Registration reg = registrationRepository.findById(registrationId)
                    .orElseThrow(() -> new RuntimeException("Registration not found"));
                    
            String resolvedStudentId = reg.getStudentEmail();
            if (resolvedStudentId != null && resolvedStudentId.contains("@")) {
                Optional<User> userOpt = userRepository.findByEmail(resolvedStudentId);
                if (userOpt.isPresent()) {
                    resolvedStudentId = userOpt.get().getId().toString();
                }
            }
            // Force regenerate to apply new template to old certificates
            Certificate updatedCert = certificateService.generateCertificate(
                reg.getStudentEmail(),
                reg.getStudentName(),
                reg.getEventId(),
                reg.getEventTitle()
            );

            java.nio.file.Path filePath = java.nio.file.Paths.get(updatedCert.getCertificateUrl().substring(1));
            org.springframework.core.io.Resource resource = new org.springframework.core.io.UrlResource(filePath.toUri());

            if (!resource.exists() || !resource.isReadable()) {
                throw new RuntimeException("Could not read the certificate file!");
            }

            String safeName = reg.getStudentName() != null ? reg.getStudentName().replaceAll("\\s+", "_") : "Student";
            String safeEvent = reg.getEventTitle() != null ? reg.getEventTitle().replaceAll("\\s+", "_") : "Event";
            String filename = "Certificate_" + safeName + "_" + safeEvent + ".pdf";

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_PDF)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(resource);

        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to download certificate: " + e.getMessage()));
        }
    }
}
