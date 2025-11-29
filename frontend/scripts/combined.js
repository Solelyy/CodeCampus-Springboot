console.log("Loaded challenge JS");

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

    // --- Initialize ACE Editor ---
    const editor = ace.edit(editorEl);
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.setValue("", -1);
    editor.session.getUndoManager().markClean();

    let isRunning = false;

    // --- Utility: detect if code uses Scanner ---
    function requiresInput(code) {
        return /Scanner\s+\w+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)/.test(code);
    }

    // --- Utility: detect numeric input expectation ---
    function expectsNumericInput(code) {
        return /\.\s*next(Int|Double|Float)\s*\(\)/.test(code);
    }

    // --- Update Run button, feedback, and input visibility ---
    function updateRunButtonState() {
        const code = editor.getValue().trim();
        const needsInput = requiresInput(code);
        const inputEmpty = !inputBox?.value.trim();
        const numericRequired = expectsNumericInput(code);
        const inputIsInvalidNumeric = numericRequired && inputBox && isNaN(inputBox.value.trim());

        // Show/hide input container and textarea
        if (inputContainer && inputBox) {
            inputContainer.classList.toggle("show", needsInput);
            inputBox.classList.toggle("show", needsInput);
            if (!needsInput) inputBox.value = "";
        }

        // Determine Run button state
        if (!code) {
            runBtn.disabled = true;
            feedback.textContent = "Please enter code to run.";
            feedback.className = "feedback-info";
            submitBtn.disabled = true;
        } else if (needsInput && (inputEmpty || inputIsInvalidNumeric)) {
            runBtn.disabled = true;
            if (inputIsInvalidNumeric) {
                feedback.textContent = "Input should be numeric!";
            } else {
                feedback.textContent = "Please provide input before running.";
            }
            feedback.className = "feedback-info";
            submitBtn.disabled = true;
        } else {
            runBtn.disabled = false;
            feedback.textContent = "";
            feedback.className = "";
        }

        // Clear previous output on any change
        outputBox.value = "";
        submitBtn.disabled = true;
    }

    // --- Debounce editor changes ---
    let debounceTimeout;
    editor.session.on('change', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateRunButtonState, 100);
    });
    if (inputBox) inputBox.addEventListener('input', updateRunButtonState);

    updateRunButtonState(); // initial state

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        if (runBtn.disabled || isRunning) return;
        isRunning = true;

        const code = editor.getValue().trim();
        const input = inputBox ? inputBox.value.trim() : "";

        // Show running feedback immediately
        outputBox.value = "Running code...";
        feedback.textContent = "Running code...";
        feedback.className = "feedback-info";

        try {
            const bodyData = new URLSearchParams();
            bodyData.append("code", code);
            if (requiresInput(code)) bodyData.append("input", input);

            const res = await fetch("http://localhost:8081/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData.toString()
            });

            const data = await res.json(); // { output, requiresInput, hasMain }
            outputBox.value = data.output || "";

            // Show/hide input
            if (inputContainer && inputBox) {
                inputContainer.classList.toggle("show", data.requiresInput);
                inputBox.classList.toggle("show", data.requiresInput);
                if (!data.requiresInput) inputBox.value = "";
            }

            // Feedback and buttons
            if (!data.hasMain) {
                runBtn.disabled = true;
                feedback.textContent = "No runnable code detected.";
                feedback.className = "feedback-info";
                submitBtn.disabled = true;
            } else if (data.requiresInput && !inputBox.value.trim()) {
                runBtn.disabled = true;
                feedback.textContent = "Please provide input before running.";
                feedback.className = "feedback-info";
                submitBtn.disabled = true;
            } else if (/error/i.test(data.output) || data.output.trim() === "") {
                feedback.textContent = "Compilation error or no output generated.";
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

    // --- Submit Code ---
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
        if (!activityId || !token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;

            const challenge = await res.json();
            document.getElementById("challenge-title").textContent = challenge.title || "Untitled Challenge";
            document.getElementById("challenge-description").textContent = challenge.problemStatement || "No description available.";
            document.getElementById("challenge-difficulty").textContent = challenge.difficulty || "N/A";
            document.getElementById("challenge-points").textContent = challenge.points ?? "N/A";

            if (inputContainer && inputBox) {
                const showInput = challenge.noInput === false;
                inputContainer.classList.toggle("show", showInput);
                inputBox.classList.toggle("show", showInput);
            }

        } catch (err) {
            console.error('Error fetching challenge:', err);
        }
    })();

    // Smooth fade-in
    const main = document.querySelector("main");
    if (main) main.classList.add("fade-in");
});
