document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');

    async function fetchProfessorCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            const response = await fetch('http://localhost:8081/api/courses/my-courses', {
                headers: {
                    'Authorization': 'Bearer ' + token
                }
            });

            if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);

            const courses = await response.json();
            displayCourses(courses);

        } catch (error) {
            console.error('❌ Error fetching courses:', error);
        }
    }

    function displayCourses(courses) {
        // Clear existing cards except the template
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(card => card.remove());

        courses.forEach(course => {
            const card = templateCard.cloneNode(true);
            card.style.display = 'block';

            // Set course image to java.png
            const img = card.querySelector('.course-image-container img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            card.querySelector('.course-title').textContent = course.title;
            card.querySelector('.course-progress').textContent = course.isPublic ? 'Public' : 'Private';
            card.querySelector('.course-author').textContent = `By ${course.professorName}`;

            const manageBtn = card.querySelector('.manage-button');
            manageBtn.textContent = 'Manage';
            manageBtn.onclick = () => {
                window.location.href = `/frontend/webpages/professor-manage-course.html?courseId=${course.id}`;
            };

            container.appendChild(card);
        });
    }

    fetchProfessorCourses();
});
