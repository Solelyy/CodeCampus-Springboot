package com.codecampus.service;

import com.codecampus.dto.PreAssessmentQuestionDTO;
import com.codecampus.dto.PreAssessmentSubmissionDTO;
import com.codecampus.dto.PreAssessmentResultDTO;
import com.codecampus.model.PreAssessmentQuestion;
import com.codecampus.model.StudentPreAssessment;
import com.codecampus.model.User;
import com.codecampus.repository.PreAssessmentQuestionRepository;
import com.codecampus.repository.StudentPreAssessmentRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class PreAssessmentService {

    @Autowired
    private PreAssessmentQuestionRepository preAssessmentQuestionRepository;

    @Autowired
    private StudentPreAssessmentRepository studentAssessmentRepository;

    @Autowired
    private UserRepository userRepository;

    /** Fetch pre-assessment questions **/
    public List<PreAssessmentQuestionDTO> getPreAssessmentQuestions(Long courseId) {
        List<PreAssessmentQuestion> questions = preAssessmentQuestionRepository.findByCourseId(courseId);

        return questions.stream().map(q -> {
            PreAssessmentQuestionDTO dto = new PreAssessmentQuestionDTO();
            dto.setCourseId(q.getCourse().getId());
            dto.setQuestion(q.getQuestion());
            dto.setQuestionType(q.getQuestionType());
            dto.setOptions(q.getOptions());
            dto.setCorrectAnswer(q.getCorrectAnswer());
            return dto;
        }).collect(Collectors.toList());
    }

    /** Submit student answers, save to DB, calculate score **/
    @Transactional
    public PreAssessmentResultDTO submitAssessment(PreAssessmentSubmissionDTO submission, Long studentId) throws IllegalArgumentException {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<PreAssessmentQuestion> questions = preAssessmentQuestionRepository.findByCourseId(submission.getCourseId());

        if (questions.isEmpty()) {
            throw new IllegalArgumentException("No pre-assessment questions found for this course.");
        }

        // Map questions by text for fast lookup
        Map<String, PreAssessmentQuestion> questionMap = questions.stream()
                .collect(Collectors.toMap(q -> q.getQuestion().trim(), q -> q));

        int score = 0;

        System.out.println("Received submission for student ID " + studentId + ":");
        submission.getAnswers().forEach(ans ->
                System.out.println(" - Question: '" + ans.getQuestion() + "' | Answer: '" + ans.getAnswer() + "'")
        );

        for (PreAssessmentSubmissionDTO.AnswerDTO ans : submission.getAnswers()) {
            String submittedAnswer = ans.getAnswer() != null ? ans.getAnswer().trim() : "";
            PreAssessmentQuestion question = questionMap.get(ans.getQuestion().trim());

            if (question == null) {
                System.out.println("WARNING: No matching question found in DB for '" + ans.getQuestion() + "'");
                continue; // Skip but do not crash
            }

            // Check correctness
            if (question.getCorrectAnswer() != null &&
                    question.getCorrectAnswer().trim().equalsIgnoreCase(submittedAnswer)) {
                score++;
            }

            // Check for existing answer to prevent duplicates
            StudentPreAssessment existing = studentAssessmentRepository
                    .findByStudentIdAndQuestionId(studentId, question.getId())
                    .orElse(new StudentPreAssessment());

            existing.setStudent(student);
            existing.setQuestion(question);
            existing.setAnswer(submittedAnswer);

            studentAssessmentRepository.save(existing);
        }

        System.out.println("Calculated score: " + score + " out of " + questions.size());
        return new PreAssessmentResultDTO(score, questions.size());
    }
}
