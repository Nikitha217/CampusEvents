package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.dto.AttendanceEventDto;
import com.campusevents.dto.AttendanceParticipantDto;
import com.campusevents.dto.AttendanceStatsDto;
import com.campusevents.dto.BulkAttendanceRequest;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.AttendanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/coordinator/attendance")
@CrossOrigin(origins = "*")
public class CoordinatorAttendanceController {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(CoordinatorAttendanceController.class);

    private final AttendanceService attendanceService;

    public CoordinatorAttendanceController(AttendanceService attendanceService) {
        this.attendanceService = attendanceService;
    }

    @GetMapping("/events")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<List<AttendanceEventDto>>> getEvents(Authentication authentication) {
        try {
            UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
            return ResponseEntity.ok(ApiResponse.success(attendanceService.getCoordinatorEvents(ud.getEmail())));
        } catch (Exception e) {
            logger.error("Error fetching coordinator events: ", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch events: " + e.getMessage()));
        }
    }

    @GetMapping("/participants")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<List<AttendanceParticipantDto>>> getParticipants(
            @RequestParam String eventId,
            Authentication authentication) {
        try {
            UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
            return ResponseEntity.ok(ApiResponse.success(attendanceService.getParticipants(eventId, ud.getEmail())));
        } catch (Exception e) {
            logger.error("Error fetching participants for event {}: ", eventId, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch participants: " + e.getMessage()));
        }
    }

    @GetMapping("/stats")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<AttendanceStatsDto>> getStats(
            @RequestParam String eventId,
            Authentication authentication) {
        try {
            UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
            return ResponseEntity.ok(ApiResponse.success(attendanceService.getStats(eventId, ud.getEmail())));
        } catch (Exception e) {
            logger.error("Error fetching stats for event {}: ", eventId, e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to fetch stats: " + e.getMessage()));
        }
    }

    @PutMapping("/bulk")
    @PreAuthorize("hasAnyRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<?>> bulkMarkAttendance(
            @RequestBody BulkAttendanceRequest request,
            Authentication authentication) {
        try {
            UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
            attendanceService.bulkUpdateAttendance(request.getRegistrationIds(), request.getStatus(), ud.getEmail());
            return ResponseEntity.ok(ApiResponse.ok("Bulk attendance updated"));
        } catch (Exception e) {
            logger.error("Error bulk updating attendance: ", e);
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to update attendance: " + e.getMessage()));
        }
    }
}
