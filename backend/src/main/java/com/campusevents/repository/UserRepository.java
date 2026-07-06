package com.campusevents.repository;

import com.campusevents.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Boolean existsByEmail(String email);

    /**
     * Groups users by role name and returns counts.
     * Used by AnalyticsServiceImpl for role distribution chart.
     *
     * Returns rows of [ERole.name(), count] e.g. ["ROLE_STUDENT", 42L]
     */
    @Query("SELECT r.name, COUNT(u) FROM User u JOIN u.roles r GROUP BY r.name")
    List<Object[]> countByRole();
}