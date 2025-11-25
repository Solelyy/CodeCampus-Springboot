package com.codecampus.dto;

public class ProfessorStatsDTO {
    private long totalCoursesCreated;
    private long totalStudents;
    private long totalActivities;
    private long achievements;

    public ProfessorStatsDTO(long totalCoursesCreated, long totalStudents, long totalActivities, long achievements) {
        this.totalCoursesCreated = totalCoursesCreated;
        this.totalStudents = totalStudents;
        this.totalActivities = totalActivities;
        this.achievements = achievements;
    }

    public long getTotalCoursesCreated() { return totalCoursesCreated; }
    public void setTotalCoursesCreated(long totalCoursesCreated) { this.totalCoursesCreated = totalCoursesCreated; }

    public long getTotalStudents() { return totalStudents; }
    public void setTotalStudents(long totalStudents) { this.totalStudents = totalStudents; }

    public long getTotalActivities() { return totalActivities; }
    public void setTotalActivities(long totalActivities) { this.totalActivities = totalActivities; }

    public long getAchievements() { return achievements; }
    public void setAchievements(long achievements) { this.achievements = achievements; }
}
