export function initJoinCourseModal() {
    const joinBtn = document.getElementById("join-course-btn");
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("join-modal");
    const submitBtn = document.getElementById("join-course-submit");
    const courseCodeInput = document.getElementById("course-code");
    const messageEl = document.getElementById("message");

    if (!joinBtn || !overlay || !modal || !submitBtn || !courseCodeInput || !messageEl) return;

    // --- Style message element ---
    messageEl.style.display = "block";
    messageEl.style.marginTop = "5px";
    messageEl.style.fontWeight = "bold";

    // --- Disable/Enable submit button based on input ---
    function toggleSubmitBtn() {
        if (courseCodeInput.value.trim() === "") {
            submitBtn.disabled = true;
            submitBtn.classList.add("disabled"); // optional for CSS styling
        } else {
            submitBtn.disabled = false;
            submitBtn.classList.remove("disabled");
        }
    }

    toggleSubmitBtn(); // initial check
    courseCodeInput.addEventListener("input", () => {
        toggleSubmitBtn();
        messageEl.textContent = ""; // clear message when typing
    });

    // --- Open modal ---
    joinBtn.addEventListener("click", () => {
        overlay.style.display = "block";
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
        messageEl.textContent = ""; // clear previous message
        courseCodeInput.value = ""; // clear input
        toggleSubmitBtn();
    });

    // --- Close modal ---
    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        messageEl.textContent = ""; // clear message
        courseCodeInput.value = ""; // clear input
        toggleSubmitBtn();
    });

    // --- Submit course code ---
    submitBtn.addEventListener("click", async () => {
        const code = courseCodeInput.value.trim();
        messageEl.textContent = ""; // clear previous message

        if (!code) {
            messageEl.textContent = "Please enter a course code.";
            messageEl.style.color = "red";
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) throw new Error("You must be logged in.");

            const response = await fetch(`http://localhost:8081/api/courses/code/${code}`, {
                headers: { "Authorization": `Bearer ${token}` },
            });

            if (response.ok) {
                const course = await response.json();

                // Show message BEFORE redirect
                messageEl.textContent = "Course found! Redirecting...";
                messageEl.style.color = "green";

                setTimeout(() => {
                    window.location.href = `/frontend/webpages/student-view-course.html?courseId=${course.id}`;
                }, 1000);
            } else if (response.status === 404) {
                messageEl.textContent = "There is no existing course with that code.";
                messageEl.style.color = "red";
            } else {
                messageEl.textContent = "Something went wrong. Please try again.";
                messageEl.style.color = "red";
            }
        } catch (error) {
            console.error("Error fetching course:", error);
            messageEl.textContent = "Error connecting to server.";
            messageEl.style.color = "red";
        }
    });
}
