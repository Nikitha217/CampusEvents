package com.campusevents.service;

import com.campusevents.dto.ReportDTO;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;

import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * ReportService – encapsulates report-generation logic.
 *
 * Restricted to COORDINATOR functionality only. Admin reports removed.
 */
@Service
public class ReportService {

    private final EventRepository        eventRepository;
    private final RegistrationRepository registrationRepository;

    public ReportService(EventRepository eventRepository,
                         RegistrationRepository registrationRepository) {
        this.eventRepository        = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    public ReportDTO buildCoordinatorReport(String coordinatorEmail) {
        List<Event> events = eventRepository.findByCoordinatorEmail(coordinatorEmail);
        List<String> eventIds = events.stream().map(Event::getId).collect(Collectors.toList());
        List<Registration> registrations = registrationRepository.findAll().stream()
                .filter(r -> r.getEventId() != null && eventIds.contains(r.getEventId()))
                .collect(Collectors.toList());
        return buildReport(events, registrations);
    }

    private ReportDTO buildReport(List<Event> events,
                                   List<Registration> registrations) {
        ReportDTO dto = new ReportDTO();
        dto.setTotalEvents((long) events.size());
        dto.setTotalRegistrations((long) registrations.size());

        dto.setApprovedRegistrations(registrations.stream()
                .filter(r -> "APPROVED".equals(r.getStatus())).count());

        dto.setTotalPresent(registrations.stream()
                .filter(r -> Boolean.TRUE.equals(r.getAttended())).count());

        dto.setTotalAbsent(registrations.stream()
                .filter(r -> !Boolean.TRUE.equals(r.getAttended())).count());

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

        return dto;
    }
}
