function getCourseIdFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get("courseId");
}

const tabs = {
    "tab-overview": "/frontend/webpages/professor-course-overview.html",
    "tab-activities": "/frontend/webpages/professor-course-activities.html",
    "tab-leaderboard": "/frontend/webpages/professor-course-leaderboard.html",
    "tab-announcement": "/frontend/webpages/professor-course-announcement.html"
};

function setupCourseTabs() {
    const courseId = getCourseIdFromURL();

    Object.entries(tabs).forEach(([id, path]) => {
        const tab = document.getElementById(id);
        if (tab) {
            tab.onclick = () => {
                const url = courseId ? `${path}?courseId=${courseId}` : path;
                window.location.href = url;
            };
        }
    });

    // Highlight active tab dynamically
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
