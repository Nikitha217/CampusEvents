package com.campusevents.dto;

import java.util.List;
import java.util.Map;

/**
 * Full analytics DTO — includes all fields the frontend Analytics.jsx expects.
 *
 * Fields added in this fix:
 *   - roleDistribution    : Map<String, Long>  (e.g. {"STUDENT": 50, "ADMIN": 1})
 *   - categoryStats       : Map<String, Long>  (e.g. {"Technical": 12, "Cultural": 5})
 *   - monthlyEvents       : List<MonthlyDataPoint>
 *   - monthlyRegistrations: List<MonthlyDataPoint>
 */
public class AnalyticsResponse {

    // ── Scalar stats ─────────────────────────────────────────────────────────
    private long   totalUsers;
    private long   totalEvents;
    private long   totalRegistrations;
    private long   totalCertificates;
    private double averageRating;
    private double attendanceRate;

    // ── Distribution maps ─────────────────────────────────────────────────────
    private Map<String, Long> roleDistribution;
    private Map<String, Long> categoryStats;

    // ── Trend arrays ──────────────────────────────────────────────────────────
    private List<MonthlyDataPoint> monthlyEvents;
    private List<MonthlyDataPoint> monthlyRegistrations;

    // ── Inner DTO ─────────────────────────────────────────────────────────────
    public static class MonthlyDataPoint {
        private String month;
        private long   count;

        public MonthlyDataPoint() {}
        public MonthlyDataPoint(String month, long count) {
            this.month = month;
            this.count = count;
        }

        public String getMonth() { return month; }
        public void   setMonth(String month) { this.month = month; }
        public long   getCount() { return count; }
        public void   setCount(long count) { this.count = count; }
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalEvents() { return totalEvents; }
    public void setTotalEvents(long totalEvents) { this.totalEvents = totalEvents; }

    public long getTotalRegistrations() { return totalRegistrations; }
    public void setTotalRegistrations(long totalRegistrations) { this.totalRegistrations = totalRegistrations; }

    public long getTotalCertificates() { return totalCertificates; }
    public void setTotalCertificates(long totalCertificates) { this.totalCertificates = totalCertificates; }

    public double getAverageRating() { return averageRating; }
    public void setAverageRating(double averageRating) { this.averageRating = averageRating; }

    public double getAttendanceRate() { return attendanceRate; }
    public void setAttendanceRate(double attendanceRate) { this.attendanceRate = attendanceRate; }

    public Map<String, Long> getRoleDistribution() { return roleDistribution; }
    public void setRoleDistribution(Map<String, Long> roleDistribution) { this.roleDistribution = roleDistribution; }

    public Map<String, Long> getCategoryStats() { return categoryStats; }
    public void setCategoryStats(Map<String, Long> categoryStats) { this.categoryStats = categoryStats; }

    public List<MonthlyDataPoint> getMonthlyEvents() { return monthlyEvents; }
    public void setMonthlyEvents(List<MonthlyDataPoint> monthlyEvents) { this.monthlyEvents = monthlyEvents; }

    public List<MonthlyDataPoint> getMonthlyRegistrations() { return monthlyRegistrations; }
    public void setMonthlyRegistrations(List<MonthlyDataPoint> monthlyRegistrations) { this.monthlyRegistrations = monthlyRegistrations; }
}