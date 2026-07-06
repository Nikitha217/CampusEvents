package com.campusevents.dto;

public class AttendanceParticipantDto {
    private String id;
    private String studentName;
    private String studentEmail;
    private String attendanceStatus;

    public AttendanceParticipantDto() {}

    public AttendanceParticipantDto(String id, String studentName, String studentEmail, String attendanceStatus) {
        this.id = id;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.attendanceStatus = attendanceStatus;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getStudentName() {
        return studentName;
    }

    public void setStudentName(String studentName) {
        this.studentName = studentName;
    }

    public String getStudentEmail() {
        return studentEmail;
    }

    public void setStudentEmail(String studentEmail) {
        this.studentEmail = studentEmail;
    }

    public String getAttendanceStatus() {
        return attendanceStatus;
    }

    public void setAttendanceStatus(String attendanceStatus) {
        this.attendanceStatus = attendanceStatus;
    }
}
