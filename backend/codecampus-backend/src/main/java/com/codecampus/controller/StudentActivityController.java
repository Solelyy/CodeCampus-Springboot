package com.codecampus.controller;

import com.codecampus.dto.ActivityResultDTO;
import com.codecampus.dto.SubmitActivityRequestDTO;
import com.codecampus.dto.SubmitActivityResponseDTO;
import com.codecampus.model.Activity;
import com.codecampus.model.StudentActivity;
import com.codecampus.service.ActivityService;
import com.codecampus.service.StudentActivityService;
import com.codecampus.service.StudentStatsService;
import com.codecampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/student/activities")
@CrossOrigin(origins = "http://localhost:5500")
public class StudentActivityController {

    @Autowired
    private StudentActivityService studentActivityService;

    @Autowired
    private UserService userService;

    @Autowired
    private ActivityService activityService;

    @Autowired
    private StudentStatsService studentStatsService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/submit")
    public ResponseEntity<Map<String, Object>> submitActivity(
            @RequestBody SubmitActivityRequestDTO request,
            Authentication authentication
    ) {
        String username = authentication.getName();

        // Submit and get result
        SubmitActivityResponseDTO response = studentActivityService.submitActivity(username, request);

        // Fetch student activity to check completion and next unlocked activity
        StudentActivity studentActivity = studentActivityService.getSubmissionForActivity(username, request.getActivityId());
        Long unlockedNextActivityId = null;

        if (studentActivity.isCompleted()) {
            // Determine next unlocked activity for this student
            unlockedNextActivityId = studentActivityService.getNextUnlockedActivityId(
                    username, studentActivity.getActivity().getCourse().getId(), studentActivity.getActivity().getId()
            );
        }

        Map<String, Object> result = new HashMap<>();
        result.put("completed", studentActivity.isCompleted());
        result.put("earnedPoints", studentActivity.getEarnedPoints());
        result.put("feedback", response.getFeedback());
        result.put("testCaseResults", response.getTestCaseResults()); // can be null
        result.put("nextActivityId", unlockedNextActivityId); // can be null


        return ResponseEntity.ok(result);
    }

    /**
     * Fetch student's submission for an activity.
     * Returns submitted code, output, points, and feedback if already submitted.
     */
    @GetMapping("/{activityId}")
    public ResponseEntity<?> getSubmission(
            @PathVariable Long activityId,
            Authentication authentication
    ) {
        String username = authentication.getName();

        StudentActivity submission = studentActivityService.getSubmissionForActivity(username, activityId);

        // No submission yet
        if (submission == null || submission.getCode() == null) {
            Map<String, Object> response = new HashMap<>();
            response.put("submitted", false);
            response.put("completed", false);
            response.put("code", "");
            response.put("output", "");
            response.put("earnedPoints", 0);
            response.put("feedback", null);
            return ResponseEntity.ok(response);
        }

        // Submission exists
        boolean completed = submission.isCompleted();

        Map<String, Object> response = new HashMap<>();
        response.put("submitted", true);
        response.put("completed", completed);
        response.put("code", submission.getCode());
        response.put("output", submission.getOutput() != null ? submission.getOutput() : "");
        response.put("earnedPoints", submission.getEarnedPoints());
        response.put("feedback", completed
                ? "You have already passed this activity!"
                : "You have submitted this activity but can still edit.");

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

    @GetMapping("/{activityId}/result")
    public ResponseEntity<ActivityResultDTO> getActivityResult(
            @PathVariable Long activityId,
            Authentication authentication
    ) {
        String username = authentication.getName();

        // Get student's submission
        StudentActivity submission = studentActivityService.getSubmissionForActivity(username, activityId);
        if (submission == null || !submission.isCompleted()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        Activity activity = submission.getActivity();
        int totalPoints = studentStatsService.getTotalPointsInCourse(username, activity.getCourse().getId());

        // Find next activity
        Long nextActivityId = activityService.getNextActivityId(activity.getCourse().getId(), activityId);

        ActivityResultDTO result = new ActivityResultDTO();
        result.setActivityId(activityId);
        result.setActivityTitle(activity.getTitle());
        result.setEarnedPoints(submission.getEarnedPoints());
        result.setTotalPointsInCourse(totalPoints);
        result.setNextActivityId(nextActivityId);
        result.setCourseId(activity.getCourse().getId());

        return ResponseEntity.ok(result);
    }

}
