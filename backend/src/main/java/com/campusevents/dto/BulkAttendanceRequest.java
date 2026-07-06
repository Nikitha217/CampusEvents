package com.campusevents.dto;

import java.util.List;

public class BulkAttendanceRequest {
    private List<String> registrationIds;
    private String status;

    public BulkAttendanceRequest() {}

    public List<String> getRegistrationIds() {
        return registrationIds;
    }

    public void setRegistrationIds(List<String> registrationIds) {
        this.registrationIds = registrationIds;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
