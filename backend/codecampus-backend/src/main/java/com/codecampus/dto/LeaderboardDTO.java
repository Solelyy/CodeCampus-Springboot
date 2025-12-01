package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LeaderboardDTO {
    private Long studentId;
    private String studentName;
    private int totalPoints;
    private int activitiesDone;
    private LocalDateTime lastCompleted;
}