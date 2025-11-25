package com.codecampus.controller;

import com.codecampus.dto.ProfessorStatsDTO;
import com.codecampus.model.User;
import com.codecampus.service.ProfessorStatsService;
import com.codecampus.service.UserService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/professor/stats")
public class ProfessorStatsController {

    private final ProfessorStatsService statsService;
    private final UserService userService;

    public ProfessorStatsController(ProfessorStatsService statsService, UserService userService) {
        this.statsService = statsService;
        this.userService = userService;
    }

    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping
    public ProfessorStatsDTO getProfessorStats(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) throw new RuntimeException("User not authenticated");

        User professor = userService.findByUsername(userDetails.getUsername());
        if (professor == null) throw new RuntimeException("Professor not found");

        return statsService.getProfessorStats(professor);
    }
}
