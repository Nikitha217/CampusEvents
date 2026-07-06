package com.campusevents.service;

import com.campusevents.entity.Notification;
import com.campusevents.repository.NotificationRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository repository;

    public Notification create(
            String userId,
            String role,
            String title,
            String message,
            String type,
            String referenceId
    ) {
        Notification notification =
                Notification.builder()
                        .userId(userId)
                        .role(role)
                        .title(title)
                        .message(message)
                        .type(type)
                        .referenceId(referenceId)
                        .read(false)
                        .createdAt(LocalDateTime.now())
                        .build();

        return repository.save(notification);
    }

    public List<Notification> getNotifications(
            String userId,
            String role
    ) {
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            return repository.findByRoleOrderByCreatedAtDesc("ADMIN");
        }

        if (userId != null && !userId.isBlank()) {
            return repository.findByUserIdOrderByCreatedAtDesc(userId);
        }

        return new ArrayList<>();
    }

    public long unreadCount(
            String userId,
            String role
    ) {
        if (role != null && role.equalsIgnoreCase("ADMIN")) {
            return repository.countByRoleAndReadFalse("ADMIN");
        }

        if (userId != null && !userId.isBlank()) {
            return repository.countByUserIdAndReadFalse(userId);
        }

        return 0;
    }

    public Notification markRead(String id) {
        Notification notification =
                repository.findById(id)
                        .orElseThrow(() ->
                                new RuntimeException("Notification not found")
                        );

        notification.setRead(true);

        return repository.save(notification);
    }
}