// student-profile.js

document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const profilePicEl = document.getElementById('profile-pic');
    const nameEl = document.getElementById('name');
    const usernameEl = document.getElementById('username');
    const studentMetaEl = document.getElementById('student-meta');
    const bioEl = document.getElementById('bio');

    const achievementsListEl = document.getElementById('achievements-list');
    const courseListEl = document.getElementById('course-list');

    const lastActiveEl = document.getElementById('last-active');
    const totalCoursesEl = document.getElementById('total-courses');
    const completedActivitiesEl = document.getElementById('completed-activities');
    const languagesUsedEl = document.getElementById('languages-used');
    const totalPointsEl = document.getElementById('total-points');

    const DEFAULT_PROFILE_PIC = '/frontend/assets/images/starter-profile.jpeg';

    const token = localStorage.getItem('token');
    if (!token) {
        console.error('No token found. User must be logged in.');
        return;
    }

    // --- Fetch Functions ---
    async function fetchUserProfile() {
        try {
            const res = await fetch('http://localhost:8081/api/users/me', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch user info');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function fetchStudentStats() {
        try {
            const res = await fetch('http://localhost:8081/api/student/stats', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch student stats');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    async function fetchStudentCourses() {
        try {
            const res = await fetch('http://localhost:8081/api/student/enrollments/my-courses', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch courses');
            return await res.json();
        } catch (err) {
            console.error(err);
            return [];
        }
    }

    async function fetchProfileInfo() {
        try {
            const res = await fetch('http://localhost:8081/api/profile', {
                headers: { 'Authorization': 'Bearer ' + token }
            });
            if (!res.ok) throw new Error('Failed to fetch profile info');
            return await res.json();
        } catch (err) {
            console.error(err);
            return null;
        }
    }

    // --- Populate Profile ---
    async function populateProfile() {
        const user = await fetchUserProfile();
        const stats = await fetchStudentStats();
        const courses = await fetchStudentCourses();
        const profile = await fetchProfileInfo();

        if (!user) return;

        // Profile picture
        profilePicEl.src = profile?.profilePicture || DEFAULT_PROFILE_PIC;

        // Name and username
        nameEl.textContent = user.name || 'Student Name';
        usernameEl.textContent = '@' + (user.username || 'username');

        // Student meta
        const joinDate = new Date(user.createdAt || Date.now());
        studentMetaEl.textContent = `🎓 ${user.role} | Joined: ${joinDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`;

        // Bio
        bioEl.textContent = profile?.bio || 'No bio yet.';

        // Achievements
        achievementsListEl.innerHTML = '';
        if (stats) {
            if (stats.totalCourses > 0) addAchievement('💪 Join first course');
        }

        // Courses
        courseListEl.innerHTML = '';
        if (courses.length > 0) {
            courses.forEach(c => {
                const div = document.createElement('div');
                div.classList.add('course-card');
                div.textContent = c.title;
                courseListEl.appendChild(div);
            });
        } else {
            courseListEl.innerHTML = '<p>No courses joined yet.</p>';
        }

        // Activities
        if (stats) {
            lastActiveEl.textContent = `Last Active: ${stats.lastActive ? new Date(stats.lastActive).toLocaleDateString() : 'N/A'}`;
            totalCoursesEl.textContent = `Courses Joined: ${stats.totalCourses}`;
            completedActivitiesEl.textContent = `Activities Completed: ${stats.completedActivities}`;
            languagesUsedEl.textContent = 'Languages Used: Java';
            totalPointsEl.textContent = `Total Points Earned: ${stats.totalPoints || 0}`;
        }
    }

    // --- Helper ---
    function addAchievement(text) {
        const li = document.createElement('li');
        li.textContent = text;
        achievementsListEl.appendChild(li);
    }

    // --- Initialize ---
    populateProfile();
});
