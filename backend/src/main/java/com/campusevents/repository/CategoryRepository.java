package com.campusevents.repository;

import com.campusevents.entity.Category;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository
        extends MongoRepository<Category,String> {
}