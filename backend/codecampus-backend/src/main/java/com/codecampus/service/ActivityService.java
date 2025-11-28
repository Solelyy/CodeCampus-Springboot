package com.codecampus.service;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.dto.ActivityTestCaseDTO;
import com.codecampus.model.Activity;
import com.codecampus.model.ActivityTestCase;
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

    // ===================== STUDENT VIEW =====================
    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesForStudent(Long courseId, String username) {
        if (courseId == null || username == null)
            throw new IllegalArgumentException("Course ID and username must not be null");

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<Activity> activities = activityRepository.findByCourseId(courseId);

        // Sort by difficulty
        Map<String, Integer> difficultyOrder = Map.of(
                "easy", 1, "medium", 2, "hard", 3
        );
        activities.sort(Comparator.comparingInt(a -> difficultyOrder.getOrDefault(a.getDifficulty().toLowerCase(), 4)));

        // Completed/unlocked logic
        Map<Long, Boolean> completedMap = studentActivityRepository.findByStudent(student).stream()
                .collect(Collectors.toMap(sa -> sa.getActivity().getId(), StudentActivity::isCompleted));

        List<ActivityDTO> dtos = new ArrayList<>();
        boolean previousCompleted = true;

        for (Activity activity : activities) {
            boolean completed = completedMap.getOrDefault(activity.getId(), false);
            boolean unlocked = previousCompleted;

            ActivityDTO dto = mapActivityToDTO(activity);
            dto.setCompleted(completed);
            dto.setUnlocked(unlocked);
            dtos.add(dto);

            previousCompleted = completed;
        }

        return dtos;
    }

    // ===================== PROFESSOR VIEW =====================
    @Transactional(readOnly = true)
    public List<ActivityDTO> getActivitiesForCourse(Long courseId) {
        List<Activity> activities = activityRepository.findByCourseId(courseId);
        return activities.stream().map(this::mapActivityToDTO).collect(Collectors.toList());
    }

    // ===================== GET SINGLE ACTIVITY =====================
    @Transactional(readOnly = true)
    public ActivityDTO getActivityById(Long id) {
        Activity activity = activityRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        return mapActivityToDTO(activity);
    }

    // ===================== CREATE / UPDATE =====================
    @Transactional
    public ActivityDTO saveActivity(ActivityDTO dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new IllegalArgumentException("Course not found"));

        Activity activity;
        if (dto.getId() != null) {
            activity = activityRepository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Activity not found"));
        } else {
            activity = new Activity();
        }

        activity.setCourse(course);
        activity.setTitle(dto.getTitle());
        activity.setProblemStatement(dto.getProblemStatement());
        activity.setDifficulty(dto.getDifficulty());
        activity.setPoints(dto.getPoints());

        // --- Map test cases ---
        if (dto.getTestCases() != null && !dto.getTestCases().isEmpty()) {
            List<ActivityTestCase> testCases = dto.getTestCases().stream().map(tcDTO -> {
                ActivityTestCase tc = new ActivityTestCase();
                tc.setActivity(activity);
                tc.setInput(tcDTO.getInput());
                tc.setNoInput(tcDTO.isNoInput());
                tc.setExpectedOutput(tcDTO.getExpectedOutput());
                return tc;
            }).collect(Collectors.toList());
            activity.setTestCases(testCases);
        } else {
            activity.setTestCases(new ArrayList<>());
        }

        Activity savedActivity = activityRepository.save(activity);
        return mapActivityToDTO(savedActivity);
    }

    // ===================== DELETE =====================
    @Transactional
    public void deleteActivity(Long id) {
        activityRepository.deleteById(id);
    }

    // ===================== UTILITY MAPPER =====================
    private ActivityDTO mapActivityToDTO(Activity activity) {
        ActivityDTO dto = new ActivityDTO();
        dto.setId(activity.getId());
        dto.setCourseId(activity.getCourse().getId());
        dto.setTitle(activity.getTitle());
        dto.setProblemStatement(activity.getProblemStatement());
        dto.setDifficulty(activity.getDifficulty());
        dto.setPoints(activity.getPoints());

        List<ActivityTestCaseDTO> testCaseDTOs = activity.getTestCases().stream().map(tc -> {
            ActivityTestCaseDTO tcdto = new ActivityTestCaseDTO();
            tcdto.setId(tc.getId());
            tcdto.setInput(tc.getInput());
            tcdto.setNoInput(tc.getNoInput() != null && tc.getNoInput());
            tcdto.setExpectedOutput(tc.getExpectedOutput());
            return tcdto;
        }).collect(Collectors.toList());

        // Use the correct setter
        dto.setTestCases(testCaseDTOs);

        return dto;
    }
}
