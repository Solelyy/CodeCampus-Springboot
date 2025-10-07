package com.codecampus.repository;

import com.codecampus.model.Course;
import com.codecampus.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course,Long> {
    List <Course> findByProfessor(User professor);
    List <Course> findByIsPublicTrue();
    List <Course> findByProfessorAndIsPublicFalse(User professor);
    Course findByCode(String code);
}
