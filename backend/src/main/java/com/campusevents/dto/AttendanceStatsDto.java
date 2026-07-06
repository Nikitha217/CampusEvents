package com.campusevents.dto;

public class AttendanceStatsDto {
    private long present;
    private long absent;
    private int attendanceRate;

    public AttendanceStatsDto() {}

    public AttendanceStatsDto(long present, long absent, int attendanceRate) {
        this.present = present;
        this.absent = absent;
        this.attendanceRate = attendanceRate;
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
