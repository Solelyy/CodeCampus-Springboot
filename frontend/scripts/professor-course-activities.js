document.addEventListener("DOMContentLoaded", async () => {
    try {
        // --- Get course ID from URL ---
        const urlParams = new URLSearchParams(window.location.search);
        const courseId = urlParams.get("courseId");

        if (!courseId) {
            console.error("No course ID provided in URL");
            return;
        }

        // --- Auth Token ---
        const token = localStorage.getItem("token");
        if (!token) {
            console.error("No auth token found. Please log in.");
            return;
        }

        // --- Fetch activities for this course ---
        const response = await fetch(`http://localhost:8081/api/activities/course/${courseId}`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error("Failed to fetch activities");
        }

        const activities = await response.json();
        console.log("Activities:", activities);

        // --- HTML container ---
        const activitiesListEl = document.querySelector(".activities-list");
        activitiesListEl.innerHTML = ""; // clear default content

        // --- No activities ---
        if (activities.length === 0) {
            activitiesListEl.innerHTML = `<p>No activities yet.</p>`;
            return;
        }

        // --- Create activity cards ---
        activities.forEach(activity => {
            const item = document.createElement("div");
            item.classList.add("activity-item");

            item.innerHTML = `
                <h4>${activity.title}</h4>
                <div class="activity-actions">
                    <button class="btn-edit" id="btn-edit" data-id="${activity.id}">Edit</button>
                </div>
            `;

            activitiesListEl.appendChild(item);
        });

        // --- Add Edit button functionality ---
        document.querySelectorAll(".btn-edit").forEach(btn => {
            btn.addEventListener("click", () => {
                const activityId = btn.getAttribute("data-id");
                window.location.href = `/frontend/webpages/professor-edit-activity.html?courseId=${courseId}&activityId=${activityId}`;
            });
        });

        // --- Add Activity Button ---
        const addBtn = document.getElementById("btn-add-activity");
        addBtn.addEventListener("click", () => {
            window.location.href = `/frontend/webpages/professor-add-activity.html?courseId=${courseId}`;
        });

    } catch (err) {
        console.error("Error fetching activities:", err);
    }
});
