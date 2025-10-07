document.addEventListener('DOMContentLoaded', async () => {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    if (!courseId) return console.error('No course ID provided in URL');

    const token = localStorage.getItem('token'); // JWT token for authentication
    if (!token) return console.error('No authentication token found. User might not be logged in.');

    // DOM elements
    const courseTitleEl = document.getElementById('course-title');
    const courseAuthorEl = document.getElementById('course-author');
    const courseStudentsEl = document.getElementById('course-students-count');
    const courseDescriptionEl = document.getElementById('course-description-text');
    const courseGifEl = document.querySelector('.gif-container img');
    const joinBtn = document.getElementById('join-course-btn');

    try {
        // Fetch course data from backend
        const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
            headers: {
                'Authorization': 'Bearer ' + token
            }
        });

        if (!response.ok) throw new Error(`Failed to fetch course. Status: ${response.status}`);

        const course = await response.json();

        // Populate course details
        courseTitleEl.textContent = course.title;
        courseAuthorEl.textContent = `By ${course.professorName}`;
        courseStudentsEl.textContent = `Students Joined: ${course.studentsCount || 0}`;
        courseDescriptionEl.textContent = course.description || 'No description available';

        // Set GIF
        courseGifEl.src = '/frontend/assets/images/join.gif';
        courseGifEl.alt = `GIF for ${course.title}`;

        // Join button logic
        if (course.isEnrolled) {
            joinBtn.style.display = 'none';
        } else {
            joinBtn.style.display = 'block';
            joinBtn.disabled = false; // ensure enabled
            joinBtn.addEventListener('click', async () => {
                joinBtn.disabled = true; // prevent double clicks
                try {
                    const joinResponse = await fetch(`http://localhost:8081/api/courses/${courseId}/join`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    });

                    if (!joinResponse.ok) {
                        const errorData = await joinResponse.json();
                        throw new Error(errorData.message || 'Failed to join course');
                    }

                    // Redirect to pre-assessment page
                    window.location.href = `/frontend/webpages/student-course-preassessment.html?courseId=${courseId}`;
                } catch (err) {
                    console.error('Error joining course:', err);
                    alert('Failed to join course. Please try again.');
                    joinBtn.disabled = false; // re-enable on error
                }
            });
        }

    } catch (err) {
        console.error('Error fetching course:', err);
        alert('Failed to load course. Please refresh the page.');
    }
});
