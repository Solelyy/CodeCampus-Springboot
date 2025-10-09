package com.codecampus.controller;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.model.Activity;
import com.codecampus.repository.ActivityRepository;
import com.codecampus.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    @Autowired
    private ActivityRepository activityRepository;

    // List of activities for student (already uses DTO logic)
    @GetMapping("/course/{courseId}/student/{username}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesForStudent(
            @PathVariable Long courseId,
            @PathVariable String username) {
        return ResponseEntity.ok(activityService.getActivitiesForStudent(courseId, username));
    }

    // Single activity for challenge page (returns DTO with points based on difficulty)
    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable Long id) {
        return activityRepository.findById(id)
                .map(activity -> {
                    ActivityDTO dto = new ActivityDTO();
                    dto.setId(activity.getId());
                    dto.setCourseId(activity.getCourse().getId());
                    dto.setTitle(activity.getTitle());
                    dto.setProblemStatement(activity.getProblemStatement());

                    // Set difficulty, points auto-calculated
                    dto.setDifficulty(activity.getDifficulty());

                    dto.setTestCases(activity.getTestCases());
                    dto.setCompleted(activity.isCompleted());
                    dto.setUnlocked(activity.isUnlocked());

                    return ResponseEntity.ok(dto);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    // Optional: Create a new activity
    @PostMapping
    public ResponseEntity<Activity> createActivity(@RequestBody Activity activity) {
        return ResponseEntity.ok(activityRepository.save(activity));
    }

    // Optional: Delete an activity
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
