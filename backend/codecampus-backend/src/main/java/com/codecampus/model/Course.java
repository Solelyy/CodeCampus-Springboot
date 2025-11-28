package com.codecampus.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.*;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 255)
    private String title;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String description;

    // Unique course code like CC123ABC
    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    // --- Relationship: each course belongs to one professor ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private User professor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    // --- Auto timestamp management ---
    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // --- Relationships ---
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Activity> activities = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PreAssessmentQuestion> preAssessmentQuestions = new ArrayList<>();

    // --- Getters and Setters ---
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

    public User getProfessor() { return professor; }

    public void setProfessor(User professor) { this.professor = professor; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }

    public List<Activity> getActivities() { return activities; }

    public void setActivities(List<Activity> activities) { this.activities = activities; }

    public List<PreAssessmentQuestion> getPreAssessmentQuestions() { return preAssessmentQuestions; }

    public void setPreAssessmentQuestions(List<PreAssessmentQuestion> preAssessmentQuestions) {
        this.preAssessmentQuestions = preAssessmentQuestions;
    }
}
