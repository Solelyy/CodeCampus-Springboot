import { initJoinCourseModal } from './join-course-btn.js';

document.addEventListener('DOMContentLoaded', () => {
    const unjoinedContainer = document.getElementById('unjoined-courses-container');
    const joinedContainer = document.getElementById('joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const searchInput = document.getElementById('search-courses');
    const noCoursesMessage = document.getElementById('empty-state-public-courses');

    templateCard.style.display = 'none';

    // --- No Results Message ---
    const noResultMsg = document.createElement('p');
    noResultMsg.textContent = "No courses found.";
    noResultMsg.style.display = 'none';
    noResultMsg.style.color = '#666';
    noResultMsg.style.fontStyle = 'italic';
    noResultMsg.style.marginTop = '10px';
    unjoinedContainer.parentNode.insertBefore(noResultMsg, unjoinedContainer.nextSibling);

     initJoinCourseModal();

    // --- Fetch and Display Public Courses ---
    async function fetchPublicCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            // Fetch public courses
            const publicResponse = await fetch('http://localhost:8081/api/courses/public', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!publicResponse.ok) throw new Error(`Failed to fetch public courses: ${publicResponse.status}`);
            const publicCourses = await publicResponse.json();

            // Fetch joined courses
            const joinedResponse = await fetch('http://localhost:8081/api/enrollments/my-courses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            let joinedCourses = [];
            if (joinedResponse.ok) {
                joinedCourses = await joinedResponse.json();
            }

            // Mark courses as joined
            const joinedIds = joinedCourses.map(c => c.id);
            publicCourses.forEach(course => {
                course.isJoined = joinedIds.includes(course.id);
            });

            displayCourses(publicCourses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        }
    }

    // --- Display Courses ---
    function displayCourses(courses) {
        [unjoinedContainer, joinedContainer].forEach(container => {
            container.querySelectorAll('.course-card:not(.course-card-template)').forEach(card => card.remove());
        });

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

            const img = card.querySelector('.course-image-container img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            const titleEl = card.querySelector('.course-title');
            titleEl.textContent = course.title;
            titleEl.setAttribute('data-tooltip', course.title);
            titleEl.style.marginBottom = '3px';

            const progressEl = card.querySelector('.course-progress');
            progressEl.textContent = course.public ? 'Public' : 'Private';

            const authorEl = card.querySelector('.course-author');
            authorEl.textContent = `By ${course.professorName}`;

            const btn = card.querySelector('.view-button');
            if (course.isJoined) {
                btn.textContent = "Joined";
                btn.disabled = true;
                joinedContainer.appendChild(card);
            } else {
                btn.textContent = "View";
                btn.disabled = false;
                btn.onclick = () => {
                    window.location.href = `/frontend/webpages/student-view-course.html?courseId=${course.id}`;
                };
                unjoinedContainer.appendChild(card);
            }
        });

        initializeDynamicTooltips();
    }

    // --- Search Filter ---
    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        const allCards = [
            ...document.querySelectorAll('#unjoined-courses-container .course-card:not(.course-card-template)'),
            ...document.querySelectorAll('#joined-courses-container .course-card:not(.course-card-template)')
        ];

        let anyVisible = false;

        allCards.forEach(card => {
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

    // --- Tooltip System ---
    function initializeDynamicTooltips() {
        let tooltip = document.querySelector('.dynamic-tooltip');
        if (!tooltip) {
            tooltip = document.createElement('div');
            tooltip.className = 'dynamic-tooltip';
            document.body.appendChild(tooltip);
        }

        const tooltipTargets = document.querySelectorAll('[data-tooltip]');
        tooltipTargets.forEach(el => {
            el.addEventListener('mouseenter', e => {
                tooltip.textContent = el.getAttribute('data-tooltip');
                tooltip.style.display = 'block';
                tooltip.style.opacity = '1';
                positionTooltip(e);
            });

            el.addEventListener('mousemove', e => positionTooltip(e));

            el.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
                tooltip.style.opacity = '0';
            });
        });

        function positionTooltip(e) {
            tooltip.style.left = `${e.pageX + 10}px`;
            tooltip.style.top = `${e.pageY - tooltip.offsetHeight - 10}px`;
        }
    }

    fetchPublicCourses();
});
