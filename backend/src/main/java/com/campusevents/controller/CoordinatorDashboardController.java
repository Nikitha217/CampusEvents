package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.CoordinatorStatsResponse;
import com.campusevents.dto.CountResponse;
import com.campusevents.dto.RateResponse;
import com.campusevents.service.CoordinatorDashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/coordinator/dashboard")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('COORDINATOR') or hasRole('EVENT_COORDINATOR')")
public class CoordinatorDashboardController {

    private final CoordinatorDashboardService coordinatorDashboardService;

    public CoordinatorDashboardController(CoordinatorDashboardService coordinatorDashboardService) {
        this.coordinatorDashboardService = coordinatorDashboardService;
    }

    @GetMapping("/my-events")
    public ResponseEntity<ApiResponse<CountResponse>> getMyEvents(Authentication authentication) {
        CountResponse response = coordinatorDashboardService.getMyEventsCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/total-participants")
    public ResponseEntity<ApiResponse<CountResponse>> getTotalParticipants(Authentication authentication) {
        CountResponse response = coordinatorDashboardService.getTotalParticipantsCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/attended")
    public ResponseEntity<ApiResponse<CountResponse>> getAttended(Authentication authentication) {
        CountResponse response = coordinatorDashboardService.getAttendedCount(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/attendance-rate")
    public ResponseEntity<ApiResponse<RateResponse>> getAttendanceRate(Authentication authentication) {
        RateResponse response = coordinatorDashboardService.getAttendanceRate(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<CoordinatorStatsResponse>> getStats(Authentication authentication) {
        CoordinatorStatsResponse response = coordinatorDashboardService.getCombinedDashboardStats(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
