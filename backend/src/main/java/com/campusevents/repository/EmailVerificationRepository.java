package com.campusevents.repository;

import com.campusevents.entity.EmailVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

public interface EmailVerificationRepository extends JpaRepository<EmailVerification, Long> {

    Optional<EmailVerification> findByEmail(String email);

    boolean existsByEmail(String email);

    void deleteByEmail(String email);

    /** Cleanup expired, unverified records (scheduled or on-demand) */
    @Modifying
    @Transactional
    @Query("DELETE FROM EmailVerification ev WHERE ev.expiryTime < :now AND ev.verified = false")
    void deleteExpiredRecords(LocalDateTime now);
}
