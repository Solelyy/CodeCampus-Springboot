package com.codecampus.repository;

import com.codecampus.model.PreAssessmentQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PreAssessmentQuestionRepository extends JpaRepository<PreAssessmentQuestion, Long> {
    List<PreAssessmentQuestion> findByCourseId(Long courseId);
}
