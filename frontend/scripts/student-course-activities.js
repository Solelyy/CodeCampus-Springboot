const API_BASE_URL = 'http://localhost:8081';
let courseId = null;
let activities = [];

// Always get courseId from URL
function getCourseIdFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('courseId');
}

// Always link course tabs dynamically
function setupCourseTabs(courseId) {
    const tabs = {
        'tab-overview': '/frontend/webpages/student-course-overview.html',
        'tab-activities': '/frontend/webpages/student-course-activities.html',
        'tab-leaderboard': '/frontend/webpages/student-course-leaderboard.html',
        'tab-announcement': '/frontend/webpages/student-course-announcement.html'
    };

    Object.entries(tabs).forEach(([id, path]) => {
        const tab = document.getElementById(id);
        if (tab) {
            tab.onclick = () => {
                // Even if courseId is null, it won’t break — it just won’t append anything
                const targetUrl = courseId
                    ? `${path}?courseId=${courseId}`
                    : path;
                window.location.href = targetUrl;
            };
        }
    });
}

// Get JWT token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Fetch activities
async function fetchCourseActivities() {
    courseId = getCourseIdFromURL();
    setupCourseTabs(courseId); // run this immediately regardless

    const token = getAuthToken();

    if (!courseId) {
        console.warn('⚠️ No course ID found in URL. Tabs initialized, but skipping activity fetch.');
        return;
    }
    if (!token) {
        console.error('❌ No auth token found');
        return alert('Please log in.');
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/student/courses/${courseId}/activities`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) throw new Error('Failed to fetch activities');

        activities = await res.json();
        renderActivities();
    } catch (err) {
        console.error('❌ Error fetching activities:', err);
        alert('Error fetching activities. Please try again.');
    }
}

// Render activity cards
function renderActivities() {
    const container = document.querySelector('.activities');
    if (!container) return;

    container.innerHTML = '';

    activities.forEach((activity) => {
        const card = document.createElement('div');
        card.className = 'activity-card';
        if (!activity.unlocked) card.classList.add('locked');

        // Points based on difficulty
        let points = 0;
        switch (activity.difficulty.toLowerCase()) {
            case 'easy':
            case 'essay': points = 10; break;
            case 'medium': points = 20; break;
            case 'hard': points = 30; break;
        }

        card.innerHTML = `
            <p class="activity-title">${activity.title}</p>
            <p class="activity-points">Points: ${points}</p>
            <p class="activity-status">
                ${activity.completed ? '✅ Completed' : activity.unlocked ? '🔓 Unlocked' : '🔒 Locked'}
            </p>
        `;

        card.addEventListener('click', () => {
            if (!activity.unlocked) {
                showLockedModal();
                return;
            }
            window.location.href = `/frontend/webpages/student-course-challenge.html?activityId=${activity.id}&courseId=${courseId}`;
        });

        container.appendChild(card);
    });
}

// Locked modal
function showLockedModal() {
    let modal = document.querySelector('#locked-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'locked-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <p>You need to finish the previous activity first!</p>
                <button id="close-modal-btn">OK</button>
            </div>
        `;
        document.body.appendChild(modal);
        document.querySelector('#close-modal-btn').addEventListener('click', () => modal.style.display = 'none');
        modal.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
    }
    modal.style.display = 'flex';
}

// Initialize
window.addEventListener('DOMContentLoaded', fetchCourseActivities);
