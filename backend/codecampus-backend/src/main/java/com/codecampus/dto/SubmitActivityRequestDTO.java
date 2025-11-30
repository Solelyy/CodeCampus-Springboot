// SubmitActivityRequestDTO.java
package com.codecampus.dto;

public class SubmitActivityRequestDTO {
    private Long activityId;
    private String code;
    private String input; // optional

    public Long getActivityId() { return activityId; }
    public void setActivityId(Long activityId) { this.activityId = activityId; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }
}
