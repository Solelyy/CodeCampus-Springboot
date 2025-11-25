package com.codecampus.service;

import com.codecampus.model.Course;
import com.codecampus.model.CourseEnrollment;
import com.codecampus.model.EnrollmentStatus;
import com.codecampus.model.User;
import com.codecampus.repository.CourseEnrollmentRepository;
import com.codecampus.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final CourseRepository courseRepository;
    private final CourseEnrollmentRepository enrollmentRepository;

    public EnrollmentService(CourseRepository courseRepository,
                             CourseEnrollmentRepository enrollmentRepository) {
        this.courseRepository = courseRepository;
        this.enrollmentRepository = enrollmentRepository;
    }

    // Enroll a student by course code
    public Course enrollStudent(String code, User student) throws Exception {
        Course course = getCourseByCode(code);
        if (course == null) throw new Exception("Course not found with the given code.");
        return enrollStudentInCourse(course, student);
    }

    // Enroll a student by course ID
    public Course enrollStudentById(Long id, User student) throws Exception {
        Course course = getCourseById(id);
        return enrollStudentInCourse(course, student);
    }

    // Common private method to handle enrollment
    private Course enrollStudentInCourse(Course course, User student) throws Exception {
        if (enrollmentRepository.findByStudentAndCourse(student, course).isPresent()) {
            throw new Exception("Student already enrolled in this course.");
        }

        // Use managed Course entity
        Course managedCourse = courseRepository.findById(course.getId())
                .orElseThrow(() -> new Exception("Course not found."));

        CourseEnrollment enrollment = new CourseEnrollment(managedCourse, student, EnrollmentStatus.ACTIVE);
        enrollmentRepository.saveAndFlush(enrollment); // immediately persist to DB

        return managedCourse;
    }

    // Get course by ID
    public Course getCourseById(Long id) throws Exception {
        return courseRepository.findById(id)
                .orElseThrow(() -> new Exception("Course not found."));
    }

    // Get all active courses a student is enrolled in
    public List<Course> getStudentCourses(User student) {
        return enrollmentRepository.findByStudentAndStatus(student, EnrollmentStatus.ACTIVE)
                .stream()
                .map(CourseEnrollment::getCourse)
                .collect(Collectors.toList());
    }

    // Leave a course
    public void leaveCourse(Long courseId, User student) throws Exception {
        Course course = getCourseById(courseId);

        CourseEnrollment enrollment = enrollmentRepository.findByStudentAndCourse(student, course)
                .orElseThrow(() -> new Exception("Student is not enrolled in this course."));

        enrollment.setStatus(EnrollmentStatus.DROPPED);
        enrollmentRepository.saveAndFlush(enrollment);
    }

    // Get course by code
    public Course getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    // Check if student is actively enrolled
    public boolean isStudentActiveInCourse(Course course, User student) {
        return enrollmentRepository.findByStudentAndCourse(student, course)
                .filter(e -> e.getStatus() == EnrollmentStatus.ACTIVE)
                .isPresent();
    }

    // Get total active students in a course
    public long getStudentsCount(Course course) {
        return enrollmentRepository.findByCourseAndStatus(course, EnrollmentStatus.ACTIVE).size();
    }
}
