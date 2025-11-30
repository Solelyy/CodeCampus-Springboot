package com.codecampus.controller;

import com.codecampus.dto.SubmitActivityRequestDTO;
import com.codecampus.dto.SubmitActivityResponseDTO;
import com.codecampus.model.StudentActivity;
import com.codecampus.service.StudentActivityService;
import com.codecampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/student/activities")
@CrossOrigin(origins = "http://localhost:5500")
public class StudentActivityController {

    @Autowired
    private StudentActivityService studentActivityService;

    @Autowired
    private UserService userService;

    /**
     * Submit activity code.
     * Only passes if all test cases pass.
     * JWT used to identify student (username from token).
     */
    @PostMapping("/submit")
    public ResponseEntity<SubmitActivityResponseDTO> submitActivity(
            @RequestBody SubmitActivityRequestDTO request,
            Authentication authentication // JWT principal
    ) {
        String username = authentication.getName(); // extract username from JWT
        SubmitActivityResponseDTO response = studentActivityService.submitActivity(username, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Fetch student's submission for an activity.
     * Returns submitted code, output, points, and feedback if already submitted.
     */
    @GetMapping("/{activityId}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long activityId,
            Authentication authentication // JWT principal
    ) {
        String username = authentication.getName();
        StudentActivity submission = studentActivityService.getSubmissionForActivity(username, activityId);

        if (submission == null) {
            return ResponseEntity.ok().body(Map.of(
                    "submitted", false
            ));
        }

        // Build JSON with submission details
        Map<String, Object> response = Map.of(
                "submitted", true,
                "code", submission.getCode(),
                "output", submission.getOutput(),
                "earnedPoints", submission.getEarnedPoints(),
                "feedback", submission.isCompleted()
                        ? "You have already passed this activity!"
                        : "You have already submitted this activity."
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/evaluate")
    public ResponseEntity<SubmitActivityResponseDTO> evaluateActivity(
            @RequestBody SubmitActivityRequestDTO request,
            Authentication authentication
    ) {
        String username = authentication.getName();
        SubmitActivityResponseDTO result = studentActivityService.evaluateActivity(username, request);
        return ResponseEntity.status(HttpStatus.OK).body(result);
    }
}
