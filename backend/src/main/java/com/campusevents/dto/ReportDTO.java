package com.campusevents.dto;

import java.util.Map;

public class ReportDTO {

    private Long totalEvents;

    private Long totalRegistrations;

    private Long approvedRegistrations;

    private Long totalPresent;

    private Long totalAbsent;

    private Long certificatesIssued;

    private Map<String, Long> statusChart;

    private Map<String, Long> categoryChart;

    private Map<String, Long> eventParticipants;

    public Long getTotalEvents() {
        return totalEvents;
    }

    public void setTotalEvents(Long totalEvents) {
        this.totalEvents = totalEvents;
    }

    public Long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(Long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public Long getApprovedRegistrations() {
        return approvedRegistrations;
    }

    public void setApprovedRegistrations(Long approvedRegistrations) {
        this.approvedRegistrations = approvedRegistrations;
    }

    public Long getTotalPresent() {
        return totalPresent;
    }

    public void setTotalPresent(Long totalPresent) {
        this.totalPresent = totalPresent;
    }

    public Long getTotalAbsent() {
        return totalAbsent;
    }

    public void setTotalAbsent(Long totalAbsent) {
        this.totalAbsent = totalAbsent;
    }

    public Long getCertificatesIssued() {
        return certificatesIssued;
    }

    public void setCertificatesIssued(Long certificatesIssued) {
        this.certificatesIssued = certificatesIssued;
    }

    public Map<String, Long> getStatusChart() {
        return statusChart;
    }

    public void setStatusChart(
            Map<String, Long> statusChart
    ) {
        this.statusChart = statusChart;
    }

    public Map<String, Long> getCategoryChart() {
        return categoryChart;
    }

    public void setCategoryChart(
            Map<String, Long> categoryChart
    ) {
        this.categoryChart = categoryChart;
    }

    public Map<String, Long> getEventParticipants() {
        return eventParticipants;
    }

    public void setEventParticipants(
            Map<String, Long> eventParticipants
    ) {
        this.eventParticipants = eventParticipants;
    }
}