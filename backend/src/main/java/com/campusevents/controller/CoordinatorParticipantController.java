package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.ParticipantStatsDto;
import com.campusevents.events.Registration;
import com.campusevents.service.RegistrationSearchService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coordinator/participants")
@CrossOrigin(origins = "*")
public class CoordinatorParticipantController {

    private final RegistrationSearchService registrationSearchService;

    public CoordinatorParticipantController(RegistrationSearchService registrationSearchService) {
        this.registrationSearchService = registrationSearchService;
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<Page<Registration>>> getParticipants(
            @RequestParam List<String> eventIds,
            @RequestParam(required = false, defaultValue = "") String eventId,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String attendanceStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        return ResponseEntity.ok(ApiResponse.success(
                registrationSearchService.searchCoordinatorRegistrations(
                        eventIds, eventId, search, status, attendanceStatus, page, size)
        ));
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<ParticipantStatsDto>> getParticipantStats(
            @RequestParam List<String> eventIds,
            @RequestParam(required = false, defaultValue = "") String eventId) {
        
        return ResponseEntity.ok(ApiResponse.success(
                registrationSearchService.getParticipantStats(eventIds, eventId)
        ));
    }

    @GetMapping("/export")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<List<Registration>>> exportParticipants(
            @RequestParam List<String> eventIds,
            @RequestParam(required = false, defaultValue = "") String eventId,
            @RequestParam(required = false, defaultValue = "") String search,
            @RequestParam(required = false, defaultValue = "ALL") String status,
            @RequestParam(required = false, defaultValue = "ALL") String attendanceStatus) {
        
        return ResponseEntity.ok(ApiResponse.success(
                registrationSearchService.exportCoordinatorRegistrations(
                        eventIds, eventId, search, status, attendanceStatus)
        ));
    }
}
