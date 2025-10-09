package com.codecampus.service;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.model.Activity;
import com.codecampus.model.Course;
import com.codecampus.model.StudentActivity;
import com.codecampus.model.User;
import com.codecampus.repository.ActivityRepository;
import com.codecampus.repository.CourseRepository;
import com.codecampus.repository.StudentActivityRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ActivityService {

    @Autowired
    private ActivityRepository activityRepository;

    @Autowired
    private StudentActivityRepository studentActivityRepository;

    @Autowired
    private CourseRepository courseRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesForStudent(Long courseId, String username) {
        if (courseId == null || username == null)
            throw new IllegalArgumentException("Course ID and username must not be null");

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<Activity> activities = activityRepository.findByCourseOrderByDifficultyAsc(course);

        Map<Long, Boolean> completedMap = studentActivityRepository.findByStudent(student).stream()
                .collect(Collectors.toMap(sa -> sa.getActivity().getId(), StudentActivity::isCompleted));

        List<ActivityDTO> dtos = new ArrayList<>();
        boolean previousCompleted = true; // first activity always unlocked

        for (Activity activity : activities) {
            boolean completed = completedMap.getOrDefault(activity.getId(), false);
            boolean unlocked = previousCompleted;

            ActivityDTO dto = new ActivityDTO();
            dto.setCourseId(courseId);
            dto.setTitle(activity.getTitle());
            dto.setProblemStatement(activity.getProblemStatement());
            dto.setDifficulty(activity.getDifficulty());
            dto.setTestCases(activity.getTestCases());
            dto.setCompleted(completed);
            dto.setUnlocked(unlocked);
            dto.setId(activity.getId());

            dtos.add(dto);
            previousCompleted = completed;
        }

        return dtos;
    }
}
