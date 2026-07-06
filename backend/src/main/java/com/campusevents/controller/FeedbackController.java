package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.entity.Feedback;
import com.campusevents.repository.FeedbackRepository;
import com.campusevents.service.FileStorageService;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

/**
 * FeedbackController
 *
 * FIX: Feedback is a MongoDB document — its ID is String, NOT Long.
 *      Changed deleteById and findById signatures from Long → String.
 */
@RestController
@RequestMapping("/api/feedback")
@CrossOrigin(origins = "*")
public class FeedbackController {

    private final FeedbackRepository feedbackRepository;
    private final FileStorageService fileStorageService;

    public FeedbackController(FeedbackRepository feedbackRepository,
                              FileStorageService fileStorageService) {
        this.feedbackRepository = feedbackRepository;
        this.fileStorageService = fileStorageService;
    }

    /* ─── CREATE ─────────────────────────────────────────────────────────── */

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Feedback>> create(
            @RequestBody Feedback feedback) {

        // Prevent duplicate feedback for same event+student
        if (feedbackRepository.existsByEventIdAndStudentId(
                feedback.getEventId(), feedback.getStudentId())) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("You have already submitted feedback for this event"));
        }

        Feedback saved = feedbackRepository.save(feedback);
        return ResponseEntity.ok(ApiResponse.success("Feedback submitted", saved));
    }

    /* ─── GET ALL ────────────────────────────────────────────────────────── */

    @GetMapping
    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN')")
    public ResponseEntity<ApiResponse<List<Feedback>>> getAll() {
        return ResponseEntity.ok(ApiResponse.success(feedbackRepository.findAll()));
    }

    /* ─── GET BY EVENT ───────────────────────────────────────────────────── */

    @GetMapping("/event/{eventId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Feedback>>> getByEvent(@PathVariable String eventId) {
        return ResponseEntity.ok(ApiResponse.success(
                feedbackRepository.findByEventId(eventId)));
    }

    /* ─── GET BY STUDENT ─────────────────────────────────────────────────── */

    @GetMapping("/student/{studentId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ApiResponse<List<Feedback>>> getByStudent(@PathVariable String studentId) {
        return ResponseEntity.ok(ApiResponse.success(
                feedbackRepository.findByStudentId(studentId)));
    }

    /* ─── DELETE — FIX: String ID, not Long ──────────────────────────────── */

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<?>> delete(@PathVariable String id) {   // ← String, not Long
        if (!feedbackRepository.existsById(id))
            return ResponseEntity.status(404).body(ApiResponse.error("Feedback not found"));
        feedbackRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.ok("Feedback deleted"));
    }

    /* ─── IMAGE UPLOAD (Feature 5) ───────────────────────────────────────── */

    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Map<String, String>>> uploadImage(
            @RequestParam("image") MultipartFile file,
            @RequestParam(value = "feedbackId", required = false) String feedbackId) {  // ← String

        String contentType = file.getContentType();
        if (contentType == null ||
            (!contentType.equals("image/jpeg") && !contentType.equals("image/png"))) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Only JPG and PNG files are accepted"));
        }
        if (file.getSize() > 5 * 1024 * 1024)
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("File must not exceed 5 MB"));

        try {
            String relativePath = fileStorageService.storeFile(file, "feedback");
            String url = "/" + relativePath;

            // Optionally link to existing feedback record
            if (feedbackId != null && !feedbackId.isBlank()) {
                feedbackRepository.findById(feedbackId).ifPresent(fb -> {
                    fb.setImage(url);
                    feedbackRepository.save(fb);
                });
            }

            return ResponseEntity.ok(ApiResponse.success("Image uploaded", Map.of("url", url)));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(ApiResponse.error("Upload failed: " + e.getMessage()));
        }
    }
}