package com.codecampus.controller;

import com.codecampus.dto.PreAssessmentResultDTO;
import com.codecampus.dto.PreAssessmentSubmissionDTO;
import com.codecampus.model.User;
import com.codecampus.repository.UserRepository;
import com.codecampus.service.PreAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.Map;

@RestController
@RequestMapping("/api/student/pre-assessment")
public class StudentPreAssessmentController {

    @Autowired
    private PreAssessmentService preAssessmentService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/submit")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> submitAssessment(
            @RequestBody PreAssessmentSubmissionDTO submission,
            Principal principal) { // Use Principal instead of UserDetailsImpl

        try {
            // Fetch the student from the database using the username (assumes username is unique)
            User student = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new IllegalAccessException("Student not found"));

            // Call the service with the student ID
            PreAssessmentResultDTO result = preAssessmentService.submitAssessment(submission, student.getId());

            return ResponseEntity.ok(result);
        } catch (IllegalAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace(); // Optional: log for debugging
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit assessment"));
        }
    }
}
