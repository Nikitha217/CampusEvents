package com.campusevents.service;

import com.campusevents.events.Event;
import com.campusevents.events.EventRepository;
import com.campusevents.events.Registration;
import com.campusevents.repository.RegistrationRepository;

import org.apache.poi.ss.usermodel.BorderStyle;
import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.FillPatternType;
import org.apache.poi.ss.usermodel.Font;
import org.apache.poi.ss.usermodel.HorizontalAlignment;
import org.apache.poi.ss.usermodel.IndexedColors;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ExcelReportService
 *
 * Restricted to COORDINATOR functionality only. Admin reports and helper checks removed.
 */
@Service
public class ExcelReportService {

    private final EventRepository        eventRepository;
    private final RegistrationRepository registrationRepository;

    public ExcelReportService(EventRepository e, RegistrationRepository r) {
        eventRepository        = e;
        registrationRepository = r;
    }

    // ── Events ────────────────────────────────────────────────────────────────

    public byte[] generateEventsReport(Authentication auth) throws Exception {
        List<Event> events = eventRepository.findByCoordinatorEmail(auth.getName());

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Events");
            CellStyle headerStyle = buildHeaderStyle(wb);

            String[] headers = {"Title", "Category", "Department", "Location",
                                 "Start Date", "End Date", "Coordinator", "Status"};
            createHeaderRow(sheet, headerStyle, headers);

            CellStyle altStyle = buildAltStyle(wb);
            for (int i = 0; i < events.size(); i++) {
                Event e = events.get(i);
                Row row = sheet.createRow(i + 1);
                fillRow(row, (i % 2 != 0) ? altStyle : null,
                        safe(e.getTitle()),
                        safe(e.getCategory()),
                        safe(e.getDepartment()),
                        safe(e.getLocation()),
                        safe(e.getStartDate()),
                        safe(e.getEndDate()),
                        safe(e.getCoordinatorName()),
                        safe(e.getStatus())
                );
            }
            autoSize(sheet, headers.length);
            return toBytes(wb);
        }
    }

    // ── Registrations ─────────────────────────────────────────────────────────

    public byte[] generateRegistrationsReport(Authentication auth) throws Exception {
        List<String> eventIds = eventRepository.findByCoordinatorEmail(auth.getName())
                .stream().map(Event::getId).collect(Collectors.toList());
        List<Registration> regs = registrationRepository.findByEventIdIn(eventIds);

        try (Workbook wb = new XSSFWorkbook()) {
            Sheet sheet = wb.createSheet("Registrations");
            CellStyle headerStyle = buildHeaderStyle(wb);

            String[] headers = {"Student", "Email", "Event", "Status",
                                 "Attendance", "Certificate", "QR Code", "Attendance Time"};
            createHeaderRow(sheet, headerStyle, headers);

            CellStyle altStyle = buildAltStyle(wb);
            for (int i = 0; i < regs.size(); i++) {
                Registration r = regs.get(i);
                Row row = sheet.createRow(i + 1);
                fillRow(row, (i % 2 != 0) ? altStyle : null,
                        safe(r.getStudentName()),
                        safe(r.getStudentEmail()),
                        safe(r.getEventTitle()),
                        safe(r.getStatus()),
                        safe(r.getAttendanceStatus()),
                        Boolean.TRUE.equals(r.getCertificateIssued()) ? "Yes" : "No",
                        safe(r.getQrCode()),
                        safe(r.getAttendanceTime())
                );
            }
            autoSize(sheet, headers.length);
            return toBytes(wb);
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private CellStyle buildHeaderStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        font.setColor(IndexedColors.WHITE.getIndex());
        style.setFont(font);
        style.setFillForegroundColor(IndexedColors.CORNFLOWER_BLUE.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        return style;
    }

    private CellStyle buildAltStyle(Workbook wb) {
        CellStyle style = wb.createCellStyle();
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private void createHeaderRow(Sheet sheet, CellStyle style, String[] headers) {
        Row header = sheet.createRow(0);
        header.setHeight((short) 500);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = header.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(style);
        }
    }

    private void fillRow(Row row, CellStyle altStyle, String... values) {
        for (int i = 0; i < values.length; i++) {
            Cell cell = row.createCell(i);
            cell.setCellValue(values[i]);
            if (altStyle != null) cell.setCellStyle(altStyle);
        }
    }

    private void autoSize(Sheet sheet, int count) {
        for (int i = 0; i < count; i++) sheet.autoSizeColumn(i);
    }

    private byte[] toBytes(Workbook wb) throws Exception {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            wb.write(baos);
            return baos.toByteArray();
        }
    }

    private String safe(String v) { return v != null ? v : "—"; }
}