export function initJoinCourseModal() {
    const joinBtn = document.getElementById("join-course-btn");
    const overlay = document.getElementById("overlay");
    const modal = document.getElementById("join-modal");
    const submitBtn = document.getElementById("join-course-submit");
    const courseCodeInput = document.getElementById("course-code");

    if (!joinBtn || !overlay || !modal || !submitBtn || !courseCodeInput) return;

    // Open modal
    joinBtn.addEventListener("click", () => {
        overlay.style.display = "block";
        modal.style.display = "flex";
        document.body.style.overflow = "hidden";
    });

    // Close modal on overlay click
    overlay.addEventListener("click", () => {
        overlay.style.display = "none";
        modal.style.display = "none";
        document.body.style.overflow = "auto";
    });

    // Submit course code
    submitBtn.addEventListener("click", () => {
        const code = courseCodeInput.value.trim();
        if (code) {
            // Replace alert with your fetch logic if needed
            alert(`You entered code: ${code}`);
        } else {
            alert("Please enter a course code.");
        }
    });
}
