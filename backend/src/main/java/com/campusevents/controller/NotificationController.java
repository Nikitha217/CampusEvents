package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.entity.Notification;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.NotificationService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SECURITY FIX: Notifications endpoint was .permitAll() — now requires JWT.
 * Users can only access their own notifications (ownership check).
 * Admin can access all notifications by role.
 */
@RestController
@RequestMapping("/api/notifications")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /* ─── GET notifications ──────────────────────────────────────────────── */

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String role,
            Authentication authentication) {

        // Enforce ownership: students/coordinators can only see own notifications
        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!isAdmin) {
            userId = String.valueOf(ud.getId());
        }

        List<Notification> list = notificationService.getNotifications(userId, role);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    /* ─── GET unread count ───────────────────────────────────────────────── */

    @GetMapping("/unread-count")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Long>> unreadCount(Authentication authentication) {

        UserDetailsImpl ud = (UserDetailsImpl) authentication.getPrincipal();
        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        String userId = isAdmin ? null : String.valueOf(ud.getId());
        String role = null; // No longer extracting from query params

        long count = notificationService.unreadCount(userId, role);
        return ResponseEntity.ok(ApiResponse.success(count));
    }

    /* ─── MARK READ ──────────────────────────────────────────────────────── */

    @PutMapping("/read/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Notification>> markRead(@PathVariable String id) {
        Notification n = notificationService.markRead(id);
        return ResponseEntity.ok(ApiResponse.success("Notification marked as read", n));
    }
}
