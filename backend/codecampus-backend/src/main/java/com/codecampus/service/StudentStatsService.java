package com.codecampus.service;

import com.codecampus.dto.StudentStatsDTO;
import com.codecampus.model.StudentActivity;
import com.codecampus.model.User;
import com.codecampus.repository.CourseEnrollmentRepository;
import com.codecampus.repository.StudentActivityRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentStatsService {

    private final CourseEnrollmentRepository enrollmentRepo;
    private final StudentActivityRepository activityRepo;
    private final UserRepository userRepository;

    public StudentStatsService(CourseEnrollmentRepository enrollmentRepo,
                               StudentActivityRepository activityRepo,
                               UserRepository userRepository) {
        this.enrollmentRepo = enrollmentRepo;
        this.activityRepo = activityRepo;
        this.userRepository = userRepository;
    }

    public StudentStatsDTO getStudentStats(User student) {

        // --- Total Courses ---
        long totalCourses = enrollmentRepo.countByStudent_Id(student.getId());

        // --- Completed Activities ---
        List<StudentActivity> completedActivitiesList = activityRepo.findByStudent(student).stream()
                .filter(StudentActivity::isCompleted)
                .collect(Collectors.toList());
        long completedActivities = completedActivitiesList.size();

        // --- Day Streak ---
        long streakDays = computeDayStreak(completedActivitiesList);

        // --- Achievements ---
        long totalAchievements = 0;
        if (totalCourses > 0) totalAchievements++;       // first course joined
        if (completedActivities > 0) totalAchievements++; // first activity completed

        return new StudentStatsDTO(totalCourses, completedActivities, totalAchievements, streakDays);
    }

    private long computeDayStreak(List<StudentActivity> completedActivitiesList) {
        if (completedActivitiesList.isEmpty()) return 0;

        Set<LocalDate> completedDates = completedActivitiesList.stream()
                .map(a -> a.getCreatedAt().atZone(ZoneId.systemDefault()).toLocalDate())
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now();
        long streak = 0;
        LocalDate current = today;

        while (completedDates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }
        return streak;
    }

    // ======================= NEW METHOD =======================
    public int getTotalPointsInCourse(String username, Long courseId) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return activityRepo.findByStudent(student).stream()
                .filter(sa -> sa.getActivity().getCourse().getId().equals(courseId))
                .mapToInt(StudentActivity::getEarnedPoints)
                .sum();
    }
}
