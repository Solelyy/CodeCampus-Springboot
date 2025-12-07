package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

@Data
@AllArgsConstructor
public class CourseAnalyticsDTO {
    // ===== SUMMARY CARDS =====
    private int totalStudents;
    private double averagePreAssessment;
    private double courseCompletionRate; // percentage (e.g., 85.5)

    // ===== ACTIVITY COMPLETION TABLE =====
    private List<ActivityCompletionDTO> activityCompletions;

    // ===== LEADERBOARD (YOU ALREADY HAVE THIS) =====
    private List<LeaderboardDTO> leaderboard;

    // ===== SUBMISSION PATTERN =====
    private String mostCommonSubmissionTimeRange;
    // Example: "6:00 PM - 9:00 PM"
}
}
