document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No authentication token found.');

    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('greet');

    function updateGreet() {
        const courses = container.querySelectorAll('.course-card');
        const template = container.querySelector('.course-card-template');
        const actualCourses = Array.from(courses).filter(card => card !== template);

        if (actualCourses.length > 0) {
            noCoursesMessage.style.display = 'none'; // hide message
        } else {
            noCoursesMessage.style.display = 'block'; // show message
        }
    }

    async function fetchStudentCourses() {
        try {
            const response = await fetch('http://localhost:8081/api/enrollments/my-courses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);

            const courses = await response.json();
            console.log('Fetched courses:', courses);
            displayCourses(courses);
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
        }
    }

    function displayCourses(courses) {
        // Remove old cards except template
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(c => c.remove());

        courses.forEach(course => {
            const card = templateCard.cloneNode(true);
            card.style.display = 'block'; // make it visible

            card.querySelector('.course-title').textContent = course.title;
            card.querySelector('.course-author').textContent = `By ${course.professorName}`;
            card.querySelector('.course-progress').textContent = `Progress: 0%`;

            const img = card.querySelector('img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            const btn = card.querySelector('button');
            btn.textContent = 'Continue';

            // ✅ Decide destination based on pre-assessment status
            if (course.preAssessmentCompleted) {
                btn.onclick = () => {
                window.location.href = `/frontend/webpages/student-course-overview.html?courseId=${course.id}`;
            };
        } else {
            btn.onclick = () => {
                window.location.href = `/frontend/webpages/student-course-preassessment.html?courseId=${course.id}`;
            };
        }

            container.appendChild(card);
        });

        updateGreet();
    }

    fetchStudentCourses();
});
