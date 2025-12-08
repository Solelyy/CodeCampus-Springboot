package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CourseAnalyticsDTO {
    //Summary cards
    private int totalStudents;
    private double averagePreAssessment;
    private double courseCompletionRate; // percentage (e.g., 85.5)

    //Activity Completion
    private List<ActivityCompletionDTO> activityCompletions;

    //Leaderboard
    private List<LeaderboardDTO> leaderboard;

    //Submission Patter
    private String mostCommonSubmissionTimeRange;
    // Example: "6:00 PM - 9:00 PM"
}
