document.addEventListener('DOMContentLoaded', async () => {
    console.log('DOM loaded for student-course-overview');

    // Get courseId from URL
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    console.log('Course ID from URL:', courseId);
    if (!courseId) return console.error('No course ID provided in URL');

    const token = localStorage.getItem('token');
    console.log('JWT Token:', token);
    if (!token) return console.error('No authentication token found. User might not be logged in.');

    // Elements
    const courseDescriptionEl = document.getElementById('course-description-text');
    const startActivityBtn = document.getElementById('start-activity-btn');
    const viewLeaderboardBtn = document.getElementById('view-leaderboard-btn');

    try {
        // Fetch course details
        const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });
        console.log('Fetch response:', response);

        if (!response.ok) throw new Error(`Failed to fetch course. Status: ${response.status}`);

        const course = await response.json();
        console.log('Fetched course object:', course);

        // Fill course description
        courseDescriptionEl.textContent = course.description;
        courseDescriptionEl.previousElementSibling.textContent = course.title;

        // Update buttons to include courseId in the URL
        startActivityBtn.onclick = () => {
            window.location.href = `/frontend/webpages/student-course-activities.html?courseId=${courseId}`;
        };
        viewLeaderboardBtn.onclick = () => {
            window.location.href = `/frontend/webpages/student-course-leaderboard.html?courseId=${courseId}`;
        };

    } catch (err) {
        console.error('Error fetching course:', err);
        alert('Failed to load course overview. Please refresh the page.');
    }
});
