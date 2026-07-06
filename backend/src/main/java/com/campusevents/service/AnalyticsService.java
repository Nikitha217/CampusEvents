package com.campusevents.service;

import com.campusevents.dto.AnalyticsResponse;

/**
 * Service interface for platform analytics.
 */
public interface AnalyticsService {

    /** Returns the full analytics payload for the admin dashboard. */
    AnalyticsResponse getFullAnalytics();
}
