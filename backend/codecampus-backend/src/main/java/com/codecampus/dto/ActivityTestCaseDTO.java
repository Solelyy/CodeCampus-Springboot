package com.codecampus.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class ActivityTestCaseDTO {
    private Long id; // optional, useful for updates
    private String input;
    @JsonProperty("noInput") // ensures JSON maps correctly
    private boolean noInput; // true if there’s no input
    private String expectedOutput;

    public ActivityTestCaseDTO() {}

    // Getters and setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public boolean isNoInput() { return noInput; }
    public void setNoInput(boolean noInput) { this.noInput = noInput; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }
}
