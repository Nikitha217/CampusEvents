package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.CertificateRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.repository.UserRepository;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.AdminDashboardService;
import com.campusevents.dto.AdminActivityDto;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "*")
public class DashboardController {

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;
    private final CertificateRepository certificateRepository;
    private final AdminDashboardService adminDashboardService;

    public DashboardController(UserRepository u, EventRepository e,
            RegistrationRepository r, CertificateRepository c,
            AdminDashboardService a) {
        userRepository = u; eventRepository = e;
        registrationRepository = r; certificateRepository = c;
        adminDashboardService = a;
    }

    /* ─── STUDENT ────────────────────────────────────────────────────────── */

    @GetMapping("/student")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> studentDashboard(
            Authentication auth) {

        UserDetailsImpl ud = (UserDetailsImpl) auth.getPrincipal();
        String studentId = String.valueOf(ud.getId());

        long totalApprovedEvents = eventRepository.findAll().stream()
                .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())
                          || "ACTIVE".equalsIgnoreCase(e.getStatus()))
                .count();

        List<Registration> regs = registrationRepository.findByStudentEmail(ud.getEmail());
        long registeredEvents = regs.size();

        List<String> regIds = regs.stream().map(Registration::getEventId).collect(Collectors.toList());
        long upcoming = eventRepository.findAll().stream()
                .filter(e -> regIds.contains(e.getId()))
                .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())
                          || "ACTIVE".equalsIgnoreCase(e.getStatus()))
                .count();

        long certificates = certificateRepository.findByStudentId(studentId).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalEvents",      totalApprovedEvents);
        stats.put("registeredEvents", registeredEvents);
        stats.put("upcomingEvents",   upcoming);
        stats.put("certificates",     certificates);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /* ─── COORDINATOR ────────────────────────────────────────────────────── */

    @GetMapping("/coordinator")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> coordinatorDashboard(
            Authentication auth) {

        String email = auth.getName();
        List<Event> myEvents = eventRepository.findByCoordinatorEmail(email);
        List<String> eventIds = myEvents.stream().map(Event::getId).collect(Collectors.toList());

        List<Registration> allRegs = registrationRepository.findAll().stream()
                .filter(r -> eventIds.contains(r.getEventId()))
                .collect(Collectors.toList());

        long pending  = allRegs.stream().filter(r -> "PENDING".equalsIgnoreCase(r.getStatus())).count();
        long approved = allRegs.stream().filter(r -> "APPROVED".equalsIgnoreCase(r.getStatus())).count();
        long total    = allRegs.size();
        long attended = allRegs.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getAttendanceStatus())).count();
        double rate   = total == 0 ? 0 : (attended * 100.0) / total;

        Map<String, Object> stats = new HashMap<>();
        stats.put("createdEvents",        myEvents.size());
        stats.put("pendingRegistrations", pending);
        stats.put("approvedRegistrations",approved);
        stats.put("totalParticipants",    total);
        stats.put("attendedParticipants", attended);
        stats.put("attendanceRate",       Math.round(rate));

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    /* ─── ADMIN ──────────────────────────────────────────────────────────── */

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> adminDashboard() {

        long users    = userRepository.count();
        long events   = eventRepository.count();
        long regs     = registrationRepository.count();
        long present  = registrationRepository.countByAttendanceStatus("PRESENT");

        List<Event> all = eventRepository.findAll();
        long pending  = all.stream().filter(e -> "PENDING".equalsIgnoreCase(e.getStatus())).count();
        long approved = all.stream().filter(e ->
                "APPROVED".equalsIgnoreCase(e.getStatus()) ||
                "ACTIVE".equalsIgnoreCase(e.getStatus())).count();

        double rate = regs == 0 ? 0 : (present * 100.0) / regs;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers",     users);
        stats.put("totalEvents",    events);
        stats.put("pendingEvents",  pending);
        stats.put("approvedEvents", approved);
        stats.put("registrations",  regs);
        stats.put("presentStudents",present);
        stats.put("attendanceRate", Math.round(rate));

        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @GetMapping("/admin/activity")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<AdminActivityDto>> adminDashboardActivity() {
        return ResponseEntity.ok(ApiResponse.success(adminDashboardService.getDashboardActivity()));
    }

    /* ─── PUBLIC ──────────────────────────────────────────────────────────── */

    @GetMapping("/public")
    public ResponseEntity<ApiResponse<Map<String, Object>>> publicDashboard() {
        long users    = userRepository.count();
        long events   = eventRepository.count();
        long regs     = registrationRepository.count();
        long certs    = certificateRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", users);
        stats.put("totalEvents", events);
        stats.put("totalRegistrations", regs);
        stats.put("certificatesIssued", certs);

        return ResponseEntity.ok(ApiResponse.success(stats));
    }
}