document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No authentication token found.');

    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('empty-state'); // greet message

    // --- Fetch current user ---
    async function fetchCurrentUser() {
        try {
            const response = await fetch('http://localhost:8081/api/users/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);

            const user = await response.json();
            sessionStorage.setItem('studentName', user.name);
            return user;
        } catch (err) {
            console.error('Error fetching user:', err);
            return { firstName: 'Student', lastName: '' };
        }
    }

    const startWelcomeGreet = () => {
    overlay.classList.remove('show');
    document.body.style.overflow = ''; // restore scrolling
    document.getElementById('welcome-text').textContent = `Welcome, `;
    document.getElementById('student-name').textContent = studentName;
    document.getElementById('greet-msg').textContent = `Ready to start your coding journey? Let's make today count!`;

    const waveEmoji = document.getElementById('wave-emoji');
    waveEmoji.style.opacity = '1';
    waveEmoji.style.display = 'inline-block';
    waveEmoji.classList.add('wave-animation');
    };

    function showWelcomeOverlay(studentName) {
    const isNewUser = localStorage.getItem('isNewUser');
    if (isNewUser !== 'true') return false;

    const overlay = document.getElementById('welcome-overlay');
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden'; // prevent background scrolling

    // Overlay text
    document.getElementById('overlay-title').textContent = `Welcome to CodeCampus! 🎉`;
    document.getElementById('overlay-message').textContent =
        `Hello ${studentName}, your account has been successfully created. Let’s jump in and start your coding journey!`;

    // Function to show welcome greet (typing or static)
    const showWelcomeGreet = () => {
        overlay.classList.remove('show');
        document.body.style.overflow = ''; // restore scrolling
        typeWelcomeMessage(studentName, false); // call your typing function
    };

    // Attach to buttons, passing studentName
    document.getElementById('go-dashboard-btn').onclick = showWelcomeGreet;
    document.getElementById('close-overlay').onclick = showWelcomeGreet;

    document.getElementById('see-courses-btn').onclick = () => {
        overlay.classList.remove('show');
        document.body.style.overflow = '';
        window.location.href = '/frontend/webpages/student-join-course.html';
    };

    localStorage.removeItem('isNewUser');
    return true;
}


    // --- Type welcome message ---
    async function typeWelcomeMessage(studentName, isNew) {
        const welcomeTextEl = document.getElementById('welcome-text');
        const studentNameEl = document.getElementById('student-name');
        const waveEmoji = document.getElementById('wave-emoji');
        const greetMsgEl = document.getElementById('greet-msg');

        const showWelcome = sessionStorage.getItem('showWelcome');
        studentName = (studentName && studentName.trim()) || "Student";
        const welcomeMessage = showWelcome ? ` Welcome, ` : ` Welcome back, `;
        const greetMessage = showWelcome
            ? `Ready to start your coding journey? Let's make today count!`
            : `Ready to continue your coding journey? Let's make today count!`;

        // Reset content
        welcomeTextEl.textContent = '';
        studentNameEl.textContent = '';
        greetMsgEl.textContent = '';
        waveEmoji.style.opacity = '0';
        waveEmoji.style.display = 'none';

        const typingSpeed = 100;
        const greetSpeed = 40;

        function typeText(element, text, speed) {
            return new Promise(resolve => {
                let i = 0;
                const interval = setInterval(() => {
                    if (i < text.length) {
                        element.textContent += text.charAt(i);
                        i++;
                    } else {
                        clearInterval(interval);
                        resolve();
                    }
                }, speed);
            });
        }

        await typeText(welcomeTextEl, welcomeMessage, typingSpeed);
        await typeText(studentNameEl, studentName, typingSpeed);

        waveEmoji.classList.remove('wave-animation');
        void waveEmoji.offsetWidth;
        waveEmoji.style.opacity = '1';
        waveEmoji.style.display = 'inline-block';
        waveEmoji.classList.add('wave-animation');

        await typeText(greetMsgEl, greetMessage, greetSpeed);
    }

    // --- Fetch student stats ---
    async function fetchStudentStats() {
        try {
            const response = await fetch('http://localhost:8081/api/student/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) throw new Error(`Failed to fetch student stats: ${response.status}`);

            const stats = await response.json();
            document.getElementById('total-courses').textContent = stats.totalCourses;
            document.getElementById('completed-activities').textContent = stats.completedActivities;
            document.getElementById('total-achievements').textContent = stats.totalAchievements;
            document.getElementById('streak-days').textContent = stats.streakDays;
        } catch (err) {
            console.error('Error fetching student stats:', err);
        }
    }

    // --- Update greet message ---
    function updateGreet() {
        const courses = container.querySelectorAll('.course-card');
        const template = container.querySelector('.course-card-template');
        const actualCourses = Array.from(courses).filter(card => card !== template);
        noCoursesMessage.style.display = actualCourses.length > 0 ? 'none' : 'block';
    }

    // --- Fetch student courses ---
    async function fetchStudentCourses() {
        try {
            const response = await fetch('http://localhost:8081/api/student/enrollments/my-courses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);

            const courses = await response.json();
            displayCourses(courses);
        } catch (err) {
            console.error('Error fetching enrolled courses:', err);
        }
    }

    // --- Display courses ---
    function displayCourses(courses) {
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(c => c.remove());

        courses.forEach(course => {
            const card = templateCard.cloneNode(true);
            card.style.display = 'block';

            const titleEl = card.querySelector('.course-title');
            titleEl.textContent = course.title;
            titleEl.setAttribute('data-fulltitle', course.title);
            titleEl.setAttribute('data-tooltip', course.title);

            card.querySelector('.course-author').textContent = `By ${course.professorName}`;
            card.querySelector('.course-progress').textContent = `Progress: 0%`;

            const img = card.querySelector('img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            const btn = card.querySelector('button');
            btn.textContent = 'Continue';

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

    // --- Initialize page ---
    const user = await fetchCurrentUser();
    const studentName = user.name || 'Student';
    const isNew = showWelcomeOverlay(studentName); // shows overlay if new
    if (!isNew) typeWelcomeMessage(studentName, false); // if not new, start typing immediately
    fetchStudentStats();
    fetchStudentCourses();
});
