package com.campusevents.service;

import com.campusevents.entity.AuditLog;
import com.campusevents.repository.AuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final AuditLogRepository repository;

    public AuditLog createLog(
            String action,
            String userName,
            String role,
            String referenceId
    ) {

        AuditLog log =
                AuditLog.builder()
                        .action(action)
                        .userName(userName)
                        .role(role)
                        .referenceId(referenceId)
                        .timestamp(LocalDateTime.now())
                        .build();

        return repository.save(log);
    }

    public List<AuditLog> getAllLogs() {

        return repository
                .findAllByOrderByTimestampDesc();
    }
}