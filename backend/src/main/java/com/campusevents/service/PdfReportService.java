package com.campusevents.service;

import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

/**
 * PdfReportService
 *
 * Restricted to COORDINATOR functionality only. Admin reports and helper checks removed.
 */
@Service
public class PdfReportService {

    private static final Color HEADER_BG = new Color(99, 102, 241);
    private static final Color HEADER_FG = Color.WHITE;
    private static final Color ROW_ALT   = new Color(243, 244, 246);
    private static final Color BORDER    = new Color(209, 213, 219);

    private static final DateTimeFormatter FMT =
            DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");

    private final EventRepository        eventRepository;
    private final RegistrationRepository registrationRepository;

    public PdfReportService(EventRepository e, RegistrationRepository r) {
        eventRepository        = e;
        registrationRepository = r;
    }

    // ── Events Report ─────────────────────────────────────────────────────────

    public byte[] generateEventsReport(Authentication auth) throws Exception {
        List<Event> events = eventRepository.findByCoordinatorEmail(auth.getName());

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addTitle(doc, "Events Report");
            addMeta(doc, events.size() + " events");

            PdfPTable table = createTable(
                    new String[]{"Title", "Category", "Department", "Location", "Start Date", "Status"},
                    new float[]{4, 2, 2, 2, 2, 2});

            int row = 0;
            for (Event e : events) {
                addRow(table, (row++ % 2 == 0) ? Color.WHITE : ROW_ALT,
                        safe(e.getTitle()), safe(e.getCategory()), safe(e.getDepartment()),
                        safe(e.getLocation()), safe(e.getStartDate()), safe(e.getStatus()));
            }
            doc.add(table);
            doc.close();
            return baos.toByteArray();
        }
    }

    // ── Registrations Report ──────────────────────────────────────────────────

    public byte[] generateRegistrationsReport(Authentication auth) throws Exception {
        List<String> eventIds = eventRepository.findByCoordinatorEmail(auth.getName())
                .stream().map(Event::getId).collect(Collectors.toList());
        List<Registration> regs = registrationRepository.findByEventIdIn(eventIds);

        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document doc = new Document(PageSize.A4.rotate());
            PdfWriter.getInstance(doc, baos);
            doc.open();
            addTitle(doc, "Registrations Report");
            addMeta(doc, regs.size() + " registrations");

            PdfPTable table = createTable(
                    new String[]{"Student", "Email", "Event", "Status", "Attendance", "Certificate"},
                    new float[]{3, 4, 4, 2, 2, 2});

            int row = 0;
            for (Registration r : regs) {
                addRow(table, (row++ % 2 == 0) ? Color.WHITE : ROW_ALT,
                        safe(r.getStudentName()), safe(r.getStudentEmail()),
                        safe(r.getEventTitle()), safe(r.getStatus()),
                        safe(r.getAttendanceStatus()),
                        Boolean.TRUE.equals(r.getCertificateIssued()) ? "Yes" : "No");
            }
            doc.add(table);
            doc.close();
            return baos.toByteArray();
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private void addTitle(Document doc, String title) throws DocumentException {
        Font f = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, HEADER_BG);
        Paragraph p = new Paragraph(title, f);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(4);
        doc.add(p);
    }

    private void addMeta(Document doc, String subtitle) throws DocumentException {
        Font f = FontFactory.getFont(FontFactory.HELVETICA, 10, Color.GRAY);
        Paragraph p = new Paragraph(
                "Generated: " + LocalDateTime.now().format(FMT) + "  |  " + subtitle, f);
        p.setAlignment(Element.ALIGN_CENTER);
        p.setSpacingAfter(16);
        doc.add(p);
    }

    private PdfPTable createTable(String[] headers, float[] widths) throws DocumentException {
        PdfPTable table = new PdfPTable(headers.length);
        table.setWidthPercentage(100);
        table.setWidths(widths);
        table.setSpacingBefore(8);

        Font hf = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, HEADER_FG);
        for (String h : headers) {
            PdfPCell cell = new PdfPCell(new Phrase(h, hf));
            cell.setBackgroundColor(HEADER_BG);
            cell.setPadding(8);
            cell.setBorderColor(BORDER);
            table.addCell(cell);
        }
        return table;
    }

    private void addRow(PdfPTable table, Color bg, String... values) {
        Font rf = FontFactory.getFont(FontFactory.HELVETICA, 9, Color.DARK_GRAY);
        for (String v : values) {
            PdfPCell cell = new PdfPCell(new Phrase(v, rf));
            cell.setBackgroundColor(bg);
            cell.setPadding(6);
            cell.setBorderColor(BORDER);
            table.addCell(cell);
        }
    }

    private String safe(String v) { return v != null ? v : "—"; }
}