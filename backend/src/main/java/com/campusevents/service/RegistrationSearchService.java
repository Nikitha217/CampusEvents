package com.campusevents.service;

import com.campusevents.events.Registration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RegistrationSearchService {

    private final MongoTemplate mongoTemplate;

    public RegistrationSearchService(MongoTemplate mongoTemplate) {
        this.mongoTemplate = mongoTemplate;
    }

    public Page<Registration> searchCoordinatorRegistrations(
            List<String> coordinatorEventIds,
            String eventIdFilter,
            String search,
            String status,
            String attendanceStatus,
            int page,
            int size) {

        Query query = new Query();

        // Security: Must be restricted to events owned by the coordinator
        if (coordinatorEventIds == null || coordinatorEventIds.isEmpty()) {
            return new PageImpl<>(List.of(), PageRequest.of(page, Math.max(1, size)), 0);
        }

        // Apply Event Filter
        if (eventIdFilter != null && !eventIdFilter.isEmpty() && !eventIdFilter.equalsIgnoreCase("ALL")) {
            // Verify the filtered event is actually owned by the coordinator
            if (coordinatorEventIds.contains(eventIdFilter)) {
                query.addCriteria(Criteria.where("eventId").is(eventIdFilter));
            } else {
                return new PageImpl<>(List.of(), PageRequest.of(page, Math.max(1, size)), 0);
            }
        } else {
            query.addCriteria(Criteria.where("eventId").in(coordinatorEventIds));
        }

        // Apply Status Filter
        if (status != null && !status.isEmpty() && !status.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("status").is(status));
        }

        // Apply Attendance Filter
        if (attendanceStatus != null && !attendanceStatus.isEmpty() && !attendanceStatus.equalsIgnoreCase("ALL")) {
            query.addCriteria(Criteria.where("attendanceStatus").is(attendanceStatus));
        }

        // Apply Global Search (Name, Email, Event Name)
        if (search != null && !search.trim().isEmpty()) {
            String regex = ".*" + search.trim() + ".*";
            Criteria searchCriteria = new Criteria().orOperator(
                    Criteria.where("studentName").regex(regex, "i"),
                    Criteria.where("studentEmail").regex(regex, "i"),
                    Criteria.where("eventTitle").regex(regex, "i")
            );
            query.addCriteria(searchCriteria);
        }

        // Handle Pagination or Export-All
        long total = mongoTemplate.count(query, Registration.class);
        
        Pageable pageable;
        if (size == -1) {
            // Export all (size = -1)
            pageable = Pageable.unpaged();
        } else {
            pageable = PageRequest.of(page, size);
            query.with(pageable);
        }

        List<Registration> registrations = mongoTemplate.find(query, Registration.class);

        return new PageImpl<>(registrations, pageable == Pageable.unpaged() ? PageRequest.of(0, 1) : pageable, total);
    }

    private Query buildEventIdQuery(List<String> coordinatorEventIds, String eventIdFilter) {
        Query query = new Query();
        if (eventIdFilter != null && !eventIdFilter.isEmpty() && !eventIdFilter.equalsIgnoreCase("ALL")) {
            if (coordinatorEventIds.contains(eventIdFilter)) {
                query.addCriteria(Criteria.where("eventId").is(eventIdFilter));
            } else {
                // Return a query that matches nothing
                query.addCriteria(Criteria.where("eventId").is("INVALID_EVENT_ID"));
            }
        } else {
            query.addCriteria(Criteria.where("eventId").in(coordinatorEventIds));
        }
        return query;
    }

    public com.campusevents.dto.ParticipantStatsDto getParticipantStats(List<String> coordinatorEventIds, String eventIdFilter) {
        if (coordinatorEventIds == null || coordinatorEventIds.isEmpty()) {
            return new com.campusevents.dto.ParticipantStatsDto(0, 0, 0, 0, 0, 0);
        }

        long total = mongoTemplate.count(buildEventIdQuery(coordinatorEventIds, eventIdFilter), Registration.class);
        long approved = mongoTemplate.count(buildEventIdQuery(coordinatorEventIds, eventIdFilter).addCriteria(Criteria.where("status").is("APPROVED")), Registration.class);
        long pending = mongoTemplate.count(buildEventIdQuery(coordinatorEventIds, eventIdFilter).addCriteria(Criteria.where("status").is("PENDING")), Registration.class);
        long present = mongoTemplate.count(buildEventIdQuery(coordinatorEventIds, eventIdFilter).addCriteria(Criteria.where("attendanceStatus").is("PRESENT")), Registration.class);
        long absent = mongoTemplate.count(buildEventIdQuery(coordinatorEventIds, eventIdFilter).addCriteria(Criteria.where("attendanceStatus").is("ABSENT")), Registration.class);

        int attendanceRate = total > 0 ? (int) Math.round(((double) present / total) * 100) : 0;

        return new com.campusevents.dto.ParticipantStatsDto(total, approved, pending, present, absent, attendanceRate);
    }

    public List<Registration> exportCoordinatorRegistrations(
            List<String> coordinatorEventIds,
            String eventIdFilter,
            String search,
            String status,
            String attendanceStatus) {
        Page<Registration> result = searchCoordinatorRegistrations(
                coordinatorEventIds, eventIdFilter, search, status, attendanceStatus, 0, -1);
        return result.getContent();
    }
}
