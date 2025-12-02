import { showActivityGuide } from './activity-guide.js';

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

    console.log("Editor initialized value:", editor.getValue());
    editor.session.getUndoManager().markClean();

    // NEW
    let isRunning = false;
    let isChallengeLocked = false;

    const API_BASE_URL = "http://localhost:8081";

    function lockChallenge(message, savedOutput) {
        isChallengeLocked = true;
        runBtn.disabled = true;
        submitBtn.disabled = true;
        editor.setReadOnly(true);

        if (typeof savedOutput === "string") {
            outputBox.value = savedOutput;
        }
        if (message) {
            feedback.textContent = message;
            feedback.className = "feedback-success";
        }

        // Hide input
        if (inputContainer && inputBox) {
            inputContainer.classList.remove("show");
            inputBox.classList.remove("show");
        }
    }

    const token = localStorage.getItem("token");
    console.log("Token being sent inside DOMContentLoaded:", token);

    const urlParams = new URLSearchParams(window.location.search);
    const activityId = urlParams.get("activityId");

    // --- Detect Scanner input ---
    function requiresInput(code) {
        return /Scanner\s+\w+\s*=\s*new\s+Scanner\s*\(\s*System\.in\s*\)/.test(code);
    }

    function expectsNumericInput(code) {
        return /\.\s*next(Int|Double|Float)\s*\(\)/.test(code);
    }

    // --- Update Run button ---
    function updateRunButtonState() {
        if (isChallengeLocked) {
            runBtn.disabled = true;
            submitBtn.disabled = true;
            return;
        }

        const code = editor.getValue().trim();
        const needsInput = requiresInput(code);
        const inputEmpty = !inputBox?.value.trim();
        const numericRequired = expectsNumericInput(code);
        const inputIsInvalidNumeric = numericRequired && inputBox && isNaN(inputBox.value.trim());

        // Show/hide input box
        if (inputContainer && inputBox) {
            inputContainer.classList.toggle("show", needsInput);
            inputBox.classList.toggle("show", needsInput);
            if (!needsInput) inputBox.value = "";
        }

        // ⚠ DO NOT ERASE FEEDBACK if run already happened.
        // Only show feedback when nothing was run yet.
        if (!isRunning) {
            if (!code) {
                runBtn.disabled = true;
                submitBtn.disabled = true;
                feedback.textContent = "Please enter code to run.";
                feedback.className = "feedback-info";
                return;
            }

            if (needsInput && (inputEmpty || inputIsInvalidNumeric)) {
                runBtn.disabled = true;
                submitBtn.disabled = true;
                feedback.textContent = inputIsInvalidNumeric
                    ? "Input should be numeric!"
                    : "Please provide input before running.";
                feedback.className = "feedback-warning";
                return;
            }
        }

        // If everything is valid:
        runBtn.disabled = false;
    }

    let debounceTimeout;
    editor.session.on("change", () => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(updateRunButtonState, 100);
    });

    if (inputBox) inputBox.addEventListener("input", updateRunButtonState);

    updateRunButtonState();

    // --- Fetch previous submission ---
    (async function fetchSubmission() {
        if (!activityId || !token) return;
        console.log('fetchSubmission'+ token);
        try {
            const res = await fetch(`${API_BASE_URL}/api/student/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;

            const submission = await res.json();

            if (submission.submitted) {
                editor.setValue(submission.code || "", -1);
                editor.setReadOnly(submission.completed); // lock only if completed
                editor.session.getUndoManager().markClean();

                if (submission.completed) {
                    lockChallenge(
                        submission.feedback || "You have already submitted this activity.",
                        submission.output || ""
                    );
                }
                return;
            }


        } catch (err) {
            console.error("Error fetching submission:", err);
        }
    })();

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        if (isChallengeLocked || isRunning) return;

        isRunning = true;

        const code = editor.getValue().trim();
        const input = inputBox ? inputBox.value.trim() : "";

        outputBox.value = "Running code...";
        feedback.textContent = "Running code...";
        feedback.className = "feedback-info";

        try {
            // Step 1: Run code
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

            // Step 2: Evaluate
            const evalRes = await fetch(`${API_BASE_URL}/api/student/activities/evaluate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
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
                passed:
                    (tc.expectedOutput || "").trim() ===
                    (tc.actualOutput || "").trim()
            }));

            const allPassed = testResults.every(tc => tc.passed);

            if (allPassed) {
                feedback.textContent = "You passed the challenge! You can now submit it.";
                feedback.className = "feedback-success";
            } else {
                const expectedList = testResults
                    .map(tc => `${tc.expectedOutput || "[no expected output]"}`)
                    .join("\n");

                feedback.textContent =
                    "Expected output is not met.\nExpected:\n" + expectedList;
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
            updateRunButtonState();
        }
    });

    // --- Submit Code ---
    submitBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        if (isChallengeLocked) return;

        const code = editor.getValue().trim();
        const input = inputBox ? inputBox.value.trim() : "";
        if (!code) return;

        console.log("Submitting code:", editor.getValue());

        outputBox.value = "Submitting code...";
        feedback.textContent = "Submitting...";
        feedback.className = "feedback-info";
        submitBtn.disabled = true;

        try {
            const res = await fetch(`${API_BASE_URL}/api/student/activities/submit`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ activityId, code, input })
            });

            if (!res.ok) {
                const errText = await res.text();
                throw new Error(errText || "Submission failed.");
            }

            const result = await res.json();

            localStorage.setItem("lastChallengeResult", JSON.stringify(result));

            // redirect
            window.location.href = `student-challenge-result.html?activityId=${activityId}`;
        } catch (err) {
            console.error(err);
            feedback.textContent = "Error submitting code: " + err.message;
            feedback.className = "feedback-warning";
            submitBtn.disabled = false;
        }
    });

    // --- Fetch Challenge Details ---
    (async function fetchChallenge() {
        if (!activityId || !token) return;

        try {
            const res = await fetch(`${API_BASE_URL}/api/activities/${activityId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) return;

            const challenge = await res.json();
            document.getElementById("challenge-title").textContent =
                challenge.title || "Untitled Challenge";
            document.getElementById("challenge-description").textContent =
                challenge.problemStatement || "No description available.";
            document.getElementById("challenge-difficulty").textContent =
                challenge.difficulty || "N/A";
            document.getElementById("challenge-points").textContent =
                challenge.points ?? "N/A";

            if (inputContainer && inputBox) {
                const showInput = challenge.noInput === false;
                inputContainer.classList.toggle("show", showInput);
                inputBox.classList.toggle("show", showInput);
            }

            const username = localStorage.getItem("username");
            if (username) {
                const hasSeenGuideKey = `seenActivityGuideEver-${username}`;
                const hasSeenGuideEver = localStorage.getItem(hasSeenGuideKey);

                if (!hasSeenGuideEver) {
                    showActivityGuide({ alreadySubmitted: false });
                    localStorage.setItem(hasSeenGuideKey, 'true');
                }
            }
        } catch (err) {
            console.error("Error fetching challenge:", err);
        }
    })();

    // smooth fade
    const main = document.querySelector("main");
    if (main) main.classList.add("fade-in");
});
