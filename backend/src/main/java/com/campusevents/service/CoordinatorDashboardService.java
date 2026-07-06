package com.campusevents.service;

import com.campusevents.dto.CoordinatorStatsResponse;
import com.campusevents.dto.CountResponse;
import com.campusevents.dto.RateResponse;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.repository.RegistrationRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoordinatorDashboardService {

    private final EventRepository eventRepository;
    private final RegistrationRepository registrationRepository;

    public CoordinatorDashboardService(EventRepository eventRepository, RegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    public CountResponse getMyEventsCount(String email) {
        long count = eventRepository.countByCoordinatorEmail(email);
        return new CountResponse(count);
    }

    public CountResponse getTotalParticipantsCount(String email) {
        List<String> eventIds = getCoordinatorEventIds(email);
        if (eventIds.isEmpty()) return new CountResponse(0);

        long count = registrationRepository.countValidRegistrationsByEventIds(eventIds);
        return new CountResponse(count);
    }

    public CountResponse getAttendedCount(String email) {
        List<String> eventIds = getCoordinatorEventIds(email);
        if (eventIds.isEmpty()) return new CountResponse(0);

        long count = registrationRepository.countPresentByEventIds(eventIds);
        return new CountResponse(count);
    }

    public RateResponse getAttendanceRate(String email) {
        List<String> eventIds = getCoordinatorEventIds(email);
        if (eventIds.isEmpty()) return new RateResponse(0.0);

        long totalParticipants = registrationRepository.countValidRegistrationsByEventIds(eventIds);
        if (totalParticipants == 0) return new RateResponse(0.0);

        long attended = registrationRepository.countPresentByEventIds(eventIds);
        
        double rate = (attended * 100.0) / totalParticipants;
        // Round to 2 decimal places
        double roundedRate = Math.round(rate * 100.0) / 100.0;

        return new RateResponse(roundedRate);
    }

    public CoordinatorStatsResponse getCombinedDashboardStats(String email) {
        long myEvents = eventRepository.countByCoordinatorEmail(email);
        
        List<String> eventIds = getCoordinatorEventIds(email);
        long totalParticipants = 0;
        long attended = 0;
        double attendanceRate = 0.0;

        if (!eventIds.isEmpty()) {
            totalParticipants = registrationRepository.countValidRegistrationsByEventIds(eventIds);
            attended = registrationRepository.countPresentByEventIds(eventIds);
            
            if (totalParticipants > 0) {
                double rate = (attended * 100.0) / totalParticipants;
                attendanceRate = Math.round(rate * 100.0) / 100.0;
            }
        }

        return new CoordinatorStatsResponse(myEvents, totalParticipants, attended, attendanceRate);
    }

    private List<String> getCoordinatorEventIds(String email) {
        return eventRepository.findByCoordinatorEmail(email)
                .stream()
                .map(Event::getId)
                .collect(Collectors.toList());
    }
}
