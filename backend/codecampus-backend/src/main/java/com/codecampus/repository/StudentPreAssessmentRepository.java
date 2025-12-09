package com.codecampus.repository;

import com.codecampus.model.StudentPreAssessment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StudentPreAssessmentRepository extends JpaRepository<StudentPreAssessment, Long> {
    List<StudentPreAssessment> findByStudentIdAndQuestionCourseId(Long studentId, Long courseId);

    Optional<StudentPreAssessment> findByStudentIdAndQuestionId(Long studentId, Long questionId);

    List <StudentPreAssessment> findByQuestionCourseId (Long courseId);
}

