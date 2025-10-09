package com.codecampus.dto;

public class ActivityDTO {
    private Long courseId; // optional but useful for updates
    private String title;
    private String problemStatement;
    private String difficulty;
    private Integer points;
    private String testCases; // JSON array as String
    private boolean completed;
    private boolean unlocked;
    private Long id;

    public ActivityDTO() {}

    // Getters & setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProblemStatement() { return problemStatement; }
    public void setProblemStatement(String problemStatement) { this.problemStatement = problemStatement; }

    public String getDifficulty() { return difficulty; }

    public void setDifficulty(String difficulty) {
        this.difficulty = difficulty;

        if (difficulty != null) {
            switch (difficulty.trim().toLowerCase()) {
                case "easy": this.points = 10; break;
                case "medium": this.points = 20; break;
                case "hard": this.points = 30; break;
                default: this.points = 10;
            }
        } else {
            this.points = 10;
        }
    }

    public Integer getPoints() { return points; }
    public void setPoints(Integer points) { this.points = points; } // optional, avoid overwriting

    public String getTestCases() { return testCases; }
    public void setTestCases(String testCases) { this.testCases = testCases; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public boolean isUnlocked() { return unlocked; }
    public void setUnlocked(boolean unlocked) { this.unlocked = unlocked; }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
}
