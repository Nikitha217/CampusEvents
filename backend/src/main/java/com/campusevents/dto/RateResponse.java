package com.campusevents.dto;

public class RateResponse {
    private double attendanceRate;

    public RateResponse() {}

    public RateResponse(double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }

    public double getAttendanceRate() {
        return attendanceRate;
    }

    public void setAttendanceRate(double attendanceRate) {
        this.attendanceRate = attendanceRate;
    }
}
