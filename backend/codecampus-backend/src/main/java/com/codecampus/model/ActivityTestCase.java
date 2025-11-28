package com.codecampus.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "activity_test_cases")
public class ActivityTestCase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "activity_id", nullable = false)
    private Activity activity;

    @Lob
    private String input;

    @Column(name = "no_input")
    private Boolean noInput = false;

    @Lob
    @Column(name = "expected_output", nullable = false)
    private String expectedOutput;

    @Column(name = "created_at", updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at")
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = Instant.now();
        updatedAt = createdAt;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    // --- Getters and setters ---
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Activity getActivity() { return activity; }
    public void setActivity(Activity activity) { this.activity = activity; }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public Boolean getNoInput() { return noInput; }
    public void setNoInput(Boolean noInput) { this.noInput = noInput; }

    public String getExpectedOutput() { return expectedOutput; }
    public void setExpectedOutput(String expectedOutput) { this.expectedOutput = expectedOutput; }

    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
}
