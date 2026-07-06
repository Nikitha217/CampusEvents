package com.campusevents.controller;

import com.campusevents.dto.ApiResponse;
import com.campusevents.entity.AuditLog;
import com.campusevents.service.AuditLogService;

import lombok.RequiredArgsConstructor;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * SECURITY FIX: Audit logs now require ADMIN role (was unprotected).
 */
@RestController
@RequestMapping("/api/audit-logs")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('ADMIN')")
public class AuditLogController {

    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogs() {
        return ResponseEntity.ok(ApiResponse.success(auditLogService.getAllLogs()));
    }
}