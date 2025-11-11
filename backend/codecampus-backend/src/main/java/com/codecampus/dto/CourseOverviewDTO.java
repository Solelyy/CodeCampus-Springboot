package com.codecampus.dto;

public class CourseOverviewDTO {

    private Long id;
    private String title;
    private String description;
    private String code;
    private int studentsCount;
    private int activitiesCount;

    // Constructors
    public CourseOverviewDTO() {}

    public CourseOverviewDTO(Long id, String title, String description, String code, int studentsCount, int activitiesCount) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.code = code;
        this.studentsCount = studentsCount;
        this.activitiesCount = activitiesCount;
    }

    // Getters & Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public int getStudentsCount() { return studentsCount; }
    public void setStudentsCount(int studentsCount) { this.studentsCount = studentsCount; }

    public int getActivitiesCount() { return activitiesCount; }
    public void setActivitiesCount(int activitiesCount) { this.activitiesCount = activitiesCount; }
}

