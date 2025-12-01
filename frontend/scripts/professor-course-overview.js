document.addEventListener('DOMContentLoaded', async () => {
    try {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');

        if (!courseId) {
            console.error('No course ID provided in URL');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            console.error('No auth token found. Please log in.');
            return;
        }

        const response = await fetch(`http://localhost:8081/api/courses/${courseId}/overview`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) throw new Error('Failed to fetch course overview');

        const course = await response.json();
        console.log(`Response: ${JSON.stringify(course, null, 2)}`);

        // Populate HTML
        document.getElementById('course-title').textContent = course.title;
        document.getElementById('course-description-text').textContent = course.description;
        document.getElementById('code-text').textContent = course.code || '-';
        document.getElementById('students-count').textContent = course.studentsCount ?? 0;
        document.getElementById('activities-count').textContent = course.activitiesCount ?? 0;

        // Copy code functionality
        const copyIcon = document.getElementById('copy-icon');
        const copyMessage = document.getElementById('copy-message');

        copyIcon.addEventListener('click', () => {
            if (!course.code) {
                copyMessage.textContent = 'No course code available.';
                copyMessage.style.color = 'red';
                setTimeout(() => copyMessage.textContent = '', 3000); // clear after 3 seconds
                return;
            }

            navigator.clipboard.writeText(course.code)
                .then(() => {
                    copyMessage.textContent = 'Course code copied!';
                    copyMessage.style.color = 'green';
                    copyMessage.style.textAlign = 'center';
                    setTimeout(() => copyMessage.textContent = '', 3000); // clear after 3 seconds
                })
                .catch(err => {
                    console.error('Failed to copy', err);
                    copyMessage.textContent = 'Failed to copy course code.';
                    copyMessage.style.color = 'red';
                    setTimeout(() => copyMessage.textContent = '', 3000);
                });
        });

        const courseAnalytics = document.getElementById('btn-course-analytics');

        courseAnalytics.onclick = () => {
            window.location.href = `/frontend/webpages/professor-course-analytics.html?courseId=${courseId}`;
        };

        } catch (error) {
            console.error('Error fetching course overview:', error);
        }
    });
