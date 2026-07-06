package com.campusevents.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    private String userId;

    private String role;

    private String title;

    private String message;

    private String type;

    private boolean read;

    private String referenceId;

    private LocalDateTime createdAt;
}