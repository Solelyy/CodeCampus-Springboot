package com.codecampus.controller;

import com.codecampus.dto.*;
import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.service.CourseService;
import com.codecampus.service.LeaderboardService;
import com.codecampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@RestController
@RequestMapping("/api/courses")
public class CourseController {
    private static final Logger logger = LoggerFactory.getLogger(CourseController.class);

    private final CourseService courseService;
    private final UserService userService;
    @Autowired
    private LeaderboardService leaderboardService;

    public CourseController(CourseService courseService, UserService userService) {
        this.courseService = courseService;
        this.userService = userService;
    }

    // LEGACY: Simple course creation
    @PostMapping
    @Deprecated
    public ResponseEntity<CourseDTO> createCourseLegacy(@RequestBody Course course,
                                                        @AuthenticationPrincipal UserDetails userDetails) {
        User professor = userService.findByUsername(userDetails.getUsername());
        Course savedCourse = courseService.createCourse(course, professor);
        return ResponseEntity.ok(courseService.toDTO(savedCourse));
    }

    // Full course creation with activities & pre-assessment
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping("/full")
    public ResponseEntity<?> createFullCourse(@RequestBody CourseCreationRequest courseRequest,
                                              @AuthenticationPrincipal UserDetails userDetails) {
        try {
            if (userDetails == null) {
                logger.warn("User not authenticated.");
                return ResponseEntity.status(401).body("User not authenticated");
            }

            logger.info("Creating course attempt by user: {}", userDetails.getUsername());
            User professor = userService.findByUsername(userDetails.getUsername());
            if (professor == null) {
                logger.warn("Professor not found: {}", userDetails.getUsername());
                return ResponseEntity.status(404).body("Professor not found");
            }

            // Validate activities
            if (courseRequest.getActivities() != null) {
                for (ActivityDTO aDto : courseRequest.getActivities()) {
                    if (aDto.getDifficulty() == null ||
                            (!aDto.getDifficulty().equalsIgnoreCase("easy") &&
                                    !aDto.getDifficulty().equalsIgnoreCase("medium") &&
                                    !aDto.getDifficulty().equalsIgnoreCase("hard"))) {
                        return ResponseEntity.badRequest()
                                .body("Invalid activity difficulty for: " + aDto.getTitle());
                    }
                }
            }

            Course savedCourse = courseService.createCourseWithDetails(courseRequest, professor);
            return ResponseEntity.status(201).body(courseService.toDTO(savedCourse));

        } catch (Exception e) {
            logger.error("Failed to create course: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Failed to create course");
        }
    }

    // Get courses of logged-in professor
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

    // Get all public courses
    @GetMapping("/public")
    public ResponseEntity<List<CourseDTO>> getPublicCourses() {
        List<CourseDTO> dtoList = courseService.getPublicCourses()
                .stream()
                .map(courseService::toDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtoList);
    }

    // Get course by code
    @GetMapping("/code/{code}")
    public ResponseEntity<CourseDTO> getCourseByCode(@PathVariable String code) {
        Course course = courseService.getCourseByCode(code);
        if (course != null) {
            return ResponseEntity.ok(courseService.toDTO(course));
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Get course overview
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}/overview")
    public ResponseEntity<CourseOverviewDTO> getCourseOverview(@PathVariable Long id) {
        Course course = courseService.getCourseById(id);
        if (course == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(courseService.toOverviewDTO(course));
    }

    //Leaderboard
    @GetMapping("/{courseId}/leaderboard")
    public List<LeaderboardDTO> getLeaderboard(@PathVariable Long courseId) {
        return leaderboardService.getLeaderboardForCourse(courseId);
    }
}
