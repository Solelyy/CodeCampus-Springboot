package com.codecampus.service;

import com.codecampus.dto.*;
import com.codecampus.model.Activity;
import com.codecampus.model.StudentActivity;
import com.codecampus.model.User;
import com.codecampus.repository.StudentActivityRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;

@Service
public class StudentActivityService {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private StudentActivityRepository studentActivityRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CodeRunnerService codeRunnerService;

    /**
     * Normalize line endings, trim, and avoid nulls.
     */
    private String normalize(String value) {
        return value == null ? "" : value.replace("\r\n", "\n").trim();
    }

    /**
     * Build a standard error response for both evaluate and submit.
     */
    private SubmitActivityResponseDTO buildErrorResponse(String message) {
        SubmitActivityResponseDTO resp = new SubmitActivityResponseDTO();
        resp.setPassedAllTestCases(false);
        resp.setEarnedPoints(0);
        resp.setFeedback(message);
        resp.setTestCaseResults(new ArrayList<>());
        return resp;
    }

    /**
     * Evaluate student's code against activity test cases.
     * Does NOT mark activity as completed.
     */
    @Transactional(readOnly = true)
    public SubmitActivityResponseDTO evaluateActivity(String username, SubmitActivityRequestDTO request) {

        userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        ActivityDTO activityDTO = activityService.getActivityById(request.getActivityId());

        List<TestCaseResultDTO> results = new ArrayList<>();
        boolean allPassed = true;

        for (ActivityTestCaseDTO tc : activityDTO.getTestCases()) {

            String testInput = tc.isNoInput()
                    ? ""
                    : (tc.getInput() != null ? tc.getInput()
                    : (request.getInput() != null ? request.getInput() : ""));

            CodeExecutionResultDTO execResult;
            try {
                execResult = codeRunnerService.runJavaCode(request.getCode(), testInput);
            } catch (Exception e) {
                return buildErrorResponse("Error executing code: " + e.getMessage());
            }

            if (execResult.isCompileError()) {
                return buildErrorResponse(execResult.getOutput() == null
                        ? "Compilation failed."
                        : execResult.getOutput());
            }

            String output = normalize(execResult.getOutput());
            String expected = normalize(tc.getExpectedOutput());
            boolean passed = output.equals(expected);

            TestCaseResultDTO tcResult = new TestCaseResultDTO();
            tcResult.setTestCaseId(tc.getId());
            tcResult.setPassed(passed);
            tcResult.setExpectedOutput(expected);
            tcResult.setActualOutput(output);

            results.add(tcResult);
            if (!passed) allPassed = false;
        }

        SubmitActivityResponseDTO response = new SubmitActivityResponseDTO();
        response.setPassedAllTestCases(allPassed);
        response.setTestCaseResults(results);
        response.setEarnedPoints(allPassed ? activityDTO.getPoints() : 0);
        response.setFeedback(allPassed
                ? "All test cases passed. You may submit."
                : "Some test cases failed. Keep trying!");

        return response;
    }

