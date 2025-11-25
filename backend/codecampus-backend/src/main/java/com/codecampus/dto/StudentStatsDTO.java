package com.codecampus.dto;

public class StudentStatsDTO {
    private long totalCourses;
    private long completedActivities;
    private long totalAchievements;
    private long streakDays;

    public StudentStatsDTO(long totalCourses, long completedActivities, long totalAchievements, long streakDays) {
        this.totalCourses = totalCourses;
        this.completedActivities = completedActivities;
        this.totalAchievements = totalAchievements;
        this.streakDays = streakDays;
    }

    // Getters & Setters
    public long getTotalCourses() { return totalCourses; }
    public void setTotalCourses(long totalCourses) { this.totalCourses = totalCourses; }

    public long getCompletedActivities() { return completedActivities; }
    public void setCompletedActivities(long completedActivities) { this.completedActivities = completedActivities; }

    public long getTotalAchievements() { return totalAchievements; }
    public void setTotalAchievements(long totalAchievements) { this.totalAchievements = totalAchievements; }

    public long getStreakDays() { return streakDays; }
    public void setStreakDays(long streakDays) { this.streakDays = streakDays; }
}
