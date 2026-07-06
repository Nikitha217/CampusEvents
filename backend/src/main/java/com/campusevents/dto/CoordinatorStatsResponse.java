package com.campusevents.dto;

public class CoordinatorStatsResponse {
    private long myEvents;
    private long totalParticipants;
    private long attended;
    private double attendanceRate;

    public CoordinatorStatsResponse() {
    }

    public CoordinatorStatsResponse(long myEvents, long totalParticipants, long attended, double attendanceRate) {
        this.myEvents = myEvents;
        this.totalParticipants = totalParticipants;
        this.attended = attended;
        this.attendanceRate = attendanceRate;
    }

    public long getMyEvents() {
        return myEvents;
    }

    public void setMyEvents(long myEvents) {
        this.myEvents = myEvents;
    }

    public long getTotalParticipants() {
        return totalParticipants;
    }

    public void setTotalParticipants(long totalParticipants) {
        this.totalParticipants = totalParticipants;
    }

    public long getAttended() {
        return attended;
    }

    public void setAttended(long attended) {
        this.attended = attended;
    }

    public double getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}
