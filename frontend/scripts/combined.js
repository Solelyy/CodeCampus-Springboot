document.addEventListener("DOMContentLoaded", () => {
    console.log("JS fully ready");

    // --- DOM Elements ---
    const editorEl = document.getElementById("editor");
    const runBtn = document.getElementById("runBtn");
    const submitBtn = document.getElementById("saveBtn");
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");
    const inputContainer = document.querySelector(".input-container");
    const inputBox = document.getElementById("user-input");

    // Clear input and hide input container initially
    if (inputBox) inputBox.value = "";
    if (inputContainer) inputContainer.classList.remove("show");

    // --- Initialize ACE Editor ---
    const editor = ace.edit(editorEl);
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.setValue("", -1); // start empty
    editor.session.getUndoManager().markClean();

    let lastCode = "";
    let isRunning = false;

    // --- Utility: check if code uses Scanner ---
    function requiresInput(code) {
        return /Scanner\s+\w+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)/.test(code);
    }

    // --- Enable/disable Run button dynamically ---
    function updateRunButtonState() {
        const code = editor.getValue().trim();
        const needsInput = requiresInput(code);

        if (!runBtn) return;

        if (!code) {
            runBtn.disabled = true;
            feedback.textContent = "Please enter code to run.";
            feedback.className = "feedback-info";
        } else if (needsInput && (!inputBox || !inputBox.value.trim())) {
            runBtn.disabled = true;
            feedback.textContent = "Please provide input for your program.";
            feedback.className = "feedback-info";
        } else {
            runBtn.disabled = false;
            feedback.textContent = "";
            feedback.className = "";
        }

        // Show/hide input box based on Scanner usage
        if (inputContainer) {
            inputContainer.classList.toggle("show", needsInput);
        }
    }

    // Debounce to avoid too many rapid calls
    let debounceTimeout;
    editor.session.on('change', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateRunButtonState, 100);
    });
    if (inputBox) inputBox.addEventListener('input', updateRunButtonState);

    // Initial state
    updateRunButtonState();

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        if (runBtn.disabled || isRunning) return;
        isRunning = true;

        const code = editor.getValue().trim();
        const input = inputBox ? inputBox.value.trim() : "";

        lastCode = code;
        outputBox.value = ""; // clear previous output

        try {
            const bodyData = new URLSearchParams();
            bodyData.append("code", code);
            if (requiresInput(code)) bodyData.append("input", input);

            const res = await fetch("http://localhost:8081/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData.toString()
            });

            const output = await res.text();
            outputBox.value = output ? output : "No output produced.";

            // Feedback handling
            if (!output.trim()) {
                feedback.textContent = "No output produced yet.";
                feedback.className = "feedback-info";
                submitBtn.disabled = true;
            } else if (/error/i.test(output)) {
                feedback.textContent = /compilation/i.test(output)
                    ? "Compilation error detected."
                    : /exception/i.test(output)
                        ? "Runtime exception occurred."
                        : "Check your code for issues.";
                feedback.className = "feedback-warning";
                submitBtn.disabled = true;
            } else {
                feedback.textContent = "Output generated successfully!";
                feedback.className = "feedback-success";
                submitBtn.disabled = false;
            }

            editor.session.getUndoManager().markClean();
        } catch (err) {
            console.error(err);
            outputBox.value = "ERROR: Cannot connect to server.\n" + err.message;
            feedback.textContent = "Server error. Please try again.";
            feedback.className = "feedback-warning";
            submitBtn.disabled = true;
        } finally {
            isRunning = false;
        }
    });

    // --- Submit Code (placeholder) ---
    submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        const code = editor.getValue().trim();
        if (!code) return;

        outputBox.value = "Code submitted successfully!";
        feedback.textContent = "Code submitted!";
        feedback.className = "feedback-success";
        submitBtn.disabled = true;
    });

    // --- Fetch Challenge Details ---
    const API_BASE_URL = "http://localhost:8081";
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get("activityId");

    (async function fetchChallenge() {
        if (!activityId) {
            console.warn('No activityId found in URL.');
            return;
        }
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = '/frontend/webpages/login.html';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!res.ok) {
                console.warn("Error fetching challenge:", res.status);
                return;
            }

            const challenge = await res.json();
            document.getElementById("challenge-title").textContent = challenge.title || "Untitled Challenge";
            document.getElementById("challenge-description").textContent = challenge.problemStatement || "No description available.";
            document.getElementById("challenge-difficulty").textContent = challenge.difficulty || "N/A";
            document.getElementById("challenge-points").textContent = challenge.points ?? "N/A";

            if (inputContainer) {
                inputContainer.classList.toggle("show", challenge.noInput === false);
            }

        } catch (err) {
            console.error('Error fetching challenge:', err);
        }
    })();

    // Smooth page transitions
    const main = document.querySelector("main");
    if (main) main.classList.add("fade-in");

    document.querySelectorAll("a").forEach(link => {
        if (link.hostname === window.location.hostname && link.getAttribute("href")) {
            link.addEventListener("click", e => {
                const url = link.getAttribute("href");
                if (!url.startsWith("#") && !url.startsWith("javascript:")) {
                    e.preventDefault();
                    if (main) {
                        main.classList.remove("fade-in");
                        main.classList.add("fade-out");
                    }
                    setTimeout(() => { window.location.href = url; }, 180);
                }
            });
        }
    });
});
