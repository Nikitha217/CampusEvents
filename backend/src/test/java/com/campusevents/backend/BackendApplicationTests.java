package com.campusevents.backend;

import com.campusevents.events.EventRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
class BackendApplicationTests {

    @Autowired
    private EventRepository eventRepository;

    @Test
    void testMongoAggregation() {
        try {
            System.out.println("=== TESTING countByCategory ===");
            List<EventRepository.CategoryCountResult> results = eventRepository.countByCategory();
            System.out.println("Results size: " + results.size());
            for (EventRepository.CategoryCountResult r : results) {
                System.out.println("Category ID/Name (get_id): " + r.get_id());
                System.out.println("Count: " + r.getCount());
            }
        } catch (Exception e) {
            System.err.println("=== ERROR in countByCategory ===");
            e.printStackTrace();
        }
    }
}
