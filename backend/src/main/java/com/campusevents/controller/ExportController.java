package com.campusevents.controller;

import com.campusevents.service.ExcelReportService;
import com.campusevents.service.PdfReportService;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * ExportController — PDF and Excel export endpoints (Features 6 & 7).
 *
 * Access: ADMIN can export all data; COORDINATOR can export their own events/registrations.
 *
 * PDF endpoints:
 *   GET /api/reports/users/pdf
 *   GET /api/reports/events/pdf
 *   GET /api/reports/registrations/pdf
 *   GET /api/reports/certificates/pdf
 *
 * Excel endpoints:
 *   GET /api/reports/users/excel
 *   GET /api/reports/events/excel
 *   GET /api/reports/registrations/excel
 *   GET /api/reports/certificates/excel
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "*")
@PreAuthorize("hasRole('COORDINATOR')")
public class ExportController {

    private final PdfReportService pdfReportService;
    private final ExcelReportService excelReportService;

    public ExportController(PdfReportService pdfReportService,
                            ExcelReportService excelReportService) {
        this.pdfReportService = pdfReportService;
        this.excelReportService = excelReportService;
    }

    /* ════════════════════════════════════════════════════════════
       PDF EXPORTS
       ════════════════════════════════════════════════════════════ */

    @GetMapping("/events/pdf")
    public ResponseEntity<byte[]> exportEventsPdf(Authentication auth) throws Exception {
        byte[] pdf = pdfReportService.generateEventsReport(auth);
        return pdfResponse(pdf, "events-report.pdf");
    }

    @GetMapping("/registrations/pdf")
    public ResponseEntity<byte[]> exportRegistrationsPdf(Authentication auth) throws Exception {
        byte[] pdf = pdfReportService.generateRegistrationsReport(auth);
        return pdfResponse(pdf, "registrations-report.pdf");
    }

    /* ════════════════════════════════════════════════════════════
       EXCEL EXPORTS
       ════════════════════════════════════════════════════════════ */

    @GetMapping("/events/excel")
    public ResponseEntity<byte[]> exportEventsExcel(Authentication auth) throws Exception {
        byte[] xls = excelReportService.generateEventsReport(auth);
        return excelResponse(xls, "events-report.xlsx");
    }

    @GetMapping("/registrations/excel")
    public ResponseEntity<byte[]> exportRegistrationsExcel(Authentication auth) throws Exception {
        byte[] xls = excelReportService.generateRegistrationsReport(auth);
        return excelResponse(xls, "registrations-report.xlsx");
    }

    /* ── Helpers ─────────────────────────────────────────────────────────── */

    private ResponseEntity<byte[]> pdfResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_PDF)
                .contentLength(data.length)
                .body(data);
    }

    private ResponseEntity<byte[]> excelResponse(byte[] data, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(
                        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .contentLength(data.length)
                .body(data);
    }
}
