function getCourseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("courseId");
}

const tabs = {
    "tab-overview": "/frontend/webpages/student-course-overview.html",
    "tab-activities": "/frontend/webpages/student-course-activities.html",
    "tab-leaderboard": "/frontend/webpages/student-course-leaderboard.html",
    "tab-announcement": "/frontend/webpages/student-course-announcement.html"
};

function setupCourseTabs() {
    const courseId = getCourseIdFromURL();

    Object.entries(tabs).forEach(([id, path]) => {
        const tab = document.getElementById(id);
        if (tab) {
            tab.onclick = () => {
                // Add loading state
                tab.style.opacity = '0.6';
                tab.style.pointerEvents = 'none';
                
                const url = courseId ? `${path}?courseId=${courseId}` : path;
                
                // Smooth transition
                setTimeout(() => {
                    window.location.href = url;
                }, 200);
            };
        }
    });

    // ✅ Highlight active tab dynamically
    const currentPage = window.location.pathname.split('/').pop();
    Object.entries(tabs).forEach(([id, path]) => {
        const file = path.split('/').pop();
        const tab = document.getElementById(id);
        if (currentPage === file && tab) {
            tab.classList.add('active');
        } else if (tab) {
            tab.classList.remove('active');
        }
    });
}

window.addEventListener("DOMContentLoaded", setupCourseTabs);
