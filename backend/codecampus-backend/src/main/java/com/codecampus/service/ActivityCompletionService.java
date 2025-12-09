package com.codecampus.service;

import com.codecampus.dto.ActivityCompletionDTO;
import com.codecampus.model.Activity;
import com.codecampus.repository.ActivityRepository;
import com.codecampus.repository.CourseEnrollmentRepository;
import com.codecampus.repository.StudentActivityRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

@Service
@AllArgsConstructor
public class ActivityCompletionService {
    private final StudentActivityRepository studentActivityRepository;
    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final ActivityRepository activityRepository;

    public List<ActivityCompletionDTO> getActivityCompletionByCourse(long courseId) {

        List<ActivityCompletionDTO> activityCompletions = new ArrayList<>();

        // Step 1. Get all activities in a course
        List<Activity> activities = activityRepository.findByCourseId(courseId);
        if (activities.isEmpty()) return Collections.emptyList();

        // Step 2. Get count of total students enrolled in a course
        int totalStudents = courseEnrollmentRepository.countByCourseId(courseId);

        // Step 3. For each activity count how many completed it
        for (Activity activity : activities) {
            int completedBy = studentActivityRepository.countByActivityIdAndCompletedTrue(activity.getId());
            double progressRate = totalStudents == 0 ? 0 : (completedBy * 100.0) / totalStudents;

            ActivityCompletionDTO dto = new ActivityCompletionDTO(
                    activity.getId(),
                    activity.getTitle(),
                    completedBy,
                    totalStudents,
                    progressRate
            );

            activityCompletions.add(dto);
        }

        // Sort activities by completedBy descending
        activityCompletions.sort(Comparator.comparingInt(ActivityCompletionDTO::getCompletedBy).reversed());

        return activityCompletions;
    }
}