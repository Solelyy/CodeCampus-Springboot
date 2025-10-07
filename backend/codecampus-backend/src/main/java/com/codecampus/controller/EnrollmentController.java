package com.codecampus.controller;

import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.service.CourseService;
import com.codecampus.service.EnrollmentService;
import com.codecampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserService userService;

    public EnrollmentController(EnrollmentService enrollmentService, UserService userService) {
        this.enrollmentService = enrollmentService;
        this.userService = userService;
    }

    // 1. Enroll the logged-in student in a course using code
    @PostMapping("/join/{code}")
    public ResponseEntity<?> joinCourse(@PathVariable String code,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        try {
            User student = userService.findByUsername(userDetails.getUsername());
            enrollmentService.enrollStudent(code, student);

            return ResponseEntity.ok("Successfully enrolled in course: " + code);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // 2. Get all courses the logged-in student is enrolled in
    @GetMapping("/my-courses")
    public ResponseEntity<?> getMyCourses(@AuthenticationPrincipal UserDetails userDetails) {
        User student = userService.findByUsername(userDetails.getUsername());
        List<Course> enrolledCourses = enrollmentService.getStudentCourses(student);
        return ResponseEntity.ok(enrolledCourses);
    }
}
