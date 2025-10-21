document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const searchInput = document.getElementById('search-courses');
    const noCoursesMessage = document.getElementById('empty-state-public-courses');

    templateCard.style.display = 'none';

    const noResultMsg = document.createElement('p');
    noResultMsg.textContent = "No courses found.";
    noResultMsg.style.display = 'none';
    noResultMsg.style.color = '#666';
    noResultMsg.style.fontStyle = 'italic';
    noResultMsg.style.marginTop = '10px';
    container.parentNode.insertBefore(noResultMsg, container.nextSibling);

    // --- Modal / Join Private Course ---
    const joinBtn = document.getElementById("join-course-btn");
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("join-modal");
    const submitBtn = document.getElementById("join-course-submit");
    const courseCodeInput = document.getElementById("course-code");

    joinBtn.addEventListener("click", () => {
        overlay.style.display = "block";
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    submitBtn.addEventListener("click", () => {
        const code = courseCodeInput.value.trim();
        if (code) {
            alert(`You entered code: ${code}`);
        } else {
            alert("Please enter a course code.");
        }
    });

    async function fetchPublicCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            const response = await fetch('http://localhost:8081/api/courses/public', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);
            const courses = await response.json();
            displayCourses(courses);
        } catch (error) {
            console.error('❌ Error fetching courses:', error);
        }
    }

    function displayCourses(courses) {
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(c => c.remove());

        if (courses.length === 0) {
            noCoursesMessage.style.display = 'block';
            return;
        } else {
            noCoursesMessage.style.display = 'none';
        }

        courses.forEach(course => {
            const card = templateCard.cloneNode(true);
            card.classList.remove('course-card-template');
            card.style.display = 'flex';

            card.querySelector('.course-image-container img').src = '/frontend/assets/images/java.png';
            card.querySelector('.course-image-container img').alt = course.title;
            card.querySelector('.course-title').textContent = course.title;
            card.querySelector('.course-title').setAttribute('data-tooltip', course.title);
            card.querySelector('.course-progress').textContent = course.public ? 'Public' : 'Private';
            card.querySelector('.course-author').textContent = `By ${course.professorName}`;
            card.querySelector('.view-button').onclick = () => {
                window.location.href = `/frontend/webpages/student-view-course.html?courseId=${course.id}`;
            };

            container.appendChild(card);
        });
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const courses = container.querySelectorAll('.course-card:not(.course-card-template)');
        let anyVisible = false;

        courses.forEach(card => {
            const title = card.querySelector('.course-title').textContent.toLowerCase();
            const author = card.querySelector('.course-author').textContent.toLowerCase();
            if (title.includes(query) || author.includes(query)) {
                card.style.display = 'flex';
                anyVisible = true;
            } else {
                card.style.display = 'none';
            }
        });

        noResultMsg.style.display = query !== '' && !anyVisible ? 'block' : 'none';
    });

    fetchPublicCourses();
});
