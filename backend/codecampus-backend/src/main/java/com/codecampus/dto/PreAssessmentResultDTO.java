package com.codecampus.dto;

public class PreAssessmentResultDTO {
    private int score;
    private int totalQuestions;

    public PreAssessmentResultDTO() {}

    public PreAssessmentResultDTO(int score, int totalQuestions) {
        this.score = score;
        this.totalQuestions = totalQuestions;
    }

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }

    public int getTotalQuestions() { return totalQuestions; }
    public void setTotalQuestions(int totalQuestions) { this.totalQuestions = totalQuestions; }

    public double getPercentage() {
        return totalQuestions == 0 ? 0 : ((double) score / totalQuestions) * 100;
    }
}
