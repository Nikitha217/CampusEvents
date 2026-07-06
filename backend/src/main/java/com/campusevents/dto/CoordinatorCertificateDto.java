package com.campusevents.dto;

public class CoordinatorCertificateDto {
    private String token;
    private String registrationId;
    private String eventId;
    private String studentName;
    private String studentEmail;
    private String eventTitle;
    private String category;
    private String attendanceStatus;
    private boolean certificateIssued;
    private String status; // STRICT STATUS: ISSUED, ELIGIBLE, PENDING, REJECTED
    private String issuedDate;

    // Default constructor
    public CoordinatorCertificateDto() {}

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRegistrationId() { return registrationId; }
    public void setRegistrationId(String registrationId) { this.registrationId = registrationId; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getEventTitle() { return eventTitle; }
    public void setEventTitle(String eventTitle) { this.eventTitle = eventTitle; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAttendanceStatus() { return attendanceStatus; }
    public void setAttendanceStatus(String attendanceStatus) { this.attendanceStatus = attendanceStatus; }

    public boolean isCertificateIssued() { return certificateIssued; }
    public void setCertificateIssued(boolean certificateIssued) { this.certificateIssued = certificateIssued; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getIssuedDate() { return issuedDate; }
    public void setIssuedDate(String issuedDate) { this.issuedDate = issuedDate; }
}
