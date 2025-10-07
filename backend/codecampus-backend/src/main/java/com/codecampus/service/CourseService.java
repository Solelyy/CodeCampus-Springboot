package com.codecampus.service;

import com.codecampus.dto.ActivityDTO;
import com.codecampus.dto.CourseCreationRequest;
import com.codecampus.dto.CourseDTO;
import com.codecampus.dto.PreAssessmentQuestionDTO;
import com.codecampus.model.Activity;
import com.codecampus.model.Course;
import com.codecampus.model.PreAssessmentQuestion;
import com.codecampus.model.User;
import com.codecampus.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.stream.Collectors;

@Service
public class CourseService {
    private final Logger logger = LoggerFactory.getLogger(CourseService.class.getName());

    private final CourseRepository courseRepository;

    public CourseService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // --- Create basic course ---
    public Course createCourse(Course course, User professor) {
        course.setProfessor(professor);
        return courseRepository.save(course);
    }

    public List<Course> getCoursesByProfessor(User professor) {
        return courseRepository.findByProfessor(professor);
    }

    public List<Course> getPublicCourses() {
        return courseRepository.findByIsPublicTrue();
    }

    public Course getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    // --- Create a course with activities and pre-assessment questions ---
    @Transactional
    public Course createCourseWithDetails(CourseCreationRequest request, User professor) {
        try {
            logger.info("Starting course creation for professor: " + professor.getUsername());

            // --- Create new Course entity ---
            Course course = new Course();
            course.setTitle(request.getTitle());
            course.setDescription(request.getDescription());
            course.setPublic(request.isPublic());
            course.setProfessor(professor);

            // Initialize lists
            course.setActivities(new ArrayList<>());
            course.setPreAssessmentQuestions(new ArrayList<>());

            // --- Map activities ---
            if (request.getActivities() != null && !request.getActivities().isEmpty()) {
                request.getActivities().forEach(aDto -> {
                    Activity activity = new Activity();
                    activity.setTitle(aDto.getTitle());
                    activity.setProblemStatement(aDto.getProblemStatement());
                    activity.setDifficulty(aDto.getDifficulty());
                    activity.setPoints(aDto.getPoints());
                    activity.setTestCases(aDto.getTestCases());
                    activity.setCourse(course);
                    course.getActivities().add(activity);

                    logger.info("Added activity: " + activity.getTitle());
                });
            }

            // --- Map pre-assessment questions ---
            if (request.getPreAssessments() != null && !request.getPreAssessments().isEmpty()) {
                request.getPreAssessments().forEach(pDto -> {
                    PreAssessmentQuestion question = new PreAssessmentQuestion();
                    question.setQuestion(pDto.getQuestion());
                    question.setQuestionType(pDto.getQuestionType());
                    question.setOptions(pDto.getOptions());
                    question.setCorrectAnswer(pDto.getCorrectAnswer());
                    question.setCourse(course);
                    course.getPreAssessmentQuestions().add(question);

                    logger.info("Added pre-assessment question: " + question.getQuestion());
                });
            }

            // --- Save course ---
            Course savedCourse = courseRepository.save(course);
            logger.info("Course created successfully with ID: " + savedCourse.getId());

            return savedCourse;

        } catch (Exception e) {
            logger.error("Failed to create course: " + e.getMessage(), e);
            throw e; // propagate error to controller
        }
    }


    // --- Convert Course to CourseDTO ---
    public CourseDTO toDTO(Course course) {
        CourseDTO dto = new CourseDTO(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCode(),
                course.isPublic(),
                course.getProfessor().getFullName()
        );

        // --- Map activities to DTO ---
        if (course.getActivities() != null) {
            dto.setActivities(
                    course.getActivities().stream().map(a -> {
                        ActivityDTO aDto = new ActivityDTO();
                        aDto.setTitle(a.getTitle());
                        aDto.setProblemStatement(a.getProblemStatement());
                        aDto.setDifficulty(a.getDifficulty());
                        aDto.setPoints(a.getPoints());
                        aDto.setTestCases(a.getTestCases());
                        return aDto;
                    }).collect(Collectors.toList())
            );
        }

        // --- Map pre-assessment questions to DTO ---
        if (course.getPreAssessmentQuestions() != null) {
            dto.setPreAssessments(
                    course.getPreAssessmentQuestions().stream().map(q -> {
                        PreAssessmentQuestionDTO qDto = new PreAssessmentQuestionDTO();
                        qDto.setQuestion(q.getQuestion());
                        qDto.setQuestionType(q.getQuestionType());
                        qDto.setOptions(q.getOptions());
                        qDto.setCorrectAnswer(q.getCorrectAnswer());
                        return qDto;
                    }).collect(Collectors.toList())
            );
        }
        return dto;
    }
}
