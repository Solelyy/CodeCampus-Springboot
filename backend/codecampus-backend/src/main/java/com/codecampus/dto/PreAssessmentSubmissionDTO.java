package com.codecampus.dto;

import java.util.List;

public class PreAssessmentSubmissionDTO {
    private Long courseId;
    private List<AnswerDTO> answers;

    // Getters & Setters
    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public List<AnswerDTO> getAnswers() { return answers; }
    public void setAnswers(List<AnswerDTO> answers) { this.answers = answers; }

    public static class AnswerDTO {
        private Long questionId;  // ✅ Add this
        private String answer;

        public Long getQuestionId() { return questionId; }
        public void setQuestionId(Long questionId) { this.questionId = questionId; }

        public String getAnswer() { return answer; }
        public void setAnswer(String answer) { this.answer = answer; }
    }
}
