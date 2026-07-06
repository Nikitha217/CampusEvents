package com.campusevents.controller;

import com.campusevents.dto.AnalyticsResponse;
import com.campusevents.dto.ApiResponse;
import com.campusevents.service.AnalyticsService;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * AnalyticsController — Admin-only analytics endpoints.
 *
 * ROOT CAUSE FIX:
 *   The old controller built AnalyticsResponse inline and only populated 6
 *   scalar fields (totalUsers, totalEvents, totalRegistrations, totalCertificates,
 *   averageRating, attendanceRate). The fields roleDistribution, categoryStats,
 *   monthlyEvents, and monthlyRegistrations were NEVER set — so the API response
 *   always returned null for those keys, and the frontend charts showed nothing.
 *
 *   This version delegates to AnalyticsService which populates every field.
 *
 * Security: All endpoints require ROLE_ADMIN (via @PreAuthorize).
 *           JWT is validated by Spring Security filter chain before reaching here.
 *           Non-admins receive HTTP 403.
 */
@RestController
@RequestMapping("/api/analytics")
@CrossOrigin("*")
@PreAuthorize("hasRole('ADMIN')")
public class AnalyticsController {

    private final AnalyticsService analyticsService;

    public AnalyticsController(AnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    /**
     * GET /api/analytics
     * Returns the full analytics payload with all metrics, distributions, and trend data.
     */
    @GetMapping
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getAnalytics() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Analytics fetched successfully", data));
    }

    /**
     * GET /api/analytics/overview
     * Alias for the main endpoint — same payload for convenience.
     */
    @GetMapping("/overview")
    public ResponseEntity<ApiResponse<AnalyticsResponse>> getOverview() {
        return getAnalytics();
    }

    /**
     * GET /api/analytics/roles
     * Returns only the role distribution map.
     */
    @GetMapping("/roles")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getRoles() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Role distribution fetched", data.getRoleDistribution()));
    }

    /**
     * GET /api/analytics/categories
     * Returns only the category stats map.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<java.util.Map<String, Long>>> getCategories() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Category stats fetched", data.getCategoryStats()));
    }

    /**
     * GET /api/analytics/monthly-events
     * Returns the monthly event trend list.
     */
    @GetMapping("/monthly-events")
    public ResponseEntity<ApiResponse<java.util.List<AnalyticsResponse.MonthlyDataPoint>>> getMonthlyEvents() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Monthly events fetched", data.getMonthlyEvents()));
    }

    /**
     * GET /api/analytics/monthly-registrations
     * Returns the monthly registration trend list.
     */
    @GetMapping("/monthly-registrations")
    public ResponseEntity<ApiResponse<java.util.List<AnalyticsResponse.MonthlyDataPoint>>> getMonthlyRegistrations() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Monthly registrations fetched", data.getMonthlyRegistrations()));
    }

    /**
     * GET /api/analytics/attendance
     * Returns just the attendance rate as a plain double.
     */
    @GetMapping("/attendance")
    public ResponseEntity<ApiResponse<Double>> getAttendanceRate() {
        AnalyticsResponse data = analyticsService.getFullAnalytics();
        return ResponseEntity.ok(ApiResponse.success("Attendance rate fetched", data.getAttendanceRate()));
    }
}