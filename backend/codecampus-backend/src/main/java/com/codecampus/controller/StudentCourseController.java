package com.codecampus.controller;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.dto.LeaderboardDTO;
import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.service.ActivityService;
import com.codecampus.service.EnrollmentService;
import com.codecampus.service.LeaderboardService;
import com.codecampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/courses")
public class StudentCourseController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private EnrollmentService enrollmentService;

    @Autowired
    private UserService userService;

    @Autowired
    private LeaderboardService leaderboardService;

    @GetMapping("/{courseId}/activities")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getActivities(@PathVariable Long courseId, Principal principal) {
        try {
            User student = userService.findByUsername(principal.getName());
            Course course = enrollmentService.getCourseById(courseId);

            // Check if student is actively enrolled
            if (!enrollmentService.isStudentActiveInCourse(course, student)) {
                return ResponseEntity.status(403).body("You are not enrolled in this course.");
            }

            List<ActivityDTO> activities = activityService.getActivitiesForStudent(courseId, principal.getName());
            return ResponseEntity.ok(activities);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
