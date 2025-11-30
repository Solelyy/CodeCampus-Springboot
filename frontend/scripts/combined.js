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

    const API_BASE_URL = "http://localhost:8081";
    const token = localStorage.getItem("token");
    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get("activityId");

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

        // --- Show/hide input container ---
        if (inputContainer && inputBox) {
            inputContainer.classList.toggle("show", needsInput);
            inputBox.classList.toggle("show", needsInput);
            if (!needsInput) inputBox.value = "";
        }

        // --- Run button & feedback logic ---
        if (!code) {
            runBtn.disabled = true;
            feedback.textContent = "Please enter code to run.";
            feedback.className = "feedback-info";
            submitBtn.disabled = true;
            outputBox.value = "";
        } else if (needsInput && (inputEmpty || inputIsInvalidNumeric)) {
            runBtn.disabled = true;
            feedback.textContent = inputIsInvalidNumeric ? "Input should be numeric!" : "Please provide input before running.";
            feedback.className = "feedback-warning";
            submitBtn.disabled = true;
        } else {
            runBtn.disabled = false;
            feedback.textContent = ""; // clear warning
            feedback.className = "";
        }
    }

    let debounceTimeout;
    editor.session.on('change', () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateRunButtonState, 100);
    });
    if (inputBox) inputBox.addEventListener('input', updateRunButtonState);

    updateRunButtonState();

    // --- Fetch previous submission ---
    (async function fetchSubmission() {
        if (!activityId || !token) return;
        try {
            const res = await fetch(`${API_BASE_URL}/api/student/activities/${activityId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) return;

            const submission = await res.json();
            if (submission.submitted) {
                editor.setValue(submission.code || "", -1);
                editor.setReadOnly(true);
                editor.session.getUndoManager().markClean();

                outputBox.value = submission.output || "";
                feedback.textContent = submission.feedback + (submission.earnedPoints != null ? ` Earned Points: ${submission.earnedPoints}` : "");
                feedback.className = "feedback-success";

                runBtn.disabled = true;
                submitBtn.disabled = true;

                if (inputContainer && inputBox) {
                    inputContainer.classList.remove("show");
                    inputBox.classList.remove("show");
                }
            }
        } catch (err) {
            console.error("Error fetching submission:", err);
        }
    })();

    // --- Run Code ---
    // --- Run Code ---
runBtn.addEventListener("click", async (event) => {
    event.preventDefault();
    if (isRunning) return; // only block if already running
    isRunning = true;

    const code = editor.getValue().trim();
    const input = inputBox ? inputBox.value.trim() : "";

    outputBox.value = "Running code...";
    feedback.textContent = "Running code...";
    feedback.className = "feedback-info";

    try {
        // --- Step 1: Run code ---
        const bodyData = new URLSearchParams();
        bodyData.append("code", code);
        if (requiresInput(code)) bodyData.append("input", input);

        const res = await fetch(`${API_BASE_URL}/api/run`, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: bodyData.toString()
        });

        const data = await res.json();
        outputBox.value = data.output || "";

        // --- Show/hide input box ---
        if (inputContainer && inputBox) {
            const showInput = requiresInput(code);
            inputContainer.classList.toggle("show", showInput);
            inputBox.classList.toggle("show", showInput);
        }

        // --- Feedback if activity doesn't require input but code does ---
        if (!data.noInput && requiresInput(code) && input === "") {
            feedback.textContent = "Activity does not require input, but your code expects it.";
            feedback.className = "feedback-warning";
        }

        // --- Step 2: Evaluate code ---
        const evalRes = await fetch(`${API_BASE_URL}/api/student/activities/evaluate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({
                activityId,
                code,
                input: requiresInput(code) ? input : null
            })
        });

        const evalResult = await evalRes.json();
        const testResults = evalResult.testCaseResults.map(tc => ({
            expectedOutput: (tc.expectedOutput || "").trim(),
            actualOutput: (tc.actualOutput || "").trim(),
            passed: ((tc.expectedOutput || "").trim() === (tc.actualOutput || "").trim())
        }));

        const allPassed = testResults.every(tc => tc.passed);

        // --- Feedback based on evaluation ---
        if (allPassed) {
            feedback.textContent = "You passed the challenge! You can now submit it.";
            feedback.className = "feedback-success";
        } else {
            const expectedList = testResults
                .map(tc => `${(tc.expectedOutput || "").trim() || "[no expected output]"}`)
                .join("\n");
            feedback.textContent = "Expected output is not met. Check your code and instructions.\nExpected:\n" + expectedList;
            feedback.className = "feedback-warning";
        }

        submitBtn.disabled = !allPassed;
        editor.session.getUndoManager().markClean();

    } catch (err) {
        console.error(err);
        outputBox.value = "ERROR: Cannot connect to server.\n" + err.message;
        feedback.textContent = "Server error. Please try again.";
        feedback.className = "feedback-warning";
        submitBtn.disabled = true;
    } finally {
        isRunning = false;
        runBtn.disabled = false; // ensure run button is always re-enabled
    }
});


    // --- Submit Code ---
    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        const code = editor.getValue().trim();
        const input = inputBox ? inputBox.value.trim() : "";
        if (!code) return;

        outputBox.value = "Submitting code...";
        feedback.textContent = "Submitting...";
        feedback.className = "feedback-info";
        submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/api/student/activities/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ activityId, code, input })
            });

            const result = await res.json();
            feedback.textContent = `${result.feedback} Earned Points: ${result.earnedPoints}`;
            feedback.className = result.passedAllTestCases ? "feedback-success" : "feedback-warning";

            localStorage.setItem("lastChallengeResult", JSON.stringify(result));
            outputBox.value = "Code submitted successfully!";
        } catch (err) {
            console.error(err);
            feedback.textContent = "Error submitting code.";
            feedback.className = "feedback-warning";
        } finally {
            submitBtn.disabled = false;
        }
    });

    // --- Fetch Challenge Details ---
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
