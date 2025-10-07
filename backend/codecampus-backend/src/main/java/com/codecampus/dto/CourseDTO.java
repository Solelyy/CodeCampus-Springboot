package com.codecampus.dto;

import java.util.List;

public class CourseDTO {

    private Long id;
    private String title;
    private String description;
    private String code;
    private boolean isPublic;
    private String professorName;
    private boolean preAssessmentCompleted;

    private List<ActivityDTO> activities;
    private List<PreAssessmentQuestionDTO> preAssessments;

    // --- Constructors ---
    public CourseDTO() {}

    public CourseDTO(Long id, String title, String description, String code, boolean isPublic, String professorName) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.code = code;
        this.isPublic = isPublic;
        this.professorName = professorName;
        this.preAssessmentCompleted = false;
    }

    // --- Getters & Setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public boolean isPublic() { return isPublic; }
    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }

    public boolean isPreAssessmentCompleted() { return preAssessmentCompleted; }
    public void setPreAssessmentCompleted(boolean preAssessmentCompleted) { this.preAssessmentCompleted = preAssessmentCompleted; }

    public List<ActivityDTO> getActivities() { return activities; }
    public void setActivities(List<ActivityDTO> activities) { this.activities = activities; }

    public List<PreAssessmentQuestionDTO> getPreAssessments() { return preAssessments; }
    public void setPreAssessments(List<PreAssessmentQuestionDTO> preAssessments) { this.preAssessments = preAssessments; }


}
