package com.codecampus.controller;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.service.ActivityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activities")
public class ActivityController {

    @Autowired
    private ActivityService activityService;

    // STUDENT VIEW: List activities for a course
    @GetMapping("/course/{courseId}/student/{username}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesForStudent(
            @PathVariable Long courseId,
            @PathVariable String username) {
        return ResponseEntity.ok(activityService.getActivitiesForStudent(courseId, username));
    }

    // SINGLE ACTIVITY DETAIL
    @GetMapping("/{id}")
    public ResponseEntity<ActivityDTO> getActivityById(@PathVariable Long id) {
        try {
            ActivityDTO dto = activityService.getActivityById(id);
            return ResponseEntity.ok(dto);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.notFound().build();
        }
    }


    // PROFESSOR VIEW: All activities in a course
    @PreAuthorize("hasRole('PROFESSOR')")
    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<ActivityDTO>> getActivitiesForCourse(@PathVariable Long courseId) {
        List<ActivityDTO> activityDTOs = activityService.getActivitiesForCourse(courseId);
        return ResponseEntity.ok(activityDTOs);
    }


    // CREATE ACTIVITY
    @PreAuthorize("hasRole('PROFESSOR')")
    @PostMapping
    public ResponseEntity<ActivityDTO> createActivity(@RequestBody ActivityDTO dto) {
        ActivityDTO savedDTO = activityService.saveActivity(dto);
        return ResponseEntity.status(201).body(savedDTO);
    }


    // UPDATE ACTIVITY
    @PreAuthorize("hasRole('PROFESSOR')")
    @PutMapping("/{id}")
    public ResponseEntity<ActivityDTO> updateActivity(@PathVariable Long id, @RequestBody ActivityDTO dto) {
        dto.setId(id);
        ActivityDTO updatedDTO = activityService.saveActivity(dto);
        return ResponseEntity.ok(updatedDTO);
    }

    // DELETE ACTIVITY
    @PreAuthorize("hasRole('PROFESSOR')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteActivity(@PathVariable Long id) {
        activityService.deleteActivity(id);
        return ResponseEntity.noContent().build();
    }
}
