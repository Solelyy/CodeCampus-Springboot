package com.codecampus.repository;

import com.codecampus.model.Course;
import com.codecampus.model.CourseEnrollment;
import com.codecampus.model.User;
import com.codecampus.model.EnrollmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseEnrollmentRepository extends JpaRepository<CourseEnrollment, Long> {

    // Find all enrollments for a specific student
    List<CourseEnrollment> findByStudent(User student);

    // Find all enrollments for a specific course
    List<CourseEnrollment> findByCourseId(Long courseId);

    // Check if a student is enrolled in a course
    Optional<CourseEnrollment> findByStudentAndCourse(User student, Course course);

    // Find all active enrollments for a student
    List<CourseEnrollment> findByStudentAndStatus(User student, EnrollmentStatus status);

    // Count number of students enrolled in a course
    long countByCourse(Course course);

    // Count number of courses a student is enrolled in
    long countByStudent(User student);

    long countByStudent_Username(String username);

    long countByStudent_Id(Long studentId);

    // Optional: find all enrollments by course and status
    List<CourseEnrollment> findByCourseAndStatus(Course course, EnrollmentStatus status);
}
