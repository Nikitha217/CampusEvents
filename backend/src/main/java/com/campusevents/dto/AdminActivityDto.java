package com.campusevents.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminActivityDto {
    private long totalUsers;
    private long totalEvents;
    private long approvedEvents;
    private long registrations;
    private long newUsersToday;
    private long newEventsToday;
    private long pendingApprovals;
    private long approvedToday;
    private long activeStudents;
    private long activeCoordinators;
    private long certificatesIssuedToday;
    private List<ActivityItemDto> recentActivities;
}
