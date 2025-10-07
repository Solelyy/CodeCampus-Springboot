package com.codecampus.dto;

public class StudentCourseDTO {

    private Long id;
    private String title;
    private String professorName;
    private String description;
    private int studentsCount;
    private boolean isEnrolled;

    public StudentCourseDTO() {}

    public StudentCourseDTO(Long id, String title, String professorName, String description,
                            int studentsCount, boolean isEnrolled) {
        this.id = id;
        this.title = title;
        this.professorName = professorName;
        this.description = description;
        this.studentsCount = studentsCount;
        this.isEnrolled = isEnrolled;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getProfessorName() { return professorName; }
    public void setProfessorName(String professorName) { this.professorName = professorName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public int getStudentsCount() { return studentsCount; }
    public void setStudentsCount(int studentsCount) { this.studentsCount = studentsCount; }

    public boolean isEnrolled() { return isEnrolled; }
    public void setEnrolled(boolean enrolled) { isEnrolled = enrolled; }
}
