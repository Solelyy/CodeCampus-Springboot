package com.codecampus.service;

import com.codecampus.dto.*;
import com.codecampus.model.*;
import com.codecampus.repository.CourseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class CourseService {

    private final Logger logger = LoggerFactory.getLogger(CourseService.class);

    private final CourseRepository courseRepository;
    private final EnrollmentService enrollmentService;

    // ---- FIXED: Only ONE constructor ----
    public CourseService(CourseRepository courseRepository, EnrollmentService enrollmentService) {
        this.courseRepository = courseRepository;
        this.enrollmentService = enrollmentService;
    }

    // --- Utility: Generate unique random course code ---
    private String generateRandomCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        Random random = new Random();
        StringBuilder sb = new StringBuilder("CC");
        for (int i = 0; i < 6; i++) {
            sb.append(characters.charAt(random.nextInt(characters.length())));
        }
        return sb.toString();
    }

    private String generateUniqueCourseCode() {
        String code;
        do {
            code = generateRandomCode();
        } while (courseRepository.existsByCode(code));
        return code;
    }

    // --- Create simple course ---
    public Course createCourse(Course course, User professor) {
        course.setProfessor(professor);
        if (course.getCode() == null || course.getCode().isBlank()) {
            course.setCode(generateUniqueCourseCode());
        }
        return courseRepository.save(course);
    }

    // --- Get courses ---
    public List<Course> getCoursesByProfessor(User professor) {
        return courseRepository.findByProfessor(professor);
    }

    public List<Course> getPublicCourses() {
        return courseRepository.findByIsPublicTrue();
    }

    public Course getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    public Course getCourseById(Long id) {
        return courseRepository.findById(id).orElse(null);
    }

    // --- Create course with activities + pre-assessment ---
    @Transactional
    public Course createCourseWithDetails(CourseCreationRequest request, User professor) {
        try {
            logger.info("Starting course creation for professor: {}", professor.getUsername());

            Course course = new Course();
            course.setTitle(request.getTitle());
            course.setDescription(request.getDescription());
            course.setPublic(request.isPublic());
            course.setProfessor(professor);
            course.setCode(generateUniqueCourseCode());

            course.setActivities(new ArrayList<>());
            course.setPreAssessmentQuestions(new ArrayList<>());

            // --- Map activities ---
            if (request.getActivities() != null) {
                request.getActivities().forEach(aDto -> {
                    Activity activity = new Activity();
                    activity.setTitle(aDto.getTitle());
                    activity.setProblemStatement(aDto.getProblemStatement());
                    activity.setDifficulty(aDto.getDifficulty());
                    activity.setPoints(aDto.getPoints());
                    activity.setCourse(course);

                    if (aDto.getTestCases() != null) {
                        List<ActivityTestCase> testCases = aDto.getTestCases().stream().map(tcDTO -> {
                            ActivityTestCase tc = new ActivityTestCase();
                            tc.setActivity(activity);
                            tc.setInput(tcDTO.getInput());
                            tc.setNoInput(tcDTO.isNoInput());
                            tc.setExpectedOutput(tcDTO.getExpectedOutput());
                            return tc;
                        }).collect(Collectors.toList());
                        activity.setTestCases(testCases);
                    } else {
                        activity.setTestCases(new ArrayList<>());
                    }

                    course.getActivities().add(activity);
                });
            }

            // --- Map pre-assessment questions ---
            if (request.getPreAssessments() != null) {
                request.getPreAssessments().forEach(pDto -> {
                    PreAssessmentQuestion question = new PreAssessmentQuestion();
                    question.setQuestion(pDto.getQuestion());
                    question.setQuestionType(pDto.getQuestionType());
                    question.setOptions(pDto.getOptions());
                    question.setCorrectAnswer(pDto.getCorrectAnswer());
                    question.setCourse(course);

                    course.getPreAssessmentQuestions().add(question);
                });
            }

            Course savedCourse = courseRepository.save(course);
            logger.info("Course created successfully with ID: {}", savedCourse.getId());
            return savedCourse;

        } catch (Exception e) {
            logger.error("Failed to create course: {}", e.getMessage(), e);
            throw e;
        }
    }

    // --- Convert Course to DTO ---
    public CourseDTO toDTO(Course course) {
        CourseDTO dto = new CourseDTO(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCode(),
                course.isPublic(),
                course.getProfessor().getName()
        );

        // Activities
        if (course.getActivities() != null) {
            dto.setActivities(course.getActivities().stream().map(a -> {
                ActivityDTO aDto = new ActivityDTO();
                aDto.setId(a.getId());
                aDto.setTitle(a.getTitle());
                aDto.setProblemStatement(a.getProblemStatement());
                aDto.setDifficulty(a.getDifficulty());
                aDto.setPoints(a.getPoints());

                if (a.getTestCases() != null) {
                    aDto.setTestCases(a.getTestCases().stream().map(tc -> {
                        ActivityTestCaseDTO tcdto = new ActivityTestCaseDTO();
                        tcdto.setId(tc.getId());
                        tcdto.setInput(tc.getInput());
                        tcdto.setNoInput(Boolean.TRUE.equals(tc.getNoInput()));
                        tcdto.setExpectedOutput(tc.getExpectedOutput());
                        return tcdto;
                    }).collect(Collectors.toList()));
                } else {
                    aDto.setTestCases(new ArrayList<>());
                }

                return aDto;
            }).collect(Collectors.toList()));
        }

        // Pre Assessment
        if (course.getPreAssessmentQuestions() != null) {
            dto.setPreAssessments(course.getPreAssessmentQuestions().stream().map(q -> {
                PreAssessmentQuestionDTO qDto = new PreAssessmentQuestionDTO();
                qDto.setQuestion(q.getQuestion());
                qDto.setQuestionType(q.getQuestionType());
                qDto.setOptions(q.getOptions());
                qDto.setCorrectAnswer(q.getCorrectAnswer());
                return qDto;
            }).collect(Collectors.toList()));
        }

        return dto;
    }

    // --- Course Overview ---
    public CourseOverviewDTO toOverviewDTO(Course course) {
        int activitiesCount = course.getActivities() != null ? course.getActivities().size() : 0;
        int studentsCount = (int) enrollmentService.getStudentsCount(course);

        return new CourseOverviewDTO(
                course.getId(),
                course.getTitle(),
                course.getDescription(),
                course.getCode(),
                studentsCount,
                activitiesCount
        );
    }
}
