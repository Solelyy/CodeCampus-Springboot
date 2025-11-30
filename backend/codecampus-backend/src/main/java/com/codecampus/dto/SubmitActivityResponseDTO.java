// SubmitActivityResponseDTO.java
package com.codecampus.dto;

import java.util.List;

public class SubmitActivityResponseDTO {
    private boolean passedAllTestCases;
    private String feedback;
    private List<TestCaseResultDTO> testCaseResults;
    private Integer earnedPoints;

    public boolean isPassedAllTestCases() { return passedAllTestCases; }
    public void setPassedAllTestCases(boolean passedAllTestCases) { this.passedAllTestCases = passedAllTestCases; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public List<TestCaseResultDTO> getTestCaseResults() { return testCaseResults; }
    public void setTestCaseResults(List<TestCaseResultDTO> testCaseResults) { this.testCaseResults = testCaseResults; }

    public Integer getEarnedPoints() { return earnedPoints; }
    public void setEarnedPoints(Integer earnedPoints) { this.earnedPoints = earnedPoints; }
}
