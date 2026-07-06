package com.campusevents.service;

import com.campusevents.dto.AnalyticsResponse;
import com.campusevents.dto.AnalyticsResponse.MonthlyDataPoint;
import com.campusevents.enums.ERole;
import com.campusevents.events.EventRepository;
import com.campusevents.repository.FeedbackRepository;
import com.campusevents.repository.RegistrationRepository;
import com.campusevents.repository.UserRepository;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * AnalyticsServiceImpl — single source of truth for all platform analytics.
 *
 * ROOT CAUSE FIX:
 *   Previously the AnalyticsController built the response inline and only
 *   populated 6 scalar fields. roleDistribution, categoryStats, monthlyEvents,
 *   and monthlyRegistrations were NEVER set, so the frontend always got nulls
 *   for those fields and the charts never rendered any data.
 *
 *   This implementation queries all four repositories and populates every field
 *   the frontend Analytics.jsx depends on.
 */
@Service
public class AnalyticsServiceImpl implements AnalyticsService {

    private final UserRepository         userRepository;
    private final EventRepository        eventRepository;
    private final RegistrationRepository registrationRepository;
    private final FeedbackRepository     feedbackRepository;

    public AnalyticsServiceImpl(
            UserRepository userRepository,
            EventRepository eventRepository,
            RegistrationRepository registrationRepository,
            FeedbackRepository feedbackRepository) {
        this.userRepository         = userRepository;
        this.eventRepository        = eventRepository;
        this.registrationRepository = registrationRepository;
        this.feedbackRepository     = feedbackRepository;
    }

    @Override
    public AnalyticsResponse getFullAnalytics() {

        AnalyticsResponse data = new AnalyticsResponse();

        // ── 1. Scalar counts ──────────────────────────────────────────────────
        data.setTotalUsers(userRepository.count());
        data.setTotalEvents(eventRepository.count());
        data.setTotalRegistrations(registrationRepository.count());
        data.setTotalCertificates(registrationRepository.countByCertificateIssuedTrue());

        // ── 2. Average rating ─────────────────────────────────────────────────
        double avgRating = 0;
        try {
            List<FeedbackRepository.AverageRatingResult> ratingResult = feedbackRepository.getAverageRating();
            if (!ratingResult.isEmpty() && ratingResult.get(0).getAverageRating() != null) {
                avgRating = ratingResult.get(0).getAverageRating();
            }
        } catch (Exception e) {
            // No feedback yet — keep 0
        }
        data.setAverageRating(Math.round(avgRating * 100.0) / 100.0);

        // ── 3. Attendance rate ────────────────────────────────────────────────
        long present = registrationRepository.countByAttendanceStatus("PRESENT");
        long total   = registrationRepository.count();
        double rate  = total == 0 ? 0 : ((double) present / total) * 100;
        data.setAttendanceRate(Math.round(rate * 100.0) / 100.0);

        // ── 4. Role distribution ──────────────────────────────────────────────
        // Strips the "ROLE_" prefix so the frontend sees "STUDENT", "ADMIN" etc.
        Map<String, Long> roleMap = new LinkedHashMap<>();
        // Pre-populate with zeroes so all roles always appear
        for (ERole r : ERole.values()) {
            roleMap.put(r.name().replace("ROLE_", ""), 0L);
        }
        try {
            List<Object[]> roleRows = userRepository.countByRole();
            for (Object[] row : roleRows) {
                // row[0] = ERole enum value (e.g. ROLE_STUDENT), row[1] = Long count
                String roleName = row[0].toString().replace("ROLE_", "");
                Long   count    = ((Number) row[1]).longValue();
                roleMap.put(roleName, count);
            }
        } catch (Exception e) {
            // Leave pre-populated zeroes
        }
        data.setRoleDistribution(roleMap);

        // ── 5. Category stats ─────────────────────────────────────────────────
        Map<String, Long> categoryMap = new LinkedHashMap<>();
        try {
            List<EventRepository.CategoryCountResult> catResults = eventRepository.countByCategory();
            for (EventRepository.CategoryCountResult c : catResults) {
                String cat = c.get_id() != null ? c.get_id() : "Uncategorized";
                categoryMap.put(cat, c.getCount());
            }
        } catch (Exception e) {
            // Empty map is fine — chart will show "No data"
        }
        data.setCategoryStats(categoryMap);

        // ── 6. Monthly events trend ───────────────────────────────────────────
        List<MonthlyDataPoint> monthlyEvents = new ArrayList<>();
        try {
            List<EventRepository.MonthlyCountResult> evtMonths = eventRepository.countByMonth();
            for (EventRepository.MonthlyCountResult m : evtMonths) {
                if (m.get_id() != null) {
                    monthlyEvents.add(new MonthlyDataPoint(m.get_id(), m.getCount()));
                }
            }
        } catch (Exception e) {
            // Empty list is fine — chart will be empty
        }
        data.setMonthlyEvents(monthlyEvents);

        // ── 7. Monthly registrations trend ────────────────────────────────────
        List<MonthlyDataPoint> monthlyRegs = new ArrayList<>();
        try {
            List<RegistrationRepository.MonthlyRegistrationResult> regMonths =
                    registrationRepository.countByMonth();
            for (RegistrationRepository.MonthlyRegistrationResult m : regMonths) {
                if (m.get_id() != null) {
                    monthlyRegs.add(new MonthlyDataPoint(m.get_id(), m.getCount()));
                }
            }
        } catch (Exception e) {
            // Empty list is fine
        }
        data.setMonthlyRegistrations(monthlyRegs);

        return data;
    }
}
