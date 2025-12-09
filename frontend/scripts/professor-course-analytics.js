const API_BASE_URL = 'http://localhost:8081';
let courseId = null;

// Get course ID from URL
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

//SUMMARY CARDS DOM
const totalStudents = document.getElementById('total-students');
const avgPreassessment = document.getElementById('avg-preassessment');
const courseCompletion = document.getElementById('course-completion');

//ACTIVITY COMPLETION DOM
const activityTableBody = document.getElementById('activity-table-body');

//LEADERBOARD DOM
const leaderboardBody = document.getElementById('leaderboard-body');

//SUBMISSION PATTERN DOM
const submissionPattern = document.getElementById('time-range');

document.addEventListener('DOMContentLoaded', () => {
    courseId = getCourseIdFromURL();
    if (!courseId) return console.error("Course ID not found in URL.");

    loadCourseAnalytics(courseId);
});

// FETCH COURSE ANALYTICS
async function loadCourseAnalytics(courseId) {
    try {
        const token = localStorage.getItem('token');

        if (!token) {
            console.error("No token found.");
            return;
        }

        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/analytics`, {
            headers: { "Authorization": "Bearer " + token }
        });

        if (!response.ok) throw new Error("Failed to fetch analytics.");

        const data = await response.json();
        renderCourseAnalytics(data);

    } catch (error) {
        console.error(error);
    }
}

// RENDER ALL ANALYTICS
function renderCourseAnalytics(data) {

    //SUMMARY CARDS
    totalStudents.textContent = data.totalStudents;
    avgPreassessment.textContent = data.averagePreAssessment.toFixed(1) + "%";
    courseCompletion.textContent = data.courseCompletionRate.toFixed(1) + "%";

    //ACTIVITY COMPLETION TABLE
    renderActivityCompletion(data.activityCompletions);

    //LEADERBOARD 
    renderLeaderboard(data.leaderboard);

    //SUBMISSION TIME PATTERN
    submissionPattern.textContent = data.mostCommonSubmissionTimeRange;
}

// ACTIVITY COMPLETION TABLE
function renderActivityCompletion(activityList) {
    activityTableBody.innerHTML = ""; // clear placeholder row

    activityList.forEach(activity => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${activity.activityTitle}</td>
            <td>${activity.completedBy} / ${activity.totalStudents}</td>
            <td>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${activity.progressRate}%"></div>
                </div>
                <span class="progress-text">${activity.progressRate.toFixed(1)}%</span>
            </td>
        `;

        activityTableBody.appendChild(row);
    });
}

// LEADERBOARD TABLE
function renderLeaderboard(list) {
    leaderboardBody.innerHTML = ""; // clear placeholder row

    list.forEach((student, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.studentName}</td>
            <td>${student.activitiesDone}</td>
        `;

        leaderboardBody.appendChild(row);
    });
}
