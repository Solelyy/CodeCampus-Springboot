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
            Principal principal) {

        try {
            //Log submission payload for visibility
            System.out.println("\n=== Incoming Pre-Assessment Submission ===");
            System.out.println("Course ID: " + submission.getCourseId());
            if (submission.getAnswers() != null) {
                submission.getAnswers().forEach(a ->
                        System.out.println("Answer → QID: " + a.getQuestionId() + " | Ans: " + a.getAnswer()));
            } else {
                System.out.println("No answers received.");
            }
            System.out.println("==========================================\n");

            //Fetch the student entity
            User student = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new IllegalAccessException("Student not found"));

            //Call the service
            PreAssessmentResultDTO result = preAssessmentService.submitAssessment(submission, student.getId());

            return ResponseEntity.ok(result);

        } catch (IllegalAccessException e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            System.err.println("❌ ERROR while submitting assessment:");
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Failed to submit assessment"));
        }
    }

    @GetMapping("/status/{courseId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> checkPreAssessmentStatus(@PathVariable Long courseId, Principal principal) {
        try {
            User student = userRepository.findByUsername(principal.getName())
                    .orElseThrow(() -> new IllegalAccessException("Student not found"));

            boolean completed = preAssessmentService.hasCompletedPreAssessment(student.getId(), courseId);

            return ResponseEntity.ok(Map.of("completed", completed));

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("message", "Error checking pre-assessment status"));
        }
    }
}
