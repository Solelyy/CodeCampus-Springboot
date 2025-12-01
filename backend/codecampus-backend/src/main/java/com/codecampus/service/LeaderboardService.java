package com.codecampus.service;

import com.codecampus.dto.LeaderboardDTO;
import com.codecampus.model.Course;
import com.codecampus.model.CourseEnrollment;
import com.codecampus.model.StudentActivity;
import com.codecampus.model.User;
import com.codecampus.repository.CourseEnrollmentRepository;
import com.codecampus.repository.CourseRepository;
import com.codecampus.repository.StudentActivityRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class LeaderboardService {

    private final CourseEnrollmentRepository enrollmentRepo;
    private final StudentActivityRepository studentActivityRepo;
    private final CourseRepository courseRepository;

    public List<LeaderboardDTO> getLeaderboardForCourse(Long courseId) {

        // Step 1: fetch enrolled students
        List<CourseEnrollment> enrollments = enrollmentRepo.findByCourseId(courseId);
        List<User> students = new ArrayList<>();
        for (CourseEnrollment enrollment : enrollments) {
            students.add(enrollment.getStudent());
        }

        // Step 2: prepare leaderboard list
        List<LeaderboardDTO> leaderboard = new ArrayList<>();

        for (User student : students) {

            // fetch all activities of each student
            List<StudentActivity> activities = studentActivityRepo.findByStudent(student);

            // filter activities per course
            activities = activities.stream()
                    .filter(a -> a.getActivity().getCourse().getId().equals(courseId))
                    .collect(Collectors.toList());

            // calculate points, activitiesDone, lastCompleted
            int totalPoints = 0;
            int activitiesDone = activities.size();
            LocalDateTime lastCompleted = null;

            for (StudentActivity activity : activities) {
                totalPoints += activity.getEarnedPoints() != null ? activity.getEarnedPoints() : 0;

                LocalDateTime activityTime = LocalDateTime.ofInstant(
                        activity.getCreatedAt(), ZoneId.systemDefault());

                if (lastCompleted == null || activityTime.isAfter(lastCompleted)) {
                    lastCompleted = activityTime;
                }
            }

            // create DTO
            LeaderboardDTO dto = new LeaderboardDTO(
                    student.getId(),
                    student.getName(),
                    totalPoints,
                    activitiesDone,
                    lastCompleted
            );

            leaderboard.add(dto);
        }

        // Step 3: sort leaderboard by points descending, then lastCompleted ascending
        leaderboard.sort(Comparator
                .comparingInt(LeaderboardDTO::getTotalPoints).reversed()
                .thenComparing(LeaderboardDTO::getLastCompleted));

        return leaderboard;
    }
}
