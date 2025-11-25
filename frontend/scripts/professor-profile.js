// professor-profile.js

document.addEventListener('DOMContentLoaded', () => {
    const BACKEND_URL = 'http://localhost:8081';
    const DEFAULT_PROFILE_PIC = '/uploads/profile-pictures/starter-profile.jpeg';

    // Elements
    const profilePicEl = document.querySelector('.profile-left .profile-image img');
    const nameEl = document.querySelector('.profile-left h2');
    const usernameEl = document.querySelector('.profile-left .username');
    const metaEl = document.querySelector('.profile-left .student-meta');
    const bioEl = document.querySelector('.profile-left .bio');

    const achievementsListEl = document.querySelector('.profile-right .achievements ul');
    const courseListEl = document.querySelector('.profile-right .courses .course-list');
    const activitiesCard = document.querySelector('.profile-right .activities');

    const token = localStorage.getItem('token');
    if (!token) return console.error('No token found. User must be logged in.');

    // Helper
    function getProfilePicUrl(picPath) {
        return picPath ? BACKEND_URL + picPath : DEFAULT_PROFILE_PIC;
    }

    function addAchievement(text) {
        const li = document.createElement('li');
        li.textContent = text;
        achievementsListEl.appendChild(li);
    }

    // Fetch user info
    async function fetchUserProfile() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/users/me`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch user info');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Fetch professor stats
    async function fetchProfessorStats() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/professor/stats`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch professor stats');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // Fetch courses created
    async function fetchProfessorCourses() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/courses/my-courses`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch courses');
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    // Fetch profile info
    async function fetchProfileInfo() {
        try {
            const res = await fetch(`${BACKEND_URL}/api/profile`, {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch profile info');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function populateProfile() {
        const user = await fetchUserProfile();
        const stats = await fetchProfessorStats();
        const courses = await fetchProfessorCourses();
        const profile = await fetchProfileInfo();

        if (!user) return;

        // Profile picture
        profilePicEl.src = getProfilePicUrl(profile?.profilePicture);

        // Name & username
        nameEl.textContent = user.name || 'Professor Name';
        usernameEl.textContent = '@' + (user.username || 'username');

        // Meta
        const joinDate = new Date(user.createdAt || Date.now());
        metaEl.textContent = `🧑‍🏫 Professor | Joined: ${joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

        // Bio
        bioEl.textContent = profile?.bio || 'No bio yet.';

        // Achievements
        achievementsListEl.innerHTML = '';
        if (stats) {
            if (stats.totalCoursesCreated > 0) addAchievement('⭐ Created first course');
            if (stats.totalStudents > 0) addAchievement('💪 Taught first students');
            if (stats.totalActivities > 0) addAchievement('📝 Posted first activities');
        }

        // Courses created
        courseListEl.innerHTML = '';
        if (courses.length > 0) {
            courses.forEach(c => {
                const div = document.createElement('div');
                div.classList.add('course-card');
                div.textContent = c.title;
                courseListEl.appendChild(div);
            });
        } else {
            courseListEl.innerHTML = '<p>No courses created yet.</p>';
        }

        // Activities stats
        if (stats) {
            activitiesCard.innerHTML = `
                <h3>📊 Activities</h3>
                <p>Total Courses Created: ${stats.totalCoursesCreated}</p>
                <p>Total Students Taught: ${stats.totalStudents}</p>
                <p>Total Activities Designed: ${stats.totalActivities}</p>
            `;
        }
    }

    populateProfile();
});
