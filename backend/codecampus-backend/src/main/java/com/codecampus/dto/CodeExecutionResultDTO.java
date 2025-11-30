package com.codecampus.dto;

public class CodeExecutionResultDTO {
    private String output;
    private boolean requiresInput;
    private boolean hasMain;
    private boolean compileError;

    // Getters and Setters
    public String getOutput() { return output; }
    public void setOutput(String output) { this.output = output; }

    public boolean isRequiresInput() { return requiresInput; }
    public void setRequiresInput(boolean requiresInput) { this.requiresInput = requiresInput; }

    public boolean isHasMain() { return hasMain; }
    public void setHasMain(boolean hasMain) { this.hasMain = hasMain; }

    public boolean isCompileError() { return compileError; }
    public void setCompileError(boolean compileError) { this.compileError = compileError; }
}
