package com.codecampus.service;

import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.repository.CourseRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final CourseRepository courseRepository;

    public EnrollmentService(CourseRepository courseRepository) {
        this.courseRepository = courseRepository;
    }

    // Enroll a student by course code
    public Course enrollStudent(String code, User student) throws Exception {
        Course course = getCourseByCode(code);
        if (course == null) {
            throw new Exception("Course not found with the given code.");
        }

        Set<User> students = course.getStudents();
        if (students.contains(student)) {
            throw new Exception("Student already enrolled in this course.");
        }

        students.add(student);
        course.setStudents(students);

        return courseRepository.save(course);
    }

    // Enroll a student by course ID
    public Course enrollStudentById(Long id, User student) throws Exception {
        Course course = getCourseById(id);
        if (course == null) {
            throw new Exception("Course not found with the given ID.");
        }

        Set<User> students = course.getStudents();
        if (students.contains(student)) {
            throw new Exception("Student already enrolled in this course.");
        }

        students.add(student);
        course.setStudents(students);

        return courseRepository.save(course);
    }

    // Get course by ID
    public Course getCourseById(Long id) throws Exception {
        return courseRepository.findById(id)
                .orElseThrow(() -> new Exception("Course not found."));
    }

    // Get all courses a student is enrolled in
    public List<Course> getStudentCourses(User student) {
        return courseRepository.findAll()
                .stream()
                .filter(course -> course.getStudents().contains(student))
                .collect(Collectors.toList());
    }

    // Leave a course
    public Course leaveCourse(Long courseId, User student) throws Exception {
        Course course = getCourseById(courseId);

        Set<User> students = course.getStudents();
        if (!students.contains(student)) {
            throw new Exception("Student is not enrolled in this course.");
        }

        students.remove(student);
        course.setStudents(students);

        return courseRepository.save(course);
    }

    // Get course by code
    public Course getCourseByCode(String code) {
        return courseRepository.findByCode(code);
    }

    // Check if student is enrolled
    public boolean isStudentEnrolled(Course course, User student) {
        return course.getStudents().contains(student);
    }

    // Get total students enrolled in a course
    public int getStudentsCount(Course course) {
        return course.getStudents().size();
    }
}
