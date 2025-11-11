document.addEventListener('DOMContentLoaded', async() => {
    localStorage.removeItem('professorName');
    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('empty-state'); //greet message
    const coursesContainer = document.querySelector('.joined-courses-container');

    async function fetchCurrentUser() {
    try {
        const token = localStorage.getItem('token'); 
        const response = await fetch('http://localhost:8081/api/users/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);

        const user = await response.json();
        console.log('Fetched user:', user);

        // Combine first and last name
        const fullName = `${user.firstName} ${user.lastName}`;
        sessionStorage.setItem('professorName', fullName);

        return user;
    } catch (err) {
        console.error('Error fetching user:', err);
        return { firstName: 'Professor', lastName: '' };
    }
}


    async function typeWelcomeMessage(profName) {
    const welcomeTextEl = document.getElementById('welcome-text');
    const profNameEl = document.getElementById('student-name');
    const waveEmoji = document.getElementById('wave-emoji');

    profName = (profName && profName.trim()) || "Professor";
    const welcomeMessage = ` Welcome back, `;

    welcomeTextEl.textContent = '';
    profNameEl.textContent = '';

    const typingSpeed = 100;

    // Helper to type text character by character
    function typeText(element, text) {
        return new Promise((resolve) => {
            let i = 0;
            const interval = setInterval(() => {
                if (i < text.length) {
                    element.textContent += text.charAt(i);
                    i++;
                } else {
                    clearInterval(interval);
                    resolve();
                }
            }, typingSpeed);
        });
    }

    // Type welcome message
    await typeText(welcomeTextEl, welcomeMessage);

    // Type student name
    await typeText(profNameEl, profName);

    // Show waving emoji after typing
    waveEmoji.classList.remove('wave-animation'); // reset
    void waveEmoji.offsetWidth; // force reflow
    waveEmoji.style.opacity = '1'; // make visible
    waveEmoji.style.display = 'inline-block'; 
    waveEmoji.classList.add('wave-animation');    // start animation
}

    const user = await fetchCurrentUser();
    const fullName = `${user.firstName} ${user.lastName}`;
    typeWelcomeMessage(fullName);


    // Function to update visibility
    function updateNoCoursesMessage() {
    const courses = container.querySelectorAll('.course-card');
    const template = container.querySelector('.course-card-template');
    const actualCourses = Array.from(courses).filter(card => card !== template);

    if (actualCourses.length > 0) {
        noCoursesMessage.style.display = 'none'; // hide message
    } else {
        noCoursesMessage.style.display = 'block'; // show message
    }
}


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

            const titleEl = card.querySelector('.course-title');
            titleEl.textContent = course.title;

            //Tooltip addition
            titleEl.setAttribute('data-fulltitle', course.title);
            titleEl.setAttribute('data-tooltip', course.title);
            console.log('Tooltip added for:', titleEl.textContent);


            card.querySelector('.course-progress').textContent = course.public ? 'Public' : 'Private';
            card.querySelector('.course-author').textContent = `By ${course.professorName}`;

            const manageBtn = card.querySelector('.manage-button');
            manageBtn.textContent = 'Manage';
            manageBtn.onclick = () => {
                window.location.href = `/frontend/webpages/professor-course-overview.html?courseId=${course.id}`;
            };

            container.appendChild(card);
        }); 
        updateNoCoursesMessage();
        document.dispatchEvent(new Event('coursesRendered'));
    }
    fetchProfessorCourses();
});
