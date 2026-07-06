package com.campusevents.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * Enables @Async (for email sending) and @Scheduled (for OTP cleanup).
 */
@Configuration
@EnableAsync
@EnableScheduling
public class AsyncConfig {
    // Spring Boot auto-configures the thread pool from application.properties
}
