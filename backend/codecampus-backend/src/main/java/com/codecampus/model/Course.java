package com.codecampus.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
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

    @Column(nullable = false, unique = true, length = 10)
    private String code;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic = false;

    // --- Relationship: each course belongs to one professor (User) ---
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "professor_id", nullable = false)
    private User professor;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;

        if (code == null || code.isEmpty()) {
            code = generateRandomCode();
        }
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    private String generateRandomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder("CC"); //prefix for codecampus
        for (int i=0; i < 6; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<Activity> activities = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonManagedReference
    private List<PreAssessmentQuestion> preAssessmentQuestions = new ArrayList<>();


    @ManyToMany
    @JoinTable (
            name = "course_students",
            joinColumns = @JoinColumn(name = "course_id"),
            inverseJoinColumns = @JoinColumn(name = "student_id")
    )
    private Set<User> students = new HashSet<>();

    // --- Getters and Setters ---
    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }

    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }

    public void setDescription(String description) { this.description = description; }

    public boolean isPublic() { return isPublic; }

    public void setPublic(boolean isPublic) { this.isPublic = isPublic; }

    public User getProfessor() { return professor; }

    public void setProfessor(User professor) { this.professor = professor; }

    public Instant getCreatedAt() { return createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }

    public Set<User> getStudents(){ return students;}

    public void setStudents(Set<User> students) {this.students= students;}

    public String getCode() { return code;}

    public List<Activity> getActivities() { return activities; }
    public void setActivities(List<Activity> activities) { this.activities = activities; }

    public List<PreAssessmentQuestion> getPreAssessmentQuestions() { return preAssessmentQuestions; }
    public void setPreAssessmentQuestions(List<PreAssessmentQuestion> preAssessmentQuestions) {
        this.preAssessmentQuestions = preAssessmentQuestions;
    }
}
