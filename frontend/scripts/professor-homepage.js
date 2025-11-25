document.addEventListener('DOMContentLoaded', async () => {
    localStorage.removeItem('professorName');
    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('empty-state'); // greet message

    // --- Fetch professor stats ---
    async function fetchProfessorStats() {
        try {
            const token = localStorage.getItem('token');
            if (!token) return;

            const response = await fetch('http://localhost:8081/api/professor/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch professor stats: ${response.status}`);

            const stats = await response.json();

            document.getElementById('total-courses-created').textContent = stats.totalCoursesCreated || 0;
            document.getElementById('total-students').textContent = stats.totalStudents || 0;
            document.getElementById('total-activities').textContent = stats.totalActivities || 0;
            document.getElementById('achievements').textContent = stats.achievements || 0;

        } catch (err) {
            console.error('Error fetching professor stats:', err);
        }
    }

    // --- Fetch current user ---
    async function fetchCurrentUser() {
        try {
            const token = localStorage.getItem('token'); 
            const response = await fetch('http://localhost:8081/api/users/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch user: ${response.status}`);

            const user = await response.json();
            const fullName = user.name || 'Professor';
            sessionStorage.setItem('professorName', fullName);
            return user;
        } catch (err) {
            console.error('Error fetching user:', err);
            return { name: 'Professor' };
        }
    }

    // --- Show welcome overlay for new professors ---
    function showWelcomeOverlay(profName) {
        const isNewUser = localStorage.getItem('isNewUser');
        if (isNewUser !== 'true') return false;

        const overlay = document.getElementById('welcome-overlay');
        overlay.classList.add('show');
        document.body.style.overflow = 'hidden';

        document.getElementById('overlay-title').textContent = `Welcome to CodeCampus! 🎉`;
        document.getElementById('overlay-message').innerHTML = `
    Welcome aboard, Professor ${profName}! <br><br>

    You're now part of a vibrant community of innovators shaping the future of tech education.
    We're excited to see your ideas come to life and make an impact on the next generation of coders. 💡<br><br>

    Here on CodeCampus, you're not just creating coursework — you're building experiences,
    sparking curiosity, and inspiring learners to grow every day.<br><br>

    Need help getting started? We’ve prepared a quick guide just for you.
`;

        localStorage.removeItem('isNewUser');
        return true;
    }

    // --- Type welcome message ---
    async function typeWelcomeMessage(profName, isNew = false) {
        const welcomeTextEl = document.getElementById('welcome-text');
        const profNameEl = document.getElementById('student-name'); // same ID as student page
        const waveEmoji = document.getElementById('wave-emoji');

        profName = `Prof. ` + (profName && profName.trim()) || "Professor";

        const welcomeMessage = isNew ? ` Welcome, ` : ` Welcome back, `;
        const greetMessage = isNew
            ? `Ready to contribute and motivate others? Let's make today count!`
            : `Continue to inspire, guide, and motivate students!`;

        // Reset elements
        welcomeTextEl.textContent = '';
        profNameEl.textContent = '';
        const greetMsgEl = document.getElementById('greet-msg');
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
        await typeText(profNameEl, profName, typingSpeed);

        waveEmoji.classList.remove('wave-animation');
        void waveEmoji.offsetWidth; // force reflow
        waveEmoji.style.opacity = '1';
        waveEmoji.style.display = 'inline-block';
        waveEmoji.classList.add('wave-animation');

        greetMsgEl.style.whiteSpace = 'pre-wrap'; // support multi-line
        await typeText(greetMsgEl, greetMessage, greetSpeed);
    }

    // --- Update no courses message ---
    function updateNoCoursesMessage() {
        const courses = container.querySelectorAll('.course-card');
        const template = container.querySelector('.course-card-template');
        const actualCourses = Array.from(courses).filter(card => card !== template);

        noCoursesMessage.style.display = actualCourses.length > 0 ? 'none' : 'block';
    }

    // --- Display courses ---
    function displayCourses(courses) {
        container.querySelectorAll('.course-card:not(.course-card-template)').forEach(card => card.remove());

        courses.forEach(course => {
            const card = templateCard.cloneNode(true);
            card.style.display = 'block';

            const img = card.querySelector('.course-image-container img');
            img.src = '/frontend/assets/images/java.png';
            img.alt = course.title;

            const titleEl = card.querySelector('.course-title');
            titleEl.textContent = course.title;
            titleEl.setAttribute('data-fulltitle', course.title);
            titleEl.setAttribute('data-tooltip', course.title);

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

    // --- Fetch professor courses ---
    async function fetchProfessorCourses() {
        try {
            const token = localStorage.getItem('token');
            if (!token) throw new Error('You must be logged in.');

            const response = await fetch('http://localhost:8081/api/courses/my-courses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });

            if (!response.ok) throw new Error(`Failed to fetch courses: ${response.status}`);

            const courses = await response.json();
            displayCourses(courses);

        } catch (error) {
            console.error('❌ Error fetching courses:', error);
        }
    }

    // --- Initialize page ---
    const user = await fetchCurrentUser();
    const profName = user.name || 'Professor';
    const isNew = showWelcomeOverlay(profName);

    if (isNew) {
        // Delay typing until overlay is closed
        const overlay = document.getElementById('welcome-overlay');
        const showWelcomeGreet = () => {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            typeWelcomeMessage(profName, true); // <-- pass true for new user
        };
        document.getElementById('go-dashboard-btn').onclick = showWelcomeGreet;
        document.getElementById('help-faqs-btn').onclick = () => {
            overlay.classList.remove('show');
            document.body.style.overflow = '';
            window.location.href = '/frontend/webpages/professor-help-faqs.html';
        };
    } else {
        typeWelcomeMessage(profName, false); // <-- pass false for returning professor
    }

    fetchProfessorStats();
    fetchProfessorCourses();
});
