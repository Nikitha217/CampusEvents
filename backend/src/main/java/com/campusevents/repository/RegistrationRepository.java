package com.campusevents.repository;

import com.campusevents.events.Registration;
import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import java.util.List;
import java.util.Optional;

public interface RegistrationRepository extends MongoRepository<Registration, String> {

    List<Registration> findByStudentEmail(String studentEmail);

    List<Registration> findByEventId(String eventId);

    List<Registration> findByStatus(String status);

    List<Registration> findByAttendanceStatus(String attendanceStatus);

    // ── FIX: was missing — used by AnalyticsController ───────────────────
    long countByCertificateIssuedTrue();

    // ── FIX: was missing — used by CertificateService ────────────────────
    // Note: first param is studentId (not studentEmail) based on CertificateService call
    Optional<Registration> findByStudentIdAndEventId(String studentId, String eventId);

    // Also support lookup by email+eventId (used in some flows)
    Optional<Registration> findByStudentEmailAndEventId(String studentEmail, String eventId);

    // ── QR code lookup (Feature 8) ────────────────────────────────────────
    Optional<Registration> findByQrCode(String qrCode);

    // ── Count queries (dashboard optimisation) ────────────────────────────
    long countByAttendanceStatus(String attendanceStatus);

    long countByStatus(String status);

    long countByEventIdAndAttendanceStatus(String eventId, String attendanceStatus);

    long countByEventIdAndStatus(String eventId, String status);

    // ── Bulk lookups by event list (coordinator reports) ──────────────────
    List<Registration> findByEventIdIn(List<String> eventIds);

    long countByEventIdIn(List<String> eventIds);

    @Query(value = "{ 'eventId': { $in: ?0 }, 'status': { $in: ['PENDING', 'APPROVED'] } }", count = true)
    long countValidRegistrationsByEventIds(List<String> eventIds);

    @Query(value = "{ 'eventId': { $in: ?0 }, 'attendanceStatus': 'PRESENT' }", count = true)
    long countPresentByEventIds(List<String> eventIds);

    /**
     * Groups registrations by year-month (extracted from _id ObjectId creation time).
     * Returns monthly registration trend for the analytics chart.
     * We use $dateToString on the ObjectId-derived date.
     */
    @Aggregation(pipeline = {
        "{ $group: { _id: { $dateToString: { format: '%Y-%m', date: { $toDate: '$_id' } } }, count: { $sum: 1 } } }",
        "{ $sort: { _id: 1 } }",
        "{ $limit: 12 }"
    })
    List<MonthlyRegistrationResult> countByMonth();

    class MonthlyRegistrationResult {
        private String _id;
        private long count;

        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}