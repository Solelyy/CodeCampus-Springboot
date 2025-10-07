package com.codecampus.controller;

import com.codecampus.dto.StudentCourseDTO;
import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.service.EnrollmentService;
import com.codecampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;
    private final UserService userService;

    public EnrollmentController(EnrollmentService enrollmentService, UserService userService) {
        this.enrollmentService = enrollmentService;
        this.userService = userService;
    }

    // Enroll student in a course
    @PostMapping("/courses/{id}/join")
    public ResponseEntity<?> joinCourse(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            User student = userService.findByUsername(userDetails.getUsername());
            Course course = enrollmentService.enrollStudentById(id, student);

            StudentCourseDTO dto = new StudentCourseDTO(
                    course.getId(),
                    course.getTitle(),
                    course.getProfessor().getFullName(),
                    course.getDescription(), // include description
                    enrollmentService.getStudentsCount(course),
                    true // now enrolled
            );

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all courses the logged-in student is enrolled in
    @GetMapping("/enrollments/my-courses")
    public ResponseEntity<List<StudentCourseDTO>> getMyCourses(
            @AuthenticationPrincipal UserDetails userDetails) {

        User student = userService.findByUsername(userDetails.getUsername());
        List<Course> enrolledCourses = enrollmentService.getStudentCourses(student);

        List<StudentCourseDTO> dtoList = enrolledCourses.stream().map(course ->
                new StudentCourseDTO(
                        course.getId(),
                        course.getTitle(),
                        course.getProfessor().getFullName(),
                        course.getDescription(),
                        enrollmentService.getStudentsCount(course),
                        true
                )
        ).collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // Get details of a single course by ID
    @GetMapping("/courses/{id}")
    public ResponseEntity<StudentCourseDTO> getCourseById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            Course course = enrollmentService.getCourseById(id);
            User student = userService.findByUsername(userDetails.getUsername());

            StudentCourseDTO dto = new StudentCourseDTO(
                    course.getId(),
                    course.getTitle(),
                    course.getProfessor().getFullName(),
                    course.getDescription(),
                    enrollmentService.getStudentsCount(course),
                    enrollmentService.isStudentEnrolled(course, student)
            );

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
