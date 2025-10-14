document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const searchInput = document.getElementById('search-courses');
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



    // Hide template card
    templateCard.style.display = 'none';

    async function fetchPublicCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            const response = await fetch('http://localhost:8081/api/courses/public', {
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
            card.querySelector('.course-progress').textContent = course.public ? 'Public' : 'Private';
            card.querySelector('.course-author').textContent = `By ${course.professorName}`;

            const viewBtn = card.querySelector('.view-button');
            viewBtn.onclick = () => {
                window.location.href = `/frontend/webpages/student-view-course.html?courseId=${course.id}`;
            };

            container.appendChild(card);
        });
        updateGreet();
    }

    // --- Search functionality ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(card => {
            const title = card.querySelector('.course-title').textContent.toLowerCase();
            const author = card.querySelector('.course-author').textContent.toLowerCase();
            card.style.display = title.includes(query) || author.includes(query) ? 'block' : 'none';
        });
    });

    fetchPublicCourses();
});
