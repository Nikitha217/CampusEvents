package com.campusevents.repository;

import com.campusevents.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NotificationRepository
        extends MongoRepository<Notification, String> {

    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Notification> findByRoleOrderByCreatedAtDesc(String role);

    long countByUserIdAndReadFalse(String userId);

    long countByRoleAndReadFalse(String role);

    long countByTitleAndCreatedAtGreaterThanEqual(String title, java.time.LocalDateTime date);

    List<Notification> findTop10ByRoleOrderByCreatedAtDesc(String role);
}