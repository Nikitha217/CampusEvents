package com.campusevents.service;

import com.campusevents.dto.ActivityItemDto;
import com.campusevents.dto.AdminActivityDto;
import com.campusevents.enums.ERole;
import com.campusevents.events.EventRepository;
import com.campusevents.repository.CertificateRepository;
import com.campusevents.repository.NotificationRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private static final Logger logger = LoggerFactory.getLogger(AdminDashboardService.class);

    private final UserRepository userRepository;
    private final EventRepository eventRepository;
    private final CertificateRepository certificateRepository;
    private final NotificationRepository notificationRepository;
    private final RegistrationRepository registrationRepository;

    public AdminActivityDto getDashboardActivity() {
        LocalDateTime todayStart = LocalDate.now().atStartOfDay();

        long newUsersToday = notificationRepository.countByTitleAndCreatedAtGreaterThanEqual(
                "New User Registered", todayStart);

        long newEventsToday = notificationRepository.countByTitleAndCreatedAtGreaterThanEqual(
                "New Event Pending Approval", todayStart);

        long approvedToday = notificationRepository.countByTitleAndCreatedAtGreaterThanEqual(
                "Event Approved", todayStart);

        long pendingApprovals = eventRepository.countByStatus("PENDING");
        
        long totalUsers = userRepository.count();
        long totalRegistrations = registrationRepository.count();

        // --- Debugging Logs ---
        long totalEvents = eventRepository.count();
        long approvedEvents = eventRepository.countByStatus("APPROVED");
        long rejectedEvents = eventRepository.countByStatus("REJECTED");
        logger.info("Admin Dashboard - Total events: {}", totalEvents);
        logger.info("Admin Dashboard - Pending events: {}", pendingApprovals);
        logger.info("Admin Dashboard - Approved events: {}", approvedEvents);
        logger.info("Admin Dashboard - Rejected events: {}", rejectedEvents);
        // ----------------------

        long certificatesIssuedToday = certificateRepository.countByIssuedDateGreaterThanEqual(todayStart);

        long activeStudents = 0;
        long activeCoordinators = 0;

        List<Object[]> roleCounts = userRepository.countByRole();
        for (Object[] row : roleCounts) {
            ERole roleEnum = (ERole) row[0];
            String roleName = roleEnum != null ? roleEnum.name() : "";
            long count = (Long) row[1];
            if ("ROLE_STUDENT".equalsIgnoreCase(roleName)) {
                activeStudents = count;
            } else if ("ROLE_COORDINATOR".equalsIgnoreCase(roleName)) {
                activeCoordinators = count;
            }
        }

        List<ActivityItemDto> recentActivities = notificationRepository
                .findTop10ByRoleOrderByCreatedAtDesc("ADMIN")
                .stream()
                .map(n -> ActivityItemDto.builder()
                        .type(n.getType())
                        .message(n.getMessage())
                        .timestamp(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminActivityDto.builder()
                .totalUsers(totalUsers)
                .totalEvents(totalEvents)
                .approvedEvents(approvedEvents)
                .registrations(totalRegistrations)
                .newUsersToday(newUsersToday)
                .newEventsToday(newEventsToday)
                .pendingApprovals(pendingApprovals)
                .approvedToday(approvedToday)
                .activeStudents(activeStudents)
                .activeCoordinators(activeCoordinators)
                .certificatesIssuedToday(certificatesIssuedToday)
                .recentActivities(recentActivities)
                .build();
    }
}
