package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class ActivityCompletionDTO {
    private long activityId;
    private String activityTitle;
    private int completedBy;
    private int totalStudents;
    private double progressRate;
}
