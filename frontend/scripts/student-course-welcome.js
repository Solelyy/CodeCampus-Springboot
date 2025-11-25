document.addEventListener('DOMContentLoaded', async () => {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    const token = localStorage.getItem('token');

    const courseNameEl = document.getElementById('course-name');
    const proceedBtn = document.getElementById('proceed-btn');

    // Proceed button behaviour (always set, even if fetch fails)
    proceedBtn.addEventListener('click', () => {
        if (courseId) {
            window.location.href = `/frontend/webpages/student-course-preassessment.html?courseId=${courseId}`;
        } else {
            window.location.href = '/frontend/webpages/student-course-preassessment.html';
        }
    });

    // If no courseId or no token, show fallback text and skip fetch
    if (!courseId) {
        console.warn('No course ID in URL — showing default course name');
        courseNameEl.textContent = 'Course';
        return;
    }
    if (!token) {
        console.warn('No auth token found — cannot fetch course title');
        courseNameEl.textContent = 'Course';
        return;
    }

    // Fetch course and set name
    try {
        const res = await fetch(`http://localhost:8081/api/student/courses/${courseId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!res.ok) {
            console.error('Failed to fetch course. Status:', res.status);
            courseNameEl.textContent = 'Course';
            return;
        }

        const course = await res.json();
        courseNameEl.textContent = course.title || 'Course';
    } catch (err) {
        console.error('Error fetching course:', err);
        courseNameEl.textContent = 'Course';
    }
});
