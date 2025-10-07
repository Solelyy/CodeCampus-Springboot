package com.codecampus.controller;

import com.codecampus.dto.PreAssessmentQuestionDTO;
import com.codecampus.service.PreAssessmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/courses")
public class PreAssessmentController {

    @Autowired
    private PreAssessmentService preAssessmentService;

    @GetMapping("/{courseId}/preassessment")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<PreAssessmentQuestionDTO>> getPreAssessment(@PathVariable Long courseId) {
        List<PreAssessmentQuestionDTO> questions = preAssessmentService.getPreAssessmentQuestions(courseId);
        return ResponseEntity.ok(questions);
    }
}
