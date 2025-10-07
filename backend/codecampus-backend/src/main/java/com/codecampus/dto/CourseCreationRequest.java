package com.codecampus.dto;

import java.util.List;

public class CourseCreationRequest {

    private String title;
    private String description;
    private boolean isPublic;

    private List<ActivityDTO> activities;
    private List<PreAssessmentQuestionDTO> preAssessments; // <-- field name

    // Getters and Setters
    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public boolean isPublic() {
        return isPublic;
    }

    public void setPublic(boolean aPublic) {
        isPublic = aPublic;
    }

    public List<ActivityDTO> getActivities() {
        return activities;
    }

    public void setActivities(List<ActivityDTO> activities) {
        this.activities = activities;
    }

    public List<PreAssessmentQuestionDTO> getPreAssessments() { // <-- match field name
        return preAssessments;
    }

    public void setPreAssessments(List<PreAssessmentQuestionDTO> preAssessments) { // <-- match field name
        this.preAssessments = preAssessments;
    }
}
