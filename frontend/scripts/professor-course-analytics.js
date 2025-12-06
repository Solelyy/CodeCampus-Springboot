const API_BASE_URL = 'http://localhost:8081';
let courseId = null;

function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

//Summary cards
const totalStudents = document.getElementById('total-students');
const avgPreassessment = document.getElementById('avg-preassessment');
const courseCompletion = document.getElementById('course-completion');

//Activity Completion Overview
const activityCompletionTbl = document.getElementById('activity-table-body');
const activityTitle = document.getElementById('activity-title');
const activityStudents = document.getElementById('activity-total-students');
const activityProgress = document.getElementById('activity-progress');

document.addEventListener('DOMContentLoaded', () => {
    courseId = getCourseIdFromURL();
    if (!courseId) console.error("Coursee ID not found.");
    loadCourseAnalytics(courseId);
});

//fetch course analytics from the backend
async function loadCourseAnalytics(courseId) {
    try {
        const token = localStorage.getItem('token');

        if (!token) console.error('No token found.');
        else console.log('Token found: ' + token);

        //Fetch analytics
        const response = await fetch(`${API_BASE_URL}/api/`, {
            headers: { 'Authorization': 'Bearer ' + token}
        });
        if (!response.ok) throw new Error (`Failed to fetch course analytics: ${response.status}`);

        const analytics = await response.json();

        renderCourseAnalytics();
    } catch (error) {
        console.error(error)
    }
}

//render course analytics
function renderCourseAnalytics(data) {
    //summary
    totalStudents.textContent = `${data.totalStudents}`;
    avgPreassessment.textContent = `${data.avgPreassessment}`;
    courseCompletion.textContent = `${data.courseCompletion}`;


}