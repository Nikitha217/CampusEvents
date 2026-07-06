package com.campusevents.entity;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "certificates")
public class Certificate {

    @Id
    private String id;

    private String certificateId;

    private String studentId;

    private String studentName;

    private String eventId;

    private String eventTitle;

    private String certificateUrl;

    private LocalDateTime issuedDate = LocalDateTime.now();

    public Certificate() {
    }

    public Certificate(String studentId, String studentName, String eventId, String eventTitle, String certificateUrl, String certificateId) {
        this.studentId = studentId;
        this.studentName = studentName;
        this.eventId = eventId;
        this.eventTitle = eventTitle;
        this.certificateUrl = certificateUrl;
        this.certificateId = certificateId;
        this.issuedDate = LocalDateTime.now();
    }

    // Getters and Setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCertificateId() {
        return certificateId;
    }

    public void setCertificateId(String certificateId) {
        this.certificateId = certificateId;
    }

    public String getStudentId() {
        return studentId;
    }

    public void setStudentId(String studentId) {
        this.studentId = studentId;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getEventId() {
        return eventId;
    }

    public void setEventId(String eventId) {
        this.eventId = eventId;
    }

    public String getEventTitle() {
        return eventTitle;
    }

    public void setEventTitle(String eventTitle) {
        this.eventTitle = eventTitle;
    }

    public String getCertificateUrl() {
        return certificateUrl;
    }

    public void setCertificateUrl(String certificateUrl) {
        this.certificateUrl = certificateUrl;
    }

    public LocalDateTime getIssuedDate() {
        return issuedDate;
    }

    public void setIssuedDate(LocalDateTime issuedDate) {
        this.issuedDate = issuedDate;
    }
}
