package com.codecampus.dto;

public class ActivityResultDTO {
    private Long activityId;
    private String activityTitle;
    private int earnedPoints;
    private int totalPointsInCourse;
    private Long nextActivityId;
    private Long courseId;

    // getters and setters
    public Long getActivityId() { return activityId; }
    public String getActivityTitle() { return activityTitle; }
    public int getEarnedPoints() { return earnedPoints; }
    public int getTotalPointsInCourse() { return totalPointsInCourse; }
    public Long getNextActivityId() { return nextActivityId; }
    public Long getCourseId() { return courseId; }

    public void setActivityId(Long activityId) { this.activityId = activityId; }
    public void setActivityTitle(String activityTitle) { this.activityTitle = activityTitle; }
    public void setEarnedPoints(int earnedPoints) { this.earnedPoints = earnedPoints; }
    public void setTotalPointsInCourse(int totalPointsInCourse) { this.totalPointsInCourse = totalPointsInCourse; }
    public void setNextActivityId(Long nextActivityId) { this.nextActivityId = nextActivityId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }
}

