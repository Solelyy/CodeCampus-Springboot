document.addEventListener('DOMContentLoaded', async () => {
    const courseId = new URLSearchParams(window.location.search).get('courseId');
    if (!courseId) return console.error('No course ID provided in URL');

    const token = localStorage.getItem('token');
    if (!token) return console.error('No authentication token found. User might not be logged in.');

    const courseTitleEl = document.getElementById('course-title');
    const courseAuthorEl = document.getElementById('course-author');
    const courseStudentsEl = document.getElementById('course-students-count');
    const courseDescriptionEl = document.getElementById('course-description-text');
    const courseGifEl = document.querySelector('.gif-container img');
    const joinBtn = document.getElementById('join-course-btn');

    try {
        const response = await fetch(`http://localhost:8081/api/courses/${courseId}`, {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error(`Failed to fetch course. Status: ${response.status}`);

        const course = await response.json();
        console.log('Fetched course:', course); // <-- add this
        console.log('enrolled value:', course.enrolled); 

        courseTitleEl.textContent = course.title;
        courseAuthorEl.textContent = `By ${course.professorName}`;
        courseStudentsEl.textContent = `Students Joined: ${course.studentsCount || 0}`;
        courseDescriptionEl.textContent = course.description || 'No description available';

        courseGifEl.src = '/frontend/assets/images/join.gif';
        courseGifEl.alt = `GIF for ${course.title}`;

        // --- FIXED: disable button if already enrolled ---
        if (course.enrolled) {
            joinBtn.textContent = "Already Joined";
            joinBtn.disabled = true;
            joinBtn.classList.add('disabled'); // optional, for styling
            console.log("Student is already enrolled"); // confirm in console
        } else {
            joinBtn.textContent = "Join Course";
            joinBtn.disabled = false;

            joinBtn.addEventListener('click', async () => {
                joinBtn.disabled = true;

                try {
                    const joinResponse = await fetch(`http://localhost:8081/api/courses/${courseId}/join`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + token
                        }
                    });

                    if (!joinResponse.ok) {
                        const errorText = await joinResponse.text();
                        throw new Error(errorText || 'Failed to join course');
                    }

                    // Successfully joined
                    joinBtn.textContent = "Already Joined";
                    joinBtn.disabled = true;
                    window.location.href = `/frontend/webpages/student-course-welcome.html?courseId=${courseId}`;
                } catch (err) {
                    console.error('Error joining course:', err);
                    alert(err.message || 'Failed to join course. Please try again.');
                    joinBtn.disabled = false;
                }
            });
        }

    } catch (err) {
        console.error('Error fetching course:', err);
        alert('Failed to load course. Please refresh the page.');
    }
});
