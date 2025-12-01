document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded for student-course-overview');

    const courseId = new URLSearchParams(window.location.search).get('courseId');
    console.log('Course ID from URL:', courseId);
    if (!courseId) return console.error('❌ No course ID provided in URL');

    const token = localStorage.getItem('token');
    console.log('JWT Token:', token);
    if (!token) return console.error('❌ No authentication token found. User might not be logged in.');

    // DOM elements
    const courseTitleEl = document.getElementById('course-title');
    const courseDescriptionEl = document.getElementById('course-description-text');
    const startActivityBtn = document.getElementById('start-activity-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    // Debug: detailed element check
    const elements = {
        'course-title': courseTitleEl,
        'course-description-text': courseDescriptionEl,
        'start-activity-btn': startActivityBtn,
        'view-leaderboard-btn': viewLeaderboardBtn
    };

    const missing = Object.entries(elements)
        .filter(([key, el]) => !el)
        .map(([key]) => key);

    if (missing.length > 0) {
        console.error(`Missing DOM elements: ${missing.join(', ')}`);
        console.log('Current body HTML:', document.body.innerHTML);
        return;
    }

    try {
        const response = await fetch(`http://localhost:8081/api/student/courses/${courseId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        console.log('Fetch response:', response);

        if (!response.ok) throw new Error(`Failed to fetch course. Status: ${response.status}`);

        const course = await response.json();
        console.log('Fetched course object:', course);

        // Populate course detailsl
        courseTitleEl.textContent = course.title || 'No Title';
        courseDescriptionEl.textContent = course.description || 'No description available';

        // Setup buttons
        startActivityBtn.onclick = () => {
            window.location.href = `/frontend/webpages/student-course-activities.html?courseId=${courseId}`;
        };
        viewLeaderboardBtn.onclick = () => {
            window.location.href = `/frontend/webpages/student-course-leaderboard.html?courseId=${courseId}`;
        };

    } catch (err) {
        console.error('❌ Error fetching course:', err);
        alert('Failed to load course overview. Please refresh the page.');
    }
});
