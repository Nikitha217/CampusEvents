package com.campusevents.service;

import com.campusevents.entity.Feedback;
import com.campusevents.exception.ResourceNotFoundException;
import com.campusevents.repository.FeedbackRepository;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class FeedbackService {

    private final FeedbackRepository feedbackRepository;
    private final NotificationService notificationService;

    public FeedbackService(
            FeedbackRepository feedbackRepository,
            NotificationService notificationService
    ) {

        this.feedbackRepository =
                feedbackRepository;

        this.notificationService =
                notificationService;
    }

    /* =========================
       CREATE FEEDBACK
    ========================== */

    public Feedback createFeedback(
            Feedback feedback
    ) {

        if (feedback == null) {

            throw new IllegalArgumentException(
                    "Feedback cannot be null"
            );
        }

        if (feedback.getSubmittedAt() == null) {

            feedback.setSubmittedAt(
                    LocalDateTime.now()
            );
        }

        Feedback savedFeedback =
                feedbackRepository.save(
                        feedback
                );

        notificationService.create(
                "COORDINATOR",
                "COORDINATOR",
                "Feedback Received",
                feedback.getStudentName()
                        + " submitted feedback for Event ID: "
                        + feedback.getEventId(),
                "FEEDBACK",
                savedFeedback.getId()
        );

        return savedFeedback;
    }

    /* =========================
       GET ALL FEEDBACK
    ========================== */

    public List<Feedback> getAllFeedback() {

        return feedbackRepository.findAll();
    }

    /* =========================
       GET FEEDBACK BY EVENT
    ========================== */

    public List<Feedback> getFeedbackByEventId(
            String eventId
    ) {

        return feedbackRepository.findByEventId(
                eventId
        );
    }

    /* =========================
       GET FEEDBACK BY STUDENT
    ========================== */

    public List<Feedback> getFeedbackByStudentId(
            String studentId
    ) {

        return feedbackRepository.findByStudentId(
                studentId
        );
    }

    /* =========================
       GET FEEDBACK BY ID
    ========================== */

    public Feedback getFeedbackById(
            String id
    ) {

        return feedbackRepository.findById(id)
                .orElseThrow(() ->

                        new ResourceNotFoundException(
                                "Feedback not found with ID: "
                                        + id
                        )
                );
    }

    /* =========================
       CHECK DUPLICATE FEEDBACK
    ========================== */

    public boolean existsByEventIdAndStudentId(
            String eventId,
            String studentId
    ) {

        return feedbackRepository
                .existsByEventIdAndStudentId(
                        eventId,
                        studentId
                );
    }

    /* =========================
       COUNT FEEDBACK FOR EVENT
    ========================== */

    public long countFeedbackByEventId(
            String eventId
    ) {

        return feedbackRepository
                .countByEventId(
                        eventId
                );
    }

    /* =========================
       DELETE FEEDBACK
    ========================== */

    public void deleteFeedback(
            String id
    ) {

        Feedback feedback =
                getFeedbackById(id);

        feedbackRepository.delete(
                feedback
        );
    }
}