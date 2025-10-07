package com.codecampus.controller;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.service.ActivityService;
import com.codecampus.service.PreAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/student/courses")
public class StudentCourseController {

    @Autowired
    private ActivityService activityService;

    @GetMapping("/{courseId}/activities")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<?> getActivities(@PathVariable Long courseId, Principal principal) {
        List<ActivityDTO> activities = activityService.getActivitiesForStudent(courseId, principal.getName());
        return ResponseEntity.ok(activities);
    }
}
