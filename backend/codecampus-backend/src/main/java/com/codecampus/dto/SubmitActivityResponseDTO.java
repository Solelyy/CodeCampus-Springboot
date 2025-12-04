// SubmitActivityResponseDTO.java
package com.codecampus.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubmitActivityResponseDTO {
    private boolean passedAllTestCases;
    private String feedback;
    private List<TestCaseResultDTO> testCaseResults;
    private Integer earnedPoints;
}
