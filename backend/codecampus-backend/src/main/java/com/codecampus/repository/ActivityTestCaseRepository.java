package com.codecampus.repository;

import com.codecampus.model.ActivityTestCase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ActivityTestCaseRepository extends JpaRepository<ActivityTestCase, Long> {
    List<ActivityTestCase> findByActivityId(Long activityId);
}
