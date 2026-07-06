package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.security.UserDetailsImpl;
import com.campusevents.service.EmailService;
import com.campusevents.service.FileStorageService;
import com.campusevents.service.NotificationService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * EventController — Complete implementation with:
 *   - CRUD operations
 *   - Approval/Rejection workflow with email notifications
 *   - Poster upload (Feature 4)
 *   - Advanced filtering & search
 *   - Statistics endpoints
 *   - Enhanced validation & error handling
 *
 * All endpoints return standardized ApiResponse format.
 */
@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final NotificationService notificationService;
    private final EmailService emailService;
    private final FileStorageService fileStorageService;

    public EventController(EventRepository eventRepository,
                           NotificationService notificationService,
                           EmailService emailService,
                           FileStorageService fileStorageService) {
        this.eventRepository = eventRepository;
        this.notificationService = notificationService;
        this.emailService = emailService;
        this.fileStorageService = fileStorageService;
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // PUBLIC ENDPOINTS — No authentication required
    // ════════════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/events/approved
     * Fetch all APPROVED or ACTIVE events for students to browse.
     * Includes all event details needed for filtering and modal display.
     */
    @GetMapping("/approved")
    public ResponseEntity<ApiResponse<List<Event>>> getApprovedEvents() {
        try {
            List<Event> events = eventRepository.findAll().stream()
                    .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())
                              || "ACTIVE".equalsIgnoreCase(e.getStatus()))
                    .sorted(Comparator.comparing(Event::getStartDate).reversed())
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch approved events: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/search?q=keyword
     * Search events by title or description (public, no auth required).
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<Event>>> searchEvents(
            @RequestParam(value = "q", defaultValue = "") String query) {
        try {
            String lowerQuery = query.toLowerCase().trim();
            
            List<Event> results = eventRepository.findAll().stream()
                    .filter(e -> ("APPROVED".equalsIgnoreCase(e.getStatus())
                              || "ACTIVE".equalsIgnoreCase(e.getStatus())))
                    .filter(e -> e.getTitle().toLowerCase().contains(lowerQuery)
                             || (e.getDescription() != null && e.getDescription().toLowerCase().contains(lowerQuery))
                             || (e.getCategory() != null && e.getCategory().toLowerCase().contains(lowerQuery))
                             || (e.getDepartment() != null && e.getDepartment().toLowerCase().contains(lowerQuery)))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(results));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Search failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/filter?category=Tech&department=CSE
     * Advanced filtering by multiple criteria (public, no auth required).
     */
    @GetMapping("/filter")
    public ResponseEntity<ApiResponse<List<Event>>> filterEvents(
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "department", required = false) String department,
            @RequestParam(value = "status", defaultValue = "APPROVED") String status) {
        try {
            List<Event> results = eventRepository.findAll().stream()
                    .filter(e -> status.equalsIgnoreCase(e.getStatus()))
                    .filter(e -> category == null || e.getCategory().equalsIgnoreCase(category))
                    .filter(e -> department == null || e.getDepartment().equalsIgnoreCase(department))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(results));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Filter failed: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/categories
     * Get all unique categories from approved events.
     */
    @GetMapping("/categories")
    public ResponseEntity<ApiResponse<List<String>>> getCategories() {
        try {
            List<String> categories = eventRepository.findAll().stream()
                    .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())
                              || "ACTIVE".equalsIgnoreCase(e.getStatus()))
                    .map(Event::getCategory)
                    .filter(Objects::nonNull)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(categories));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch categories: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/departments
     * Get all unique departments from approved events.
     */
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<String>>> getDepartments() {
        try {
            List<String> departments = eventRepository.findAll().stream()
                    .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())
                              || "ACTIVE".equalsIgnoreCase(e.getStatus()))
                    .map(Event::getDepartment)
                    .filter(Objects::nonNull)
                    .distinct()
                    .sorted()
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(departments));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch departments: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // AUTHENTICATED ENDPOINTS — Authentication required
    // ════════════════════════════════════════════════════════════════════════════════

    /**
     * GET /api/events
     * Get all events (authenticated users only).
     */
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Event>>> getAllEvents() {
        try {
            List<Event> events = eventRepository.findAll();
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch events: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/{id}
     * Get a specific event by ID.
     */
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<Event>> getEventById(@PathVariable String id) {
        try {
            return eventRepository.findById(id)
                    .map(event -> ResponseEntity.ok(ApiResponse.success(event)))
                    .orElseGet(() -> ResponseEntity.status(404)
                            .body(ApiResponse.error("Event not found with ID: " + id)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch event: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/my-events
     * Fetch all events created by the logged-in coordinator regardless of status.
     * Root Cause Fix: This endpoint was missing, causing the frontend to hit getEventById("my-events") which returned 404.
     */
    @GetMapping("/my-events")
    @PreAuthorize("hasRole('COORDINATOR')")
    public ResponseEntity<ApiResponse<List<Event>>> getMyEvents(Authentication authentication) {
        try {
            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            List<Event> events = eventRepository.findByCoordinatorEmail(userDetails.getEmail());
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch my events: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/coordinator/{email}
     * Get all events created by a specific coordinator.
     * Only coordinators/admins can access.
     */
    @GetMapping("/coordinator/{email}")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<Event>>> getEventsByCoordinator(
            @PathVariable String email, Authentication authentication) {
        try {
            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = user.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            // Only admins can view other coordinators' events
            if (!isAdmin && !user.getEmail().equals(email)) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("You can only view your own events"));
            }
            
            List<Event> events = eventRepository.findByCoordinatorEmail(email);
            return ResponseEntity.ok(ApiResponse.success(events));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch coordinator events: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // COORDINATOR ENDPOINTS — Coordinator/Admin only
    // ════════════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/events
     * Create a new event.
     * Automatically sets coordinator details from authenticated user.
     * Status defaults to "PENDING" for admin approval.
     */
    @PostMapping
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Event>> createEvent(
            @RequestBody Event event, Authentication authentication) {
        try {
            // Validate required fields
            if (event.getTitle() == null || event.getTitle().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event title is required"));
            }
            if (event.getCategory() == null || event.getCategory().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event category is required"));
            }
            if (event.getDepartment() == null || event.getDepartment().trim().isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event department is required"));
            }
            if (event.getStartDate() == null) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event start date is required"));
            }

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            event.setCoordinatorEmail(userDetails.getEmail());
            event.setCoordinatorId(String.valueOf(userDetails.getId()));
            event.setCoordinatorName(userDetails.getName());
            event.setStatus("PENDING");

            Event saved = eventRepository.save(event);

            // Notify admin about new event submission
            try {
                notificationService.create("ADMIN", "ADMIN",
                        "New Event Submitted",
                        saved.getTitle() + " submitted by " + userDetails.getName(),
                        "EVENT", saved.getId());
            } catch (Exception ignored) {}

            return ResponseEntity.ok(ApiResponse.success("Event created successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to create event: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/events/{id}
     * Update an event (only by coordinator who created it or admin).
     * Performs partial update — only non-null fields are updated.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Event>> updateEvent(
            @PathVariable String id,
            @RequestBody Event updated,
            Authentication authentication) {
        try {
            Event existing = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            // Authorization check
            if (!isAdmin && !existing.getCoordinatorEmail().equals(userDetails.getEmail())) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("You can only edit your own events"));
            }

            // Prevent status change by coordinator (only admin can approve/reject)
            if (!isAdmin && updated.getStatus() != null) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("Only admins can change event status"));
            }

            // Partial update — only non-null fields
            if (updated.getTitle() != null && !updated.getTitle().trim().isEmpty())
                existing.setTitle(updated.getTitle());
            if (updated.getDescription() != null)
                existing.setDescription(updated.getDescription());
            if (updated.getCategory() != null && !updated.getCategory().trim().isEmpty())
                existing.setCategory(updated.getCategory());
            if (updated.getLocation() != null)
                existing.setLocation(updated.getLocation());
            if (updated.getStartDate() != null)
                existing.setStartDate(updated.getStartDate());
            if (updated.getEndDate() != null)
                existing.setEndDate(updated.getEndDate());
            if (updated.getStartTime() != null)
                existing.setStartTime(updated.getStartTime());
            if (updated.getEndTime() != null)
                existing.setEndTime(updated.getEndTime());
            if (updated.getDuration() != null)
                existing.setDuration(updated.getDuration());
            if (updated.getMaxParticipants() != null)
                existing.setMaxParticipants(updated.getMaxParticipants());
            if (updated.getDepartment() != null && !updated.getDepartment().trim().isEmpty())
                existing.setDepartment(updated.getDepartment());
            if (updated.getImage() != null)
                existing.setImage(updated.getImage());
            if (updated.getPosterUrl() != null)
                existing.setPosterUrl(updated.getPosterUrl());

            Event saved = eventRepository.save(existing);
            return ResponseEntity.ok(ApiResponse.success("Event updated successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to update event: " + e.getMessage()));
        }
    }

    /**
     * DELETE /api/events/{id}
     * Delete an event (only by coordinator who created it or admin).
     * Also deletes associated poster file.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<?>> deleteEvent(
            @PathVariable String id, Authentication authentication) {
        try {
            Event existing = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            // Authorization check
            if (!isAdmin && !existing.getCoordinatorEmail().equals(userDetails.getEmail())) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("You can only delete your own events"));
            }

            // Delete poster file if exists
            if (existing.getPosterUrl() != null && !existing.getPosterUrl().isEmpty()) {
                try {
                    fileStorageService.deleteFile(existing.getPosterUrl().replaceFirst("^/", ""));
                } catch (Exception e) {
                    // Log but don't fail — event deletion continues
                    System.err.println("Failed to delete poster file: " + e.getMessage());
                }
            }

            eventRepository.deleteById(id);
            return ResponseEntity.ok(ApiResponse.ok("Event deleted successfully"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to delete event: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // ADMIN ENDPOINTS — Admin only
    // ════════════════════════════════════════════════════════════════════════════════

        /**
         * GET /api/events/pending
         * Get all pending events (Admin only)
         */
        @GetMapping("/pending")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<List<Event>>> getPendingEvents() {
        try {
            List<Event> events = eventRepository
                .findByStatusIgnoreCase("PENDING");

            return ResponseEntity.ok(
                ApiResponse.success(events)
            );

        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                .body(
                    ApiResponse.error(
                        "Failed to fetch pending events: "
                            + e.getMessage()
                    )
                );
        }
        }

    /**
     * PUT /api/events/{id}/approve
     * Approve an event (admin only).
     * Sends email notification to coordinator and in-app notification.
     * Feature 2 integration.
     */
    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Event>> approveEvent(@PathVariable String id) {
        try {
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            if ("APPROVED".equalsIgnoreCase(event.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event is already approved"));
            }

            event.setStatus("APPROVED");
            Event saved = eventRepository.save(event);

            // In-app notification to coordinator
            try {
                notificationService.create(event.getCoordinatorId(), "COORDINATOR",
                        "Event Approved ✓",
                        "Your event \"" + event.getTitle() + "\" has been approved and is now live!",
                        "EVENT", event.getId());
            } catch (Exception e) {
                System.err.println("Failed to create in-app notification: " + e.getMessage());
            }

            // Email notification to coordinator (Feature 2 — async)
            try {
                emailService.sendEventApprovedEmail(
                        event.getCoordinatorEmail(),
                        event.getCoordinatorName(),
                        event.getTitle());
            } catch (Exception e) {
                System.err.println("Failed to send approval email: " + e.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.success("Event approved successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to approve event: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/events/{id}/reject
     * Reject an event (admin only).
     * Sends in-app notification to coordinator.
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Event>> rejectEvent(
            @PathVariable String id,
            @RequestParam(value = "reason", required = false) String reason) {
        try {
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            if ("REJECTED".equalsIgnoreCase(event.getStatus())) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Event is already rejected"));
            }

            event.setStatus("REJECTED");
            Event saved = eventRepository.save(event);

            // Notify coordinator
            try {
                String rejectionMsg = "Your event \"" + event.getTitle() + "\" was rejected.";
                if (reason != null && !reason.trim().isEmpty()) {
                    rejectionMsg += " Reason: " + reason;
                } else {
                    rejectionMsg += " Please contact admin for details.";
                }

                notificationService.create(event.getCoordinatorId(), "COORDINATOR",
                        "Event Rejected",
                        rejectionMsg,
                        "EVENT", event.getId());
            } catch (Exception e) {
                System.err.println("Failed to create rejection notification: " + e.getMessage());
            }

            return ResponseEntity.ok(ApiResponse.success("Event rejected successfully", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to reject event: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/admin/statistics
     * Get event statistics (admin only).
     */
    @GetMapping("/admin/statistics")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getStatistics() {
        try {
            List<Event> allEvents = eventRepository.findAll();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalEvents", allEvents.size());
            stats.put("approvedEvents", allEvents.stream()
                    .filter(e -> "APPROVED".equalsIgnoreCase(e.getStatus())).count());
            stats.put("pendingEvents", allEvents.stream()
                    .filter(e -> "PENDING".equalsIgnoreCase(e.getStatus())).count());
            stats.put("rejectedEvents", allEvents.stream()
                    .filter(e -> "REJECTED".equalsIgnoreCase(e.getStatus())).count());
            stats.put("uniqueDepartments", allEvents.stream()
                    .map(Event::getDepartment).filter(Objects::nonNull).distinct().count());
            stats.put("uniqueCategories", allEvents.stream()
                    .map(Event::getCategory).filter(Objects::nonNull).distinct().count());
            
            return ResponseEntity.ok(ApiResponse.success(stats));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch statistics: " + e.getMessage()));
        }
    }

    // ════════════════════════════════════════════════════════════════════════════════
    // FILE UPLOAD ENDPOINT — Coordinator/Admin only
    // ════════════════════════════════════════════════════════════════════════════════

    /**
     * POST /api/events/upload-poster
     * Upload event poster image (Feature 4).
     * 
     * Form Data:
     *   - poster: MultipartFile (JPG/PNG, max 5MB)
     *   - eventId: (optional) String — attach poster to event immediately
     *
     * Returns:
     *   {
     *     "success": true,
     *     "message": "Poster uploaded",
     *     "data": { "url": "/uploads/events/uuid_filename.jpg" }
     *   }
     */
    @PostMapping(value = "/upload-poster", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadPoster(
            @RequestParam("poster") MultipartFile file,
            @RequestParam(value = "eventId", required = false) String eventId) {
        try {
            // Validate file type
            String contentType = file.getContentType();
            if (contentType == null ||
                (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("Only JPG and PNG files are accepted"));
            }

            // Validate file size (5 MB max)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File size must not exceed 5 MB"));
            }

            // Validate file is not empty
            if (file.isEmpty()) {
                return ResponseEntity.badRequest()
                        .body(ApiResponse.error("File cannot be empty"));
            }

            // Store file
            String relativePath = fileStorageService.storeFile(file, "events");
            String url = "/" + relativePath;

            // Optionally attach to event
            if (eventId != null && !eventId.trim().isEmpty()) {
                eventRepository.findById(eventId).ifPresent(event -> {
                    event.setPosterUrl(url);
                    eventRepository.save(event);
                });
            }

            Map<String, String> response = new HashMap<>();
            response.put("url", url);
            response.put("filename", file.getOriginalFilename());
            response.put("size", file.getSize() + " bytes");

            return ResponseEntity.ok(ApiResponse.success("Poster uploaded successfully", response));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/events/{id}/complete
     * Mark an event as COMPLETED. Allowed for Coordinator.
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Event>> completeEvent(@PathVariable String id, Authentication authentication) {
        try {
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !event.getCoordinatorEmail().equals(user.getEmail())) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("You are not authorized to complete this event"));
            }

            event.setStatus("COMPLETED");
            Event saved = eventRepository.save(event);

            return ResponseEntity.ok(ApiResponse.success("Event marked as completed", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to complete event: " + e.getMessage()));
        }
    }

    /**
     * PUT /api/events/{id}/activate
     * Mark an event as ACTIVE. Allowed for Coordinator.
     */
    @PutMapping("/{id}/activate")
    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    public ResponseEntity<ApiResponse<Event>> activateEvent(@PathVariable String id, Authentication authentication) {
        try {
            Event event = eventRepository.findById(id)
                    .orElseThrow(() -> new RuntimeException("Event not found"));

            UserDetailsImpl user = (UserDetailsImpl) authentication.getPrincipal();
            boolean isAdmin = user.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

            if (!isAdmin && !event.getCoordinatorEmail().equals(user.getEmail())) {
                return ResponseEntity.status(403)
                        .body(ApiResponse.error("You are not authorized to activate this event"));
            }

            event.setStatus("ACTIVE");
            Event saved = eventRepository.save(event);

            return ResponseEntity.ok(ApiResponse.success("Event marked as active", saved));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to activate event: " + e.getMessage()));
        }
    }

    /**
     * GET /api/events/category/{categoryId}
     * Get events by category (public, no auth required).
     */
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<ApiResponse<List<Event>>> getEventsByCategory(@PathVariable String categoryId) {
        try {
            List<Event> results = eventRepository.findAll().stream()
                    .filter(e -> ("APPROVED".equalsIgnoreCase(e.getStatus())
                              || "ACTIVE".equalsIgnoreCase(e.getStatus())))
                    .filter(e -> e.getCategory() != null && e.getCategory().equalsIgnoreCase(categoryId))
                    .collect(Collectors.toList());
            
            return ResponseEntity.ok(ApiResponse.success(results));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Failed to fetch events by category: " + e.getMessage()));
        }
    }
}