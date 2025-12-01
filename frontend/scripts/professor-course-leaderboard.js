console.log("professor-course-leaderboard.js loaded");

const API_BASE_URL = 'http://localhost:8081';
let courseId = null;

// Get courseId from URL query parameters
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

document.addEventListener('DOMContentLoaded', () => {
    courseId = getCourseIdFromURL();
    const tbody = document.getElementById('leaderboard-body');

    if (!courseId) {
        console.error('No courseId found in URL');
        tbody.innerHTML = `<tr><td colspan="5">Course ID not found</td></tr>`;
        return;
    }

    loadLeaderboard(courseId);
});

// Fetch leaderboard data from backend
async function loadLeaderboard(courseId) {
    const tbody = document.getElementById('leaderboard-body');
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No token found. User might not be logged in.');
            tbody.innerHTML = `<tr><td colspan="5">You are not logged in.</td></tr>`;
            return;
        } else {
            console.log("Token found:", token, "Role:", localStorage.getItem('role'));
        }

        // Fetch leaderboard
        const response = await fetch(`${API_BASE_URL}/api/courses/${courseId}/leaderboard`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch leaderboard: ${response.status}`);
        }

        const leaderboard = await response.json();

        document.querySelector('.leaderboard-desc').textContent = "Top students in this course ✨";

        // Fetch course title
        const res = await fetch(`${API_BASE_URL}/api/courses/${courseId}/overview`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error(`Failed to fetch course title: ${res.status}`);
        }

        const courseData = await res.json();
        document.getElementById('course-title').textContent = courseData.title;

        renderLeaderboard(leaderboard);
    } catch (error) {
        console.error(error);
        tbody.innerHTML = `<tr><td colspan="5">Failed to load leaderboard</td></tr>`;
    }
}

// Render leaderboard table
function renderLeaderboard(data) {
    const tbody = document.getElementById('leaderboard-body');
    tbody.innerHTML = ''; // clear previous rows

    if (!Array.isArray(data) || data.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5">No students found</td></tr>`;
        return;
    }

    data.forEach((student, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td>${student.studentName || '-'}</td>
            <td>${student.totalPoints ?? '-'}</td>
            <td>${student.activitiesDone ?? '-'}</td>
            <td>${formatDateTime(student.lastCompleted)}</td>
        `;

        tbody.appendChild(row);
    });
}

// Format ISO date/time into local readable format
function formatDateTime(dateTimeString) {
    if (!dateTimeString) return '-';
    const date = new Date(dateTimeString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleString();
}
