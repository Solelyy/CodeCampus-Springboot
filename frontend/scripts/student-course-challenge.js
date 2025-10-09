const API_BASE_URL = 'http://localhost:8081';

// ✅ Get token from localStorage
function getAuthToken() {
    return localStorage.getItem('token');
}

// ✅ Always get activityId & courseId from URL
function getParamsFromURL() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        activityId: urlParams.get('activityId'),
        courseId: urlParams.get('courseId')
    };
}

// ✅ Setup course tabs dynamically
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
                const targetUrl = courseId ? `${path}?courseId=${courseId}` : path;
                window.location.href = targetUrl;
            };
        }
    });
}

// ✅ Display challenge message
function displayMessage(title, message) {
    const titleEl = document.getElementById('challenge-title');
    const descEl = document.getElementById('challenge-description');

    if (titleEl) titleEl.textContent = title;
    if (descEl) descEl.textContent = message;
}

// ✅ Fetch specific challenge details
async function fetchChallengeDetails() {
    const { activityId, courseId } = getParamsFromURL();
    setupCourseTabs(courseId);

    const token = getAuthToken();

    if (!activityId) {
        console.warn('⚠️ No activityId found in URL.');
        displayMessage('Challenge not found', 'No challenge ID provided.');
        return;
    }

    if (!token) {
        console.error('❌ No auth token found');
        alert('Your session has expired. Please log in again.');
        window.location.href = '/frontend/webpages/login.html';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!res.ok) {
            switch (res.status) {
                case 403:
                    console.error('🚫 Forbidden - token invalid or insufficient role');
                    displayMessage('Access Denied', 'You are not authorized to view this challenge.');
                    break;
                case 404:
                    console.error('❌ Challenge not found');
                    displayMessage('Challenge not found', 'The requested challenge does not exist.');
                    break;
                default:
                    throw new Error(`Unexpected error: ${res.status}`);
            }
            return;
        }

        const challenge = await res.json();

        // ✅ Populate challenge details in HTML
        const titleEl = document.getElementById('challenge-title');
        const descEl = document.getElementById('challenge-description');
        const diffEl = document.getElementById('challenge-difficulty');
        const ptsEl = document.getElementById('challenge-points');

        if (titleEl) titleEl.textContent = challenge.title || 'Untitled Challenge';
        if (descEl) descEl.textContent = challenge.problemStatement || 'No description available.';
        if (diffEl) diffEl.textContent = challenge.difficulty || 'N/A';
        if (ptsEl) ptsEl.textContent = challenge.points != null ? challenge.points : 'N/A';

    } catch (err) {
        console.error('❌ Error fetching challenge:', err);
        displayMessage('Error loading challenge', 'Please try again later.');
    }
}

// ✅ Initialize on page load
window.addEventListener('DOMContentLoaded', fetchChallengeDetails);
