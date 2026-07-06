package com.campusevents.dto;

public class ParticipantStatsDto {
    private long totalRegistrations;
    private long approved;
    private long pending;
    private long present;
    private long absent;
    private int attendanceRate;

    public ParticipantStatsDto() {}

    public ParticipantStatsDto(long totalRegistrations, long approved, long pending, long present, long absent, int attendanceRate) {
        this.totalRegistrations = totalRegistrations;
        this.approved = approved;
        this.pending = pending;
        this.present = present;
        this.absent = absent;
        this.attendanceRate = attendanceRate;
    }

    public long getTotalRegistrations() {
        return totalRegistrations;
    }

    public void setTotalRegistrations(long totalRegistrations) {
        this.totalRegistrations = totalRegistrations;
    }

    public long getApproved() {
        return approved;
    }

    public void setApproved(long approved) {
        this.approved = approved;
    }

    public long getPending() {
        return pending;
    }

    public void setPending(long pending) {
        this.pending = pending;
    }

    public long getPresent() {
        return present;
    }

    public void setPresent(long present) {
        this.present = present;
    }

    public long getAbsent() {
        return absent;
    }

    public void setAbsent(long absent) {
        this.absent = absent;
    }

    public int getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(int attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}
