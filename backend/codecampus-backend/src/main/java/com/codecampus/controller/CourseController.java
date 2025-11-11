package com.codecampus.controller;

import com.codecampus.dto.CourseCreationRequest;
import com.codecampus.dto.CourseDTO;
import com.codecampus.dto.CourseOverviewDTO;
import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.service.CourseService;
import com.codecampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/courses")

public class CourseController {
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class.getName());

    private final CourseService courseService;
    private final UserService userService;

    public CourseController(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    // --- 1. Create a new course ---
    @PostMapping
    public ResponseEntity<CourseDTO> createCourse(@RequestBody Course course,
                                                  @AuthenticationPrincipal UserDetails userDetails) {
        User professor = userService.findByUsername(userDetails.getUsername());
        Course savedCourse = courseService.createCourse(course, professor);
        return ResponseEntity.ok(courseService.toDTO(savedCourse));
    }

    // --- 2. Get all courses of logged-in professor ---
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/my-courses")
    public ResponseEntity<List<CourseDTO>> getMyCourses(@AuthenticationPrincipal UserDetails userDetails) {
        User professor = userService.findByUsername(userDetails.getUsername());
        List<CourseDTO> dtoList = courseService.getCoursesByProfessor(professor)
                .stream()
                .map(courseService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    // --- 3. Get all public courses ---
    @GetMapping("/public")
    public ResponseEntity<List<CourseDTO>> getPublicCourses() {
        List<CourseDTO> dtoList = courseService.getPublicCourses()
                .stream()
                .map(courseService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    // --- 4. Get course by code ---
    @GetMapping("/code/{code}")
    public ResponseEntity<CourseDTO> getCourseByCode(@PathVariable String code) {
        Course course = courseService.getCourseByCode(code);
        if (course != null) {
            return ResponseEntity.ok(courseService.toDTO(course));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // New endpoint for course creation with activities & pre-assessment
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/full")
    public ResponseEntity<?> createFullCourse(
            @RequestBody CourseCreationRequest courseRequest,
            @AuthenticationPrincipal UserDetails userDetails) {

        try {
            if (userDetails == null) {
                logger.warn("UserDetails is null. User not authenticated.");
                return ResponseEntity.status(401).body("User not authenticated");
            }

            logger.info("Creating course attempt by user: " + userDetails.getUsername());
            logger.info("CourseCreationRequest received: " + courseRequest);

            // Find professor
            User professor = userService.findByUsername(userDetails.getUsername());
            if (professor == null) {
                logger.warn("Professor not found in DB for username: " + userDetails.getUsername());
                return ResponseEntity.status(404).body("Professor not found");
            }

            logger.info("Professor found: " + professor.getUsername());

            // Attempt to create course
            Course savedCourse = courseService.createCourseWithDetails(courseRequest, professor);
            logger.info("Course created successfully with ID: " + savedCourse.getId());

            // Convert to DTO for response
            return ResponseEntity.ok(courseService.toDTO(savedCourse));

        } catch (Exception e) {
            logger.error("Failed to create course: " + e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to create course");
        }
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/overview")
    public ResponseEntity<CourseOverviewDTO> getCourseOverview(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        if (course == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(courseService.toOverviewDTO(course));
    }
}
