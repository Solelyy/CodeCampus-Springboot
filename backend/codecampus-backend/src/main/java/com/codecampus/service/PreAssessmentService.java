package com.codecampus.service;

import com.codecampus.dto.PreAssessmentQuestionDTO;
import com.codecampus.dto.PreAssessmentResultDTO;
import com.codecampus.dto.PreAssessmentSubmissionDTO;
import com.codecampus.model.PreAssessmentQuestion;
import com.codecampus.model.StudentPreAssessment;
import com.codecampus.model.User;
import com.codecampus.repository.PreAssessmentQuestionRepository;
import com.codecampus.repository.StudentPreAssessmentRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class PreAssessmentService {

    @Autowired
    private PreAssessmentQuestionRepository preAssessmentQuestionRepository;

    @Autowired
    private StudentPreAssessmentRepository studentAssessmentRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * ✅ Fetch pre-assessment questions by course
     */
    public List<PreAssessmentQuestionDTO> getPreAssessmentQuestions(Long courseId) {
        List<PreAssessmentQuestion> questions = preAssessmentQuestionRepository.findByCourseId(courseId);

        if (questions.isEmpty()) {
            System.out.println("⚠️ No pre-assessment questions found for course ID: " + courseId);
            return Collections.emptyList();
        }

        return questions.stream().map(q -> {
            PreAssessmentQuestionDTO dto = new PreAssessmentQuestionDTO();
            dto.setId(q.getId());
            dto.setCourseId(q.getCourse().getId());
            dto.setQuestion(q.getQuestion());
            dto.setQuestionType(q.getQuestionType());
            dto.setOptions(q.getOptions());
            dto.setCorrectAnswer(q.getCorrectAnswer());
            return dto;
        }).collect(Collectors.toList());
    }

    // Submit student answers, calculate score, and log to DB

    @Transactional
    public PreAssessmentResultDTO submitAssessment(PreAssessmentSubmissionDTO submission, Long studentId)
            throws IllegalArgumentException {

        // Validate student existence
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found."));

        // Fetch all questions for the course
        List<PreAssessmentQuestion> questions = preAssessmentQuestionRepository.findByCourseId(submission.getCourseId());

        if (questions.isEmpty()) {
            throw new IllegalArgumentException("No pre-assessment questions found for this course.");
        }

        // Map questions by ID for fast lookup
        Map<Long, PreAssessmentQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(PreAssessmentQuestion::getId, q -> q));

        int score = 0;
        int total = questions.size();

        System.out.println("📥 Received submission for student ID " + studentId);
        submission.getAnswers().forEach(ans ->
                System.out.println(" - Question ID: " + ans.getQuestionId() + " | Answer: '" + ans.getAnswer() + "'")
        );

        // 🔹 Process each submitted answer
        for (PreAssessmentSubmissionDTO.AnswerDTO ans : submission.getAnswers()) {
            Long questionId = ans.getQuestionId();
            String submittedAnswer = ans.getAnswer() != null ? ans.getAnswer().trim() : "";

            PreAssessmentQuestion question = questionMap.get(questionId);
            if (question == null) {
                System.out.println("⚠️ Skipping unknown question ID: " + questionId);
                continue;
            }

            // Check if correct
            String correct = question.getCorrectAnswer() != null ? question.getCorrectAnswer().trim() : "";
            if (!correct.isEmpty() && correct.equalsIgnoreCase(submittedAnswer)) {
                score++;
            }

            // Prevent duplicate student-question rows
            StudentPreAssessment existing = studentAssessmentRepository
                    .findByStudentIdAndQuestionId(studentId, questionId)
                    .orElseGet(StudentPreAssessment::new);

            existing.setStudent(student);
            existing.setQuestion(question);
            existing.setAnswer(submittedAnswer);

            studentAssessmentRepository.save(existing);
        }

        System.out.println("✅ Final Score: " + score + " / " + total);
        return new PreAssessmentResultDTO(score, total);
    }

    public boolean hasCompletedPreAssessment(Long studentId, Long courseId) {
        List<PreAssessmentQuestion> questions = preAssessmentQuestionRepository.findByCourseId(courseId);

        if (questions.isEmpty()) {
            return false; // no questions = nothing to complete
        }

        long totalQuestions = questions.size();

        long answered = studentAssessmentRepository
                .findByStudentIdAndQuestionCourseId(studentId, courseId)
                .stream()
                .filter(a -> a.getAnswer() != null && !a.getAnswer().isBlank())
                .count();

        System.out.println("✅ Checking completion for student " + studentId + ": " +
                answered + "/" + totalQuestions + " answered.");

        return answered == totalQuestions;
    }
}