    /**
     * Submit student's code and save results.
     */
    @Transactional
    public SubmitActivityResponseDTO submitActivity(String username, SubmitActivityRequestDTO request) {

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        ActivityDTO activityDTO = activityService.getActivityById(request.getActivityId());
        Activity activityEntity = activityService.getActivityEntityById(activityDTO.getId());

        List<TestCaseResultDTO> results = new ArrayList<>();
        boolean allPassed = true;

        // Evaluate all test cases
        for (ActivityTestCaseDTO tc : activityDTO.getTestCases()) {
            String testInput = tc.isNoInput()
                    ? ""
                    : (tc.getInput() != null ? tc.getInput()
                    : (request.getInput() != null ? request.getInput() : ""));

            CodeExecutionResultDTO execResult;
            try {
                execResult = codeRunnerService.runJavaCode(request.getCode(), testInput);
            } catch (Exception e) {
                return buildErrorResponse("Error executing code: " + e.getMessage());
            }

            if (execResult.isCompileError()) {
                return buildErrorResponse(execResult.getOutput() == null
                        ? "Compilation failed."
                        : execResult.getOutput());
            }

            String output = normalize(execResult.getOutput());
            String expected = normalize(tc.getExpectedOutput());
            boolean passed = output.equals(expected);

            TestCaseResultDTO tcResult = new TestCaseResultDTO();
            tcResult.setTestCaseId(tc.getId());
            tcResult.setPassed(passed);
            tcResult.setExpectedOutput(expected);
            tcResult.setActualOutput(output);

            results.add(tcResult);
            if (!passed) allPassed = false;
        }

        int pointsEarned = allPassed ? activityDTO.getPoints() : 0;

        // Fetch or create the StudentActivity record
        StudentActivity studentActivity = studentActivityRepository
                .findByStudentAndActivity(student, activityEntity)
                .orElseGet(() -> {
                    StudentActivity sa = new StudentActivity();
                    sa.setStudent(student);
                    sa.setActivity(activityEntity);
                    sa.setUnlocked(true); // Current activity must be unlocked
                    return sa;
                });

        // Update code, output, and points
        studentActivity.setCode(request.getCode());
        studentActivity.setOutput(results.stream()
                .map(TestCaseResultDTO::getActualOutput)
                .reduce("", (acc, s) -> acc + (s.isEmpty() ? "" : s + "\n"))
                .trim());
        studentActivity.setEarnedPoints(pointsEarned);

        // Only mark completed if all test cases pass
        if (allPassed) {
            studentActivity.setCompleted(true);

            // Unlock next activity for this student
            Long nextActivityId = activityService.getNextActivityId(activityEntity.getCourse().getId(), activityEntity.getId());
            if (nextActivityId != null) {
                Activity nextActivity = activityService.getActivityEntityById(nextActivityId);
                StudentActivity nextSubmission = studentActivityRepository
                        .findByStudentAndActivity(student, nextActivity)
                        .orElseGet(() -> {
                            StudentActivity sa = new StudentActivity();
                            sa.setStudent(student);
                            sa.setActivity(nextActivity);
                            return sa;
                        });
                nextSubmission.setUnlocked(true);
                studentActivityRepository.save(nextSubmission);
            }
        }

        studentActivityRepository.save(studentActivity);

        SubmitActivityResponseDTO response = new SubmitActivityResponseDTO();
        response.setPassedAllTestCases(allPassed);
        response.setTestCaseResults(results);
        response.setEarnedPoints(pointsEarned);
        response.setFeedback(allPassed
                ? "Great job! You passed the activity."
                : "Some test cases failed. Keep trying!");

        return response;
    }

    /**
     * Get the next activity unlocked for this student in the course.
     */
    @Transactional(readOnly = true)
    public Long getNextUnlockedActivityId(String username, Long courseId, Long currentActivityId) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        // Get the next activity in the course after currentActivityId
        Long nextActivityId = activityService.getNextActivityId(courseId, currentActivityId);
        if (nextActivityId == null) return null;

        // Check if student already has a record
        Activity nextActivity = activityService.getActivityEntityById(nextActivityId);
        StudentActivity nextSubmission = studentActivityRepository.findByStudentAndActivity(student, nextActivity)
                .orElse(null);

        if (nextSubmission != null && nextSubmission.isUnlocked()) {
            return nextActivityId; // Already unlocked
        } else if (nextSubmission == null) {
            return nextActivityId; // Will be unlocked on first submit
        }

        return null; // Not unlocked yet
    }



    /**
     * Fetch student's submission for a given activity.
     */
    public StudentActivity getSubmissionForActivity(String username, Long activityId) {

        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return studentActivityRepository.findByStudentAndActivity(
                student,
                activityService.getActivityEntityById(activityId)
        ).orElse(null);
    }


    
}
