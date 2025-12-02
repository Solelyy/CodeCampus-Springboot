package com.codecampus.controller;

import com.codecampus.dto.StudentCourseProgressDTO;
import com.codecampus.dto.StudentStatsDTO;
import com.codecampus.model.User;
import com.codecampus.service.StudentStatsService;
import com.codecampus.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/stats")
public class StudentStatsController {

    private final StudentStatsService studentStatsService;
    private final UserService userService;

    public StudentStatsController(StudentStatsService studentStatsService, UserService userService) {
        this.studentStatsService = studentStatsService;
        this.userService = userService;
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping
    public StudentStatsDTO getStudentStats(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            throw new RuntimeException("User not authenticated");
        }

        User student = userService.findByUsername(userDetails.getUsername());
        if (student == null) {
            throw new RuntimeException("Student not found");
        }

        return studentStatsService.getStudentStats(student);
    }

    @GetMapping("/progress")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<StudentCourseProgressDTO>> getStudentProgress(Principal principal) {
        User student = userService.findByUsername(principal.getName());

        List<StudentCourseProgressDTO> progressList = studentStatsService.getStudentProgress(student);
        return ResponseEntity.ok(progressList);
    }
}
