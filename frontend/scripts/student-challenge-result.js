document.addEventListener("DOMContentLoaded", async () => {
    const API_BASE_URL = "http://localhost:8081";
    const token = localStorage.getItem("token");

    // Get activityId from URL query params
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get("activityId");
    if (!activityId) return console.error("No activityId in URL");

    // DOM elements
    const statusEl = document.getElementById("result-status");
    const messageEl = document.getElementById("result-message");
    const pointsEl = document.getElementById("result-points");
    const totalPointsEl = document.getElementById("total-points");
    const nextBtn = document.getElementById("next-activity");
    const leaderboardBtn = document.getElementById("see-leaderboard");

    try {
        const res = await fetch(`${API_BASE_URL}/api/student/activities/${activityId}/result`, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!res.ok) {
            throw new Error("Failed to fetch challenge result");
        }

        const result = await res.json();

        // Populate result
        statusEl.textContent = "SUCCESS 🎉";
        messageEl.textContent = `Great job! You solved "${result.activityTitle}" challenge!`;
        pointsEl.textContent = ` ✨ +${result.earnedPoints} points earned ✨`;
        totalPointsEl.textContent = `📊 Total points in this course: ${result.totalPointsInCourse}`;

        // Next activity button
        if (result.nextActivityId) {
            nextBtn.onclick = () => {
                location.href = `/frontend/webpages/student-challenge.html?activityId=${result.nextActivityId}`;
            };
        } else {
            nextBtn.disabled = true;
            nextBtn.style.opacity = 0.5;
            nextBtn.style.cursor = "not-allowed";
            nextBtn.textContent = "No more activities";
        }

        // Leaderboard button
        leaderboardBtn.onclick = () => {
            location.href = `/frontend/webpages/student-course-leaderboard.html?courseId=${result.courseId}`;
        };

    } catch (err) {
        console.error(err);
        statusEl.textContent = "ERROR ❌";
        messageEl.textContent = "Could not load challenge result.";
        pointsEl.textContent = "";
        totalPointsEl.textContent = "";
        nextBtn.disabled = true;
        leaderboardBtn.disabled = true;
    }

    // Smooth fade-in
    const main = document.querySelector("main");
    if (main) main.classList.add("fade-in");
});
