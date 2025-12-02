document.addEventListener('DOMContentLoaded', async () => {

    function getAuthToken() {
        return localStorage.getItem("token");
    }

    try {
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get('courseId');

        if (!courseId) {
            console.error('No course ID provided in URL');
            return;
        }

        const token = getAuthToken();
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
        console.log("Response:", course);

        // Populate HTML
        document.getElementById('course-title').textContent = course.title;
        document.getElementById('course-description-text').textContent = course.description;
        document.getElementById('code-text').textContent = course.code || '-';
        document.getElementById('students-count').textContent = course.studentsCount ?? 0;
        document.getElementById('activities-count').textContent = course.activitiesCount ?? 0;

        // Show/hide View Students feature
        const viewStudents = document.getElementById('view-students');
        viewStudents.style.display = 'none'; // hide by default

        try {
            const accessResponse = await fetch(`http://localhost:8081/api/courses/${courseId}/public`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!accessResponse.ok) throw new Error('Failed to fetch course access info');

            const access = await accessResponse.json();
            console.log('Course access:', access);

            if (access.isPublic === false) {  // private course
                viewStudents.style.display = 'inline';
            } else { // public course
                viewStudents.style.display = 'none';
            }

        } catch (error) {
            console.error('Error fetching course access info:', error);
        }

        // Click redirect
        viewStudents.onclick = () => {
            window.location.href = `/frontend/webpages/professor-view-students.html?courseId=${courseId}`;
        };

        // Copy code functionality
        const copyIcon = document.getElementById('copy-icon');
        const copyMessage = document.getElementById('copy-message');

        copyIcon.addEventListener('click', () => {
            if (!course.code) {
                copyMessage.textContent = 'No course code available.';
                copyMessage.style.color = 'red';
                setTimeout(() => copyMessage.textContent = '', 3000);
                return;
            }

            navigator.clipboard.writeText(course.code)
                .then(() => {
                    copyMessage.textContent = 'Course code copied!';
                    copyMessage.style.color = 'green';
                    copyMessage.style.textAlign = 'center';
                    setTimeout(() => copyMessage.textContent = '', 3000);
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
