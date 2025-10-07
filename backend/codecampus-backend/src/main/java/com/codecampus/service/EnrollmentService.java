package com.codecampus.service;

import com.codecampus.model.Course;
import com.codecampus.model.User;
import com.codecampus.repository.CourseRepository;
import com.codecampus.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class EnrollmentService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;

    public EnrollmentService(CourseRepository courseRepository, UserRepository userRepository) {
        this.courseRepository = courseRepository;
        this.userRepository = userRepository;
    }

    // 1. Enroll a student by course code
    public Course enrollStudent(String code, User student) throws Exception {
        Course course = courseRepository.findByCode(code);
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

    // 2. Get all courses a student is enrolled in
    public List<Course> getStudentCourses(User student) {
        return courseRepository.findAll()
                .stream()
                .filter(course -> course.getStudents().contains(student))
                .collect(Collectors.toList());
    }

    // 3. Optional: leave a course
    public Course leaveCourse(Long courseId, User student) throws Exception {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new Exception("Course not found."));

        Set<User> students = course.getStudents();
        if (!students.contains(student)) {
            throw new Exception("Student is not enrolled in this course.");
        }

        students.remove(student);
        course.setStudents(students);

        return courseRepository.save(course);
    }
}

