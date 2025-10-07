package com.codecampus.dto;

public class PreAssessmentQuestionDTO {
    private Long courseId; // optional but useful for updates
    private String question;
    private String questionType; // 'MCQ' or 'FillBlank'
    private String options; // JSON string for MCQ options
    private String correctAnswer;

    public PreAssessmentQuestionDTO() {}

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getQuestion() { return question; }
    public void setQuestion(String question) { this.question = question; }

    public String getQuestionType() { return questionType; }
    public void setQuestionType(String questionType) { this.questionType = questionType; }

    public String getOptions() { return options; }
    public void setOptions(String options) { this.options = options; }

    public String getCorrectAnswer() { return correctAnswer; }
    public void setCorrectAnswer(String correctAnswer) { this.correctAnswer = correctAnswer; }
}
