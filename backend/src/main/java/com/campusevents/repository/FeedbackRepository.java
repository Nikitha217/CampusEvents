package com.campusevents.repository;

import com.campusevents.entity.Feedback;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface FeedbackRepository
        extends MongoRepository<Feedback, String> {

    /* =========================
       GET FEEDBACK BY EVENT
    ========================== */
    List<Feedback> findByEventId(
            String eventId
    );

    /* =========================
       CHECK DUPLICATE FEEDBACK
       SAME STUDENT + SAME EVENT
    ========================== */
    boolean existsByEventIdAndStudentId(
            String eventId,
            String studentId
    );

    /* =========================
       GET FEEDBACK BY STUDENT
    ========================== */
    List<Feedback> findByStudentId(
            String studentId
    );

    /* =========================
       COUNT FEEDBACK FOR EVENT
    ========================== */
    long countByEventId(
            String eventId
    );

    /* =========================
       AVERAGE RATING
       FOR ANALYTICS
    ========================== */
    @Aggregation(pipeline = {
            "{ $group: { _id: null, averageRating: { $avg: '$rating' } } }"
    })
    List<AverageRatingResult> getAverageRating();

    class AverageRatingResult {
        private Double averageRating;

        public Double getAverageRating() { return averageRating; }
        public void setAverageRating(Double averageRating) { this.averageRating = averageRating; }
    }
}