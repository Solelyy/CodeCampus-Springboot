document.addEventListener("DOMContentLoaded", () => {
    console.log("JS fully ready");

    // --- ACE EDITOR & RUN/SUBMIT ---
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.session.getUndoManager().markClean();
    console.log("ACE editor initialized");

    const runBtn = document.getElementById("runBtn");
    const submitBtn = document.getElementById("saveBtn");
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    let lastCode = "";
    let isRunning = false;

    // Guard so we don’t bind multiple times
    if (!runBtn.hasRunListener) {
        runBtn.addEventListener("click", async (event) => {
            console.log("Clicked element:", event.target);
            event.preventDefault();
            event.stopPropagation();

            const code = editor.getValue().trim();

            if (!code) {
                outputBox.innerText = "Error: No code provided.";
                feedback.innerText = "Feedback: Failed.";
                submitBtn.disabled = true;
                return;
            }
            if (!/System\.out\.println\s*\(.*\)/.test(code)) {
                outputBox.innerText = "Error: Missing System.out.println() statement.";
                feedback.innerText = "Feedback: Failed.";
                submitBtn.disabled = true;
                return;
            }

            if (isRunning || code === lastCode) return;

            isRunning = true;
            lastCode = code;

            try {
                const res = await fetch("http://localhost:8081/api/run", {
                    method: "POST",
                    headers: { "Content-Type": "application/x-www-form-urlencoded" },
                    body: "code=" + encodeURIComponent(code)
                });

                const output = await res.text();
                outputBox.innerText = output || "No output.";
                feedback.innerText = output.includes("Error") ? "Feedback: Failed." : "Feedback: Passed!";
                submitBtn.disabled = feedback.innerText.includes("Failed");

                editor.session.getUndoManager().markClean();
            } catch (err) {
                console.error("Fetch error:", err);
                outputBox.innerText = "Error connecting to server:\n" + err.message;
                feedback.innerText = "Feedback: Failed.";
                submitBtn.disabled = true;
            } finally {
                isRunning = false;
            }
        });
        runBtn.hasRunListener = true;
    }

    if (!submitBtn.hasSubmitListener) {
        submitBtn.addEventListener("click", (event) => {
            event.preventDefault();
            event.stopPropagation();
            const code = editor.getValue().trim();
            if (!code) return;

            console.log("Submit clicked. Code ready to send to backend or save.");
            outputBox.innerText = "Code submitted successfully!";
            submitBtn.disabled = true;
        });
        submitBtn.hasSubmitListener = true;
    }

    // --- FETCH CHALLENGE DETAILS ---
    const API_BASE_URL = "http://localhost:8081";
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get("activityId");
    const courseId = urlParams.get("courseId");

    function displayMessage(title, message) {
        const titleEl = document.getElementById('challenge-title');
        const descEl = document.getElementById('challenge-description');
        if (titleEl) titleEl.textContent = title;
        if (descEl) descEl.textContent = message;
    }

    if (!activityId) {
        console.warn('⚠️ No activityId found in URL.');
        displayMessage('Challenge not found', 'No challenge ID provided.');
    } else if (!token) {
        alert('Your session has expired. Please log in again.');
        window.location.href = '/frontend/webpages/login.html';
    } else {
        fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
        .then(res => res.ok ? res.json() : Promise.reject(res.status))
        .then(challenge => {
            document.getElementById("challenge-title").textContent = challenge.title || "Untitled Challenge";
            document.getElementById("challenge-description").textContent = challenge.problemStatement || "No description available.";
            document.getElementById("challenge-difficulty").textContent = challenge.difficulty || "N/A";
            document.getElementById("challenge-points").textContent = challenge.points != null ? challenge.points : "N/A";
        })
        .catch(err => {
            console.error('Error fetching challenge:', err);
            displayMessage('Error loading challenge', 'Please try again later.');
        });
    }

    // --- GENERAL UI: Notifications & Menu ---
    const notifIcon = document.getElementById('notif-icon');
    const notifOverlay = document.getElementById('notif-overlay');
    const menuIcon = document.getElementById('menu-icon');
    const menuOverlay = document.getElementById('menu-overlay');
    const logoutBtn = document.getElementById("logout-btn");

    const toggleOverlay = (icon, overlay) => {
        if (icon && overlay && !icon.hasListener) {
            icon.addEventListener('click', e => {
                e.preventDefault();
                overlay.classList.toggle('show');
            });
            document.addEventListener('click', e => {
                if (!icon.contains(e.target) && !overlay.contains(e.target)) {
                    overlay.classList.remove('show');
                }
            });
            icon.hasListener = true;
        }
    };

    toggleOverlay(notifIcon, notifOverlay);
    toggleOverlay(menuIcon, menuOverlay);

    if (logoutBtn && !logoutBtn.hasListener) {
        logoutBtn.addEventListener("click", e => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            sessionStorage.clear();
            window.location.replace("/index.html");
        });
        logoutBtn.hasListener = true;
    }

    // Smooth page transitions
    const main = document.querySelector("main");
    if (main) main.classList.add("fade-in");

    document.querySelectorAll("a").forEach(link => {
        if (link.hostname === window.location.hostname && link.getAttribute("href")) {
            link.addEventListener("click", e => {
                const url = link.getAttribute("href");
                if (url.startsWith("#") || url.startsWith("javascript:")) return;
                e.preventDefault();
                if (main) {
                    main.classList.remove("fade-in");
                    main.classList.add("fade-out");
                }
                setTimeout(() => { window.location.href = url; }, 180);
            });
        }
    });

    // Prevent unwanted reloads
    window.onbeforeunload = null;
});
