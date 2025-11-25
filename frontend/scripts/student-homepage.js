document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No authentication token found.');

    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('empty-state'); //greet message

    async function fetchCurrentUser() {
    try {
        const response = await fetch('http://localhost:8081/api/users/me', {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);

        const user = await response.json();
        console.log('Fetched user:', user);

        const fullName = `${user.name}`;
        sessionStorage.setItem('studentName', fullName);

        return user;
    } catch (err) {
        console.error('Error fetching user:', err);
        return { firstName: 'Student', lastName: '' };
    }
}

async function typeWelcomeMessage(studentName) {
    const welcomeTextEl = document.getElementById('welcome-text');
    const studentNameEl = document.getElementById('student-name');
    const waveEmoji = document.getElementById('wave-emoji');

    studentName = (studentName && studentName.trim()) || "Student";
    const welcomeMessage = ` Welcome back, `;

    welcomeTextEl.textContent = '';
    studentNameEl.textContent = '';

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
    await typeText(studentNameEl, studentName);

    // Show waving emoji after typing
    waveEmoji.classList.remove('wave-animation'); // reset
    void waveEmoji.offsetWidth; // force reflow
    waveEmoji.style.opacity = '1'; // make visible
    waveEmoji.style.display = 'inline-block'; 
    waveEmoji.classList.add('wave-animation');    // start animation
}

    const user = await fetchCurrentUser();
    const firstName = `${user.firstName}`;
    typeWelcomeMessage(firstName);

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
            const response = await fetch('http://localhost:8081/api/student/enrollments/my-courses', {
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
            card.style.display = 'block'; 
            
            const titleEl = card.querySelector('.course-title');
            titleEl.textContent = course.title;

            //Tooltip addition
            titleEl.setAttribute('data-fulltitle', course.title);
            titleEl.setAttribute('data-tooltip', course.title); 
            console.log('Tooltip added for:', titleEl.textContent);

            card.querySelector('.course-author').textContent = `By ${course.professorName}`;
            card.querySelector('.course-progress').textContent = `Progress: 0%`;

            const img = card.querySelector('img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            const btn = card.querySelector('button');
            btn.textContent = 'Continue';

            // Decide destination based on pre-assessment status
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
        document.dispatchEvent(new Event('coursesRendered'));

    }

    fetchStudentCourses();
});
