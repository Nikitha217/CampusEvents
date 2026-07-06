package com.campusevents.repository;

import com.campusevents.entity.Certificate;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends MongoRepository<Certificate, String> {

    List<Certificate> findByStudentId(String studentId);

    Optional<Certificate> findFirstByStudentIdAndEventId(String studentId, String eventId);

    long countByIssuedDateGreaterThanEqual(java.time.LocalDateTime date);
}
