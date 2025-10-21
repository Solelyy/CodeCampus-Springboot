document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (!token) return console.error('No authentication token found.');

    const container = document.querySelector('.joined-courses-container');
    const templateCard = document.querySelector('.course-card-template');
    const noCoursesMessage = document.getElementById('empty-state'); //greet message

    // Typing Animation for Welcome Banner
    async function typeWelcomeMessage() {
        const welcomeTextEl = document.getElementById('welcome-text');
        const studentNameEl = document.getElementById('student-name');
        const waveEmoji = document.getElementById('wave-emoji');
        
        const welcomeMessage = " Welcome back, Student!";
        const studentName = localStorage.getItem('studentName') || "Student";
        
        let i = 0;
        
        // Type welcome message
        const typeInterval = setInterval(() => {
            if (i < welcomeMessage.length) {
                welcomeTextEl.textContent += welcomeMessage.charAt(i);
                i++;
            } else {
                clearInterval(typeInterval);
                welcomeTextEl.classList.add('typing-complete');
                
                // Show student name with slight delay
                setTimeout(() => {
                    studentNameEl.textContent = studentName;
                    studentNameEl.style.opacity = '0';
                    studentNameEl.style.display = 'inline-block';
                    
                    // Fade in student name
                    setTimeout(() => {
                        studentNameEl.style.transition = 'opacity 0.5s ease-out';
                        studentNameEl.style.opacity = '1';
                        
                        // Show wave emoji
                        setTimeout(() => {
                            waveEmoji.style.display = 'inline';
                        }, 300);
                    }, 50);
                }, 200);
            }
        }, 50);
    }

    // Start typing animation
    typeWelcomeMessage();

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
