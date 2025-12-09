package com.codecampus.service;
import com.codecampus.dto.*;
import com.codecampus.model.PreAssessmentQuestion;
import com.codecampus.model.StudentActivity;
import com.codecampus.model.StudentPreAssessment;
import com.codecampus.repository.CourseEnrollmentRepository;
import com.codecampus.repository.PreAssessmentQuestionRepository;
import com.codecampus.repository.StudentActivityRepository;
import com.codecampus.repository.StudentPreAssessmentRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@AllArgsConstructor
public class CourseAnalyticsService {

    private final CourseEnrollmentRepository courseEnrollmentRepository;
    private final StudentPreAssessmentRepository studentPreAssessmentRepository;
    private final StudentActivityRepository studentActivityRepository;
    private final PreAssessmentQuestionRepository preAssessmentQuestionRepository;

    private final ActivityCompletionService activityCompletionService;
    private final LeaderboardService leaderboardService;

    public CourseAnalyticsDTO getCourseAnalytics(long courseId) {

        // A. Total Students
        int totalStudents = courseEnrollmentRepository.countByCourseId(courseId);

        // B. Average Pre-Assessment Score
        List<PreAssessmentQuestion> questions =
                preAssessmentQuestionRepository.findByCourseId(courseId);

        int totalQuestions = questions.size();
        double averagePreAssessment = 0;

        if (totalQuestions > 0 && totalStudents > 0) {

            List<StudentPreAssessment> submissions =
                    studentPreAssessmentRepository.findByQuestionCourseId(courseId);

            Map<Long, List<StudentPreAssessment>> perStudent =
                    submissions.stream()
                            .collect(Collectors.groupingBy(s -> s.getStudent().getId()));

            double totalPercentages = 0;

            for (List<StudentPreAssessment> studentSubs : perStudent.values()) {

                int score = 0;

                for (StudentPreAssessment sub : studentSubs) {
                    String correct = sub.getQuestion().getCorrectAnswer();
                    if (correct != null && correct.equalsIgnoreCase(sub.getAnswer())) {
                        score++;
                    }
                }

                double percentage = ((double) score / totalQuestions) * 100;
                totalPercentages += percentage;
            }

            averagePreAssessment = perStudent.isEmpty()
                    ? 0
                    : totalPercentages / perStudent.size();
        }

        // C. Activity Completion (list)
        List<ActivityCompletionDTO> activityCompletions =
                activityCompletionService.getActivityCompletionByCourse(courseId);

        // D. Course Completion Rate
        //     → average of all activity completion percentages
        double courseCompletionRate = activityCompletions.isEmpty()
                ? 0
                : activityCompletions.stream()
                .mapToDouble(ActivityCompletionDTO::getProgressRate)
                .average()
                .orElse(0);

        // E. Leaderboard
        List<LeaderboardDTO> leaderboard =
                leaderboardService.getLeaderboardForCourse(courseId);

        // F. Most Common Submission Time Range
        List<StudentActivity> allActivities =
                studentActivityRepository.findByActivityCourseId(courseId);

        String mostCommonRange = computeMostCommonTimeRange(allActivities);

        // RETURN DTO
        return new CourseAnalyticsDTO(
                totalStudents,
                averagePreAssessment,
                courseCompletionRate,
                activityCompletions,
                leaderboard,
                mostCommonRange
        );
    }

    // Helper: compute common submission time range
    private String computeMostCommonTimeRange(List<StudentActivity> activities) {
        if (activities.isEmpty()) return "No data";

        int[] buckets = new int[8]; // 8 time ranges

        for (StudentActivity activity : activities) {
            int hour = LocalDateTime.ofInstant(
                    activity.getCreatedAt(), ZoneId.systemDefault()
            ).getHour();

            int bucketIndex = hour / 3; // 3-hour buckets
            buckets[bucketIndex]++;
        }

        int maxIndex = 0;
        for (int i = 1; i < 8; i++) {
            if (buckets[i] > buckets[maxIndex]) maxIndex = i;
        }

        String[] ranges = {
                "12:00 AM - 3:00 AM",
                "3:00 AM - 6:00 AM",
                "6:00 AM - 9:00 AM",
                "9:00 AM - 12:00 PM",
                "12:00 PM - 3:00 PM",
                "3:00 PM - 6:00 PM",
                "6:00 PM - 9:00 PM",
                "9:00 PM - 12:00 AM"
        };

        return ranges[maxIndex];
    }
}
