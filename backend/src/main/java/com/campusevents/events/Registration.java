package com.campusevents.events;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

/**
 * Registration — extended with QR code fields (Feature 8) and attendanceTime (Feature 9).
 * All original fields are preserved.
 */
@Document(collection = "registrations")
public class Registration {

    @Id
    private String id;

    private String studentId;
    private String studentName;
    private String studentEmail;
    private String eventId;
    private String eventTitle;

    private String status = "PENDING";

    private String coordinatorId;

    private String attendanceStatus = "PENDING"; // PENDING, PRESENT, ABSENT

    private Boolean certificateIssued = false;

    private Boolean attended = false;

    private Boolean certificateEligible = false;

    // ── Feature 8: QR Attendance ────────────────────────────────────────────

    /** Unique human-readable code, e.g. "REG12345AB". Indexed for fast QR scan lookup. */
    @Indexed(unique = true, sparse = true)
    private String qrCode;

    /** Relative path to the generated PNG, e.g. "uploads/qr/REG12345AB.png" */
    private String qrImagePath;

    /** ISO-8601 timestamp set when attendance is marked PRESENT */
    private String attendanceTime;

    // ── Constructors ──────────────────────────────────────────────────────────

    public Registration() {}

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCoordinatorId() { return coordinatorId; }
    public void setCoordinatorId(String coordinatorId) { this.coordinatorId = coordinatorId; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public Boolean getCertificateIssued() { return certificateIssued; }
    public void setCertificateIssued(Boolean certificateIssued) { this.certificateIssued = certificateIssued; }

    public Boolean getAttended() { return attended; }
    public void setAttended(Boolean attended) { this.attended = attended; }

    public Boolean getCertificateEligible() { return certificateEligible; }
    public void setCertificateEligible(Boolean certificateEligible) { this.certificateEligible = certificateEligible; }

    public String getQrCode() { return qrCode; }
    public void setQrCode(String qrCode) { this.qrCode = qrCode; }

    public String getQrImagePath() { return qrImagePath; }
    public void setQrImagePath(String qrImagePath) { this.qrImagePath = qrImagePath; }

    public String getAttendanceTime() { return attendanceTime; }
    public void setAttendanceTime(String attendanceTime) { this.attendanceTime = attendanceTime; }
}
