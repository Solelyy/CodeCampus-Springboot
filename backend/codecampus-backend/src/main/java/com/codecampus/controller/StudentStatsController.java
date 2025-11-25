package com.codecampus.controller;

import com.codecampus.dto.StudentStatsDTO;
import com.codecampus.model.User;
import com.codecampus.service.StudentStatsService;
import com.codecampus.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/stats")
public class StudentStatsController {

    private final StudentStatsService studentStatsService;
    private final UserService userService;

    public StudentStatsController(StudentStatsService studentStatsService, UserService userService) {
        this.studentStatsService = studentStatsService;
        this.userService = userService;
    }

    @PreAuthorize("permitAll()")
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
}
