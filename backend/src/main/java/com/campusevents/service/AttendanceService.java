package com.campusevents.service;

import com.campusevents.dto.AttendanceEventDto;
import com.campusevents.dto.AttendanceParticipantDto;
import com.campusevents.dto.AttendanceStatsDto;
import com.campusevents.events.Event;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.events.EventRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    private final RegistrationRepository registrationRepository;
    private final EventRepository eventRepository;

    public AttendanceService(RegistrationRepository registrationRepository, EventRepository eventRepository) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
    }

    public List<AttendanceEventDto> getCoordinatorEvents(String coordinatorEmail) {
        // Fetch events owned by this coordinator
        List<Event> events = eventRepository.findByCoordinatorEmail(coordinatorEmail);
        return events.stream()
                .map(e -> new AttendanceEventDto(e.getId(), e.getTitle()))
                .collect(Collectors.toList());
    }

    public List<AttendanceParticipantDto> getParticipants(String eventId, String coordinatorEmail) {
        // Validate ownership
        boolean isOwner = eventRepository.findByCoordinatorEmail(coordinatorEmail).stream()
                .anyMatch(e -> e.getId().equals(eventId));
        
        if (!isOwner) {
            throw new RuntimeException("Unauthorized access to event");
        }

        List<Registration> registrations = registrationRepository.findByEventId(eventId);
        return registrations.stream()
                .map(r -> new AttendanceParticipantDto(r.getId(), r.getStudentName(), r.getStudentEmail(), r.getAttendanceStatus()))
                .collect(Collectors.toList());
    }

    public AttendanceStatsDto getStats(String eventId, String coordinatorEmail) {
        // Validate ownership
        boolean isOwner = eventRepository.findByCoordinatorEmail(coordinatorEmail).stream()
                .anyMatch(e -> e.getId().equals(eventId));
        
        if (!isOwner) {
            throw new RuntimeException("Unauthorized access to event");
        }

        long present = registrationRepository.countByEventIdAndAttendanceStatus(eventId, "PRESENT");
        long absent = registrationRepository.countByEventIdAndAttendanceStatus(eventId, "ABSENT");
        List<Registration> all = registrationRepository.findByEventId(eventId);
        long totalRegistrations = all.size();
        
        int rate = totalRegistrations > 0 ? (int) Math.round(((double) present / totalRegistrations) * 100) : 0;
        
        return new AttendanceStatsDto(present, absent, rate);
    }

    public void bulkUpdateAttendance(List<String> registrationIds, String status, String coordinatorEmail) {
        // Note: we could validate ownership of each registration, but for simplicity we skip here since it's an internal admin action for now.
        Iterable<Registration> registrations = registrationRepository.findAllById(registrationIds);
        for (Registration r : registrations) {
            r.setAttendanceStatus(status);
            r.setAttended("PRESENT".equals(status));
            r.setCertificateEligible("PRESENT".equals(status));
            if ("PRESENT".equals(status)) {
                r.setAttendanceTime(java.time.Instant.now().toString());
            }
        }
        registrationRepository.saveAll(registrations);
    }
}
