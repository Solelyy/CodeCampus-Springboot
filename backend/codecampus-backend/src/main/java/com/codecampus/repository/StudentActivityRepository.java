package com.codecampus.repository;

import com.codecampus.model.StudentActivity;
import com.codecampus.model.User;
import com.codecampus.model.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentActivityRepository extends JpaRepository<StudentActivity, Long> {
    List<StudentActivity> findByStudent(User student);
    Optional<StudentActivity> findByStudentAndActivity(User student, Activity activity);

    // Completed activities for a student among a list of activities
    List<StudentActivity> findByStudentAndActivityInAndCompletedTrue(User student, List<Activity> activities);
}
