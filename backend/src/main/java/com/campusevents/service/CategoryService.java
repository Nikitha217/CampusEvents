package com.campusevents.service;

import com.campusevents.entity.Category;
import com.campusevents.events.EventRepository;
import com.campusevents.repository.CategoryRepository;

import lombok.RequiredArgsConstructor;

import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository repository;

    private final EventRepository eventRepository;

    public Category create(
            Category category
    ) {

        return repository.save(category);
    }

    public List<Category> getAll() {

        return repository.findAll();
    }

    public void delete(
            String id
    ) {

        repository.deleteById(id);
    }

    public Category update(
            String id,
            Category category
    ) {

        Category existing =
                repository.findById(id)
                        .orElseThrow(
                                () -> new RuntimeException(
                                        "Category not found"
                                )
                        );

        existing.setName(
                category.getName()
        );

        existing.setDescription(
                category.getDescription()
        );

        return repository.save(
                existing
        );
    }

    /*
     * EVENT COUNT
     */

    public long getEventCount(
            String categoryName
    ) {

        return eventRepository
                .findByCategoryIgnoreCase(
                        categoryName
                )
                .size();
    }

    /*
     * CATEGORY STATS
     */

    public Map<String, Long> getCategoryStats() {

        Map<String, Long> stats =
                new HashMap<>();

        List<Category> categories =
                repository.findAll();

        for (Category category : categories) {

            long count =
                    eventRepository
                            .findByCategoryIgnoreCase(
                                    category.getName()
                            )
                            .size();

            stats.put(
                    category.getName(),
                    count
            );
        }

        return stats;
    }
}