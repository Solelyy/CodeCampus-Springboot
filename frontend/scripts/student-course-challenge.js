const API_BASE_URL = 'http://localhost:8081';

document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded - DOM fully ready");

    // --- DOM Elements ---
    const inputContainer = document.querySelector(".input-container");
    const inputBox = document.getElementById("user-input");
    const runBtn = document.getElementById("runBtn");
    const submitBtn = document.getElementById("saveBtn");
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    if (inputBox) inputBox.value = "";
    if (inputContainer) inputContainer.classList.remove("show");

    // --- ACE Editor ---
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.session.getUndoManager().markClean();

    let lastCode = "";
    let isRunning = false;

    // --- Utilities ---
    const getAuthToken = () => localStorage.getItem('token');
    const getParamsFromURL = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return { activityId: urlParams.get('activityId'), courseId: urlParams.get('courseId') };
    };
    const requiresInput = code => /Scanner\s+.*=\s*new\s+Scanner\s*\(.*System\.in.*\)/.test(code);

    const toggleInputBox = show => {
        if (!inputContainer) return;
        inputContainer.classList.toggle("show", show);
        if (!show && inputBox) inputBox.value = "";
        updateRunButtonState();
    };

    const updateRunButtonState = () => {
        const code = editor.getValue().trim();
        const needsInput = requiresInput(code);

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
    };

    const setupCourseTabs = courseId => {
        const tabs = {
            'tab-overview': '/frontend/webpages/student-course-overview.html',
            'tab-activities': '/frontend/webpages/student-course-activities.html',
            'tab-leaderboard': '/frontend/webpages/student-course-leaderboard.html',
            'tab-announcement': '/frontend/webpages/student-course-announcement.html'
        };
        Object.entries(tabs).forEach(([id, path]) => {
            const tab = document.getElementById(id);
            if (tab) tab.onclick = () => window.location.href = courseId ? `${path}?courseId=${courseId}` : path;
        });
    };

    const displayMessage = (title, message) => {
        const titleEl = document.getElementById('challenge-title');
        const descEl = document.getElementById('challenge-description');
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = message;
    };

    // --- Fetch Challenge ---
    const fetchChallengeDetails = async () => {
        const { activityId, courseId } = getParamsFromURL();
        setupCourseTabs(courseId);
        const token = getAuthToken();

        if (!activityId) {
            displayMessage('Challenge not found', 'Please select a valid challenge.');
            return;
        }
        if (!token) {
            alert('Session expired. Please log in again.');
            window.location.href = '/frontend/webpages/login.html';
            return;
        }

        try {
            const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                switch (res.status) {
                    case 403: displayMessage('Access Denied', 'You are not authorized to view this challenge.'); break;
                    case 404: displayMessage('Challenge not found', 'The requested challenge does not exist.'); break;
                    default: throw new Error(`Unexpected error: ${res.status}`);
                }
                return;
            }

            const challenge = await res.json();
            document.getElementById('challenge-title').textContent = challenge.title || 'Untitled Challenge';
            document.getElementById('challenge-description').textContent = challenge.problemStatement || 'No description available.';
            document.getElementById('challenge-difficulty').textContent = challenge.difficulty || 'N/A';
            document.getElementById('challenge-points').textContent = challenge.points != null ? challenge.points : 'N/A';

            toggleInputBox(challenge.noInput === false);
        } catch (err) {
            console.error('Error fetching challenge:', err);
            displayMessage('Error loading challenge', 'Unable to load challenge. Please try again later.');
        }
    };

    // --- Run Code ---
    runBtn.addEventListener("click", async e => {
        e.preventDefault();
        e.stopPropagation();

        const code = editor.getValue().trim();
        if (!code) return;

        const needsInput = requiresInput(code);
        toggleInputBox(needsInput);

        if (isRunning || code === lastCode) return;

        isRunning = true;
        lastCode = code;

        try {
            const bodyData = new URLSearchParams();
            bodyData.append("code", code);
            if (needsInput && inputBox.value.trim()) bodyData.append("input", inputBox.value);

            const res = await fetch(`${API_BASE_URL}/api/run`, {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData.toString()
            });

            const output = await res.text();
            outputBox.value = `---OUTPUT_START---\n${output}\n---OUTPUT_END---`;

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
            outputBox.value = "ERROR: Cannot connect to server.\n" + err.message;
            feedback.textContent = "Server error. Please try again.";
            feedback.className = "feedback-warning";
            submitBtn.disabled = true;
        } finally {
            isRunning = false;
        }
    });

    // --- Submit Code ---
    submitBtn.addEventListener("click", e => {
        e.preventDefault();
        e.stopPropagation();
        const code = editor.getValue().trim();
        if (!code) return;

        outputBox.value = "Code submitted successfully!";
        feedback.textContent = "Code submitted!";
        feedback.className = "feedback-success";
        submitBtn.disabled = true;
    });

    // --- Init ---
    runBtn.disabled = true;
    editor.session.on('change', updateRunButtonState);
    if (inputBox) inputBox.addEventListener('input', updateRunButtonState);
    fetchChallengeDetails();
});
