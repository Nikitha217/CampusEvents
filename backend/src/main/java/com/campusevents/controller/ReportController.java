package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.ReportDTO;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ReportController
 *
 * Restricted to ROLE_COORDINATOR. Admin-specific logic and access removed.
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin("*")
@PreAuthorize("hasRole('COORDINATOR')")
public class ReportController {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public ReportController(EventRepository eventRepository,
                            RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<ReportDTO>> getReports(Authentication authentication) {

        String email  = authentication.getName();
        List<Event> events = eventRepository.findByCoordinatorEmail(email);
        List<String> eventIds = events.stream()
                .map(Event::getId)
                .collect(Collectors.toList());
        List<Registration> registrations = registrationRepository.findAll().stream()
                .filter(r -> r.getEventId() != null && eventIds.contains(r.getEventId()))
                .collect(Collectors.toList());

        ReportDTO dto = new ReportDTO();
        dto.setTotalEvents((long) events.size());
        dto.setTotalRegistrations((long) registrations.size());

        dto.setApprovedRegistrations(registrations.stream()
                .filter(r -> "APPROVED".equals(r.getStatus()))
                .count());

        dto.setTotalPresent(registrations.stream()
                .filter(r -> Boolean.TRUE.equals(r.getAttended()))
                .count());

        dto.setTotalAbsent(registrations.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getAttended()))
                .count());

        dto.setCertificatesIssued(registrations.stream()
                .filter(r -> Boolean.TRUE.equals(r.getCertificateIssued()))
                .count());

        dto.setStatusChart(registrations.stream()
                .collect(Collectors.groupingBy(
                        r -> r.getStatus() != null ? r.getStatus() : "UNKNOWN",
                        Collectors.counting())));

        dto.setCategoryChart(events.stream()
                .collect(Collectors.groupingBy(
                        e -> e.getCategory() != null ? e.getCategory() : "Uncategorized",
                        Collectors.counting())));

        dto.setEventParticipants(events.stream()
                .collect(Collectors.toMap(
                        e -> e.getTitle() != null ? e.getTitle() : e.getId(),
                        e -> registrations.stream()
                                .filter(r -> e.getId().equals(r.getEventId()))
                                .count(),
                        Long::sum)));

        return ResponseEntity.ok(ApiResponse.success(dto));
    }
}
