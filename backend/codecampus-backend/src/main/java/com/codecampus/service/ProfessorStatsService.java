
package com.codecampus.service;

import com.codecampus.dto.ProfessorStatsDTO;
import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.repository.ActivityRepository;
import com.codecampus.repository.CourseEnrollmentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProfessorStatsService {

    private final CourseService courseService;
    private final ActivityRepository activityRepo;
    private final CourseEnrollmentRepository enrollmentRepo;

    public ProfessorStatsService(CourseService courseService,
                                 ActivityRepository activityRepo,
                                 CourseEnrollmentRepository enrollmentRepo) {
        this.courseService = courseService;
        this.activityRepo = activityRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    /**
     * Computes statistics for a professor:
     * - Total courses created
     * - Total students enrolled across all courses
     * - Total activities posted across all courses
     * - Achievements (simple placeholder logic)
     *
     * @param professor the logged-in professor
     * @return ProfessorStatsDTO with stats
     */
    public ProfessorStatsDTO getProfessorStats(User professor) {
        // 1. Get all courses created by this professor
        List<Course> courses = courseService.getCoursesByProfessor(professor);
        long totalCoursesCreated = courses.size();

        // 2. Total students across all courses
        long totalStudents = courses.stream()
                .mapToLong(course -> enrollmentRepo.countByCourse(course))
                .sum();

        // 3. Total activities across all courses
        long totalActivities = courses.stream()
                .mapToLong(course -> activityRepo.findByCourseId(course.getId()).size())
                .sum();

        // 4. Compute simple achievements
        long achievements = 0;
        if (totalCoursesCreated > 0) achievements++;  // First course created
        if (totalStudents > 0) achievements++;       // First student enrolled
        if (totalActivities > 0) achievements++;     // First activity posted

        // 5. Return DTO
        return new ProfessorStatsDTO(totalCoursesCreated, totalStudents, totalActivities, achievements);
    }
}

