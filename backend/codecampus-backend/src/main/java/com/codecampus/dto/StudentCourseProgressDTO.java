package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class StudentCourseProgressDTO {
    private Long courseId;
    private int progress;
}
