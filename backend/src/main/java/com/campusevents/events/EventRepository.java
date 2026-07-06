package com.campusevents.events;

import org.springframework.data.mongodb.repository.Aggregation;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface EventRepository
        extends MongoRepository<Event, String> {

    /* Coordinator Events */
    List<Event> findByCoordinatorEmail(String coordinatorEmail);

    long countByCoordinatorEmail(String coordinatorEmail);

    /* Events By Status */
    List<Event> findByStatusIgnoreCase(String status);

    /* Approved Events */
    List<Event> findByStatus(String status);

    long countByStatus(String status);

    /* Coordinator Events By Status */
    List<Event> findByCoordinatorEmailAndStatus(
            String coordinatorEmail,
            String status
    );

    /* Search Event By Title */
    List<Event> findByTitleContainingIgnoreCase(
            String title
    );

    /* Search Event By Category */
    List<Event> findByCategoryIgnoreCase(
            String category
    );

    List<Event> findByCategoryId(
            String categoryId
    );

    /* Approved + Active Events */
    List<Event> findByStatusIn(
            List<String> statuses
    );

    /**
     * Groups events by category and returns counts.
     * Used by AnalyticsServiceImpl for category distribution chart.
     *
     * Returns: List of CategoryCountResult with category name and count.
     */
    @Aggregation(pipeline = {
        "{ $group: { _id: '$category', count: { $sum: 1 } } }",
        "{ $sort: { count: -1 } }"
    })
    List<CategoryCountResult> countByCategory();

    /**
     * Groups events by year-month of startDate field.
     * startDate is stored as a String like "2025-03-15".
     * We extract "YYYY-MM" via $substr for monthly trend.
     */
    @Aggregation(pipeline = {
        "{ $match: { startDate: { $ne: null } } }",
        "{ $group: { _id: { $substr: ['$startDate', 0, 7] }, count: { $sum: 1 } } }",
        "{ $sort: { _id: 1 } }",
        "{ $limit: 12 }"
    })
    List<MonthlyCountResult> countByMonth();

    class CategoryCountResult {
        private String _id;
        private long count;

        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }

    class MonthlyCountResult {
        private String _id;
        private long count;

        public String get_id() { return _id; }
        public void set_id(String _id) { this._id = _id; }

        public long getCount() { return count; }
        public void setCount(long count) { this.count = count; }
    }
}
