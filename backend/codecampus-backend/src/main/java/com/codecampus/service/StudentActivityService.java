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
     * Evaluate student's code against activity test cases.
     * Does NOT mark the activity as completed.
     */
    @Transactional(readOnly = true)
    public SubmitActivityResponseDTO evaluateActivity(String username, SubmitActivityRequestDTO request) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        ActivityDTO activityDTO = activityService.getActivityById(request.getActivityId());

        List<TestCaseResultDTO> results = new ArrayList<>();
        boolean allPassed = true;

        for (ActivityTestCaseDTO tc : activityDTO.getTestCases()) {
            String input = tc.isNoInput() ? "" : request.getInput(); // or tc.getInput() if each test case has input
            CodeExecutionResultDTO execResult;
            try {
                execResult = codeRunnerService.runJavaCode(request.getCode(), input);
            } catch (Exception e) {
                SubmitActivityResponseDTO errorResp = new SubmitActivityResponseDTO();
                errorResp.setPassedAllTestCases(false);
                errorResp.setEarnedPoints(0);
                errorResp.setFeedback("Error executing code: " + e.getMessage());
                return errorResp;
            }

            String output = execResult.getOutput() == null ? "" : execResult.getOutput();
            boolean passed = output.trim().equals(tc.getExpectedOutput().trim());

            TestCaseResultDTO tcResult = new TestCaseResultDTO();
            tcResult.setTestCaseId(tc.getId());
            tcResult.setPassed(passed);
            tcResult.setExpectedOutput(tc.getExpectedOutput());
            tcResult.setActualOutput(output);

            results.add(tcResult);
            if (!passed) allPassed = false;
        }

        int pointsEarned = allPassed ? activityDTO.getPoints() : 0;

        SubmitActivityResponseDTO response = new SubmitActivityResponseDTO();
        response.setPassedAllTestCases(allPassed);
        response.setTestCaseResults(results);
        response.setEarnedPoints(pointsEarned);
        response.setFeedback(allPassed
                ? "All test cases passed. You may submit."
                : "Some test cases failed. Keep trying!");

        return response;
    }

    /**
     * Submit student's code for the activity.
     * Marks activity as completed if all test cases pass.
     */
    @Transactional
    public SubmitActivityResponseDTO submitActivity(String username, SubmitActivityRequestDTO request) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        ActivityDTO activityDTO = activityService.getActivityById(request.getActivityId());
        Activity activityEntity = activityService.getActivityEntityById(activityDTO.getId());

        List<TestCaseResultDTO> results = new ArrayList<>();
        boolean allPassed = true;

        for (ActivityTestCaseDTO tc : activityDTO.getTestCases()) {
            String input = tc.isNoInput() ? "" : request.getInput();
            CodeExecutionResultDTO execResult;
            try {
                execResult = codeRunnerService.runJavaCode(request.getCode(), input);
            } catch (Exception e) {
                SubmitActivityResponseDTO errorResponse = new SubmitActivityResponseDTO();
                errorResponse.setPassedAllTestCases(false);
                errorResponse.setEarnedPoints(0);
                errorResponse.setFeedback("Error running code: " + e.getMessage());
                return errorResponse;
            }

            String output = execResult.getOutput() == null ? "" : execResult.getOutput();
            boolean passed = output.trim().equals(tc.getExpectedOutput().trim());

            TestCaseResultDTO tcResult = new TestCaseResultDTO();
            tcResult.setTestCaseId(tc.getId());
            tcResult.setPassed(passed);
            tcResult.setExpectedOutput(tc.getExpectedOutput());
            tcResult.setActualOutput(output);

            results.add(tcResult);
            if (!passed) allPassed = false;
        }

        int pointsEarned = allPassed ? activityDTO.getPoints() : 0;

        // Save or update StudentActivity
        StudentActivity studentActivity = studentActivityRepository
                .findByStudentAndActivity(student, activityEntity)
                .orElseGet(() -> {
                    StudentActivity sa = new StudentActivity();
                    sa.setStudent(student);
                    sa.setActivity(activityEntity);
                    return sa;
                });

        studentActivity.setCompleted(allPassed);
        studentActivity.setEarnedPoints(pointsEarned);
        studentActivity.setCode(request.getCode());
        studentActivity.setOutput(results.stream()
                .map(TestCaseResultDTO::getActualOutput)
                .reduce("", (acc, s) -> acc + s + "\n").trim());

        studentActivityRepository.save(studentActivity);

        SubmitActivityResponseDTO response = new SubmitActivityResponseDTO();
        response.setPassedAllTestCases(allPassed);
        response.setTestCaseResults(results);
        response.setEarnedPoints(pointsEarned);
        response.setFeedback(allPassed
                ? "Great job! You passed the activity."
                : "Keep trying!");

        return response;
    }

    /**
     * Fetch student's submission for a given activity.
     */
    public StudentActivity getSubmissionForActivity(String username, Long activityId) {
        User student = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        return studentActivityRepository.findByStudentAndActivity(student, activityService.getActivityEntityById(activityId))
                .orElse(null);
    }
}
