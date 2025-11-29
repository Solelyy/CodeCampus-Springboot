document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded - DOM fully ready");

    // --- DOM Elements ---
    const inputContainer = document.querySelector(".input-container");
    const inputBox = document.getElementById("user-input");
    const runBtn = document.getElementById("runBtn");
    const submitBtn = document.getElementById("saveBtn");
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    if (inputBox) inputBox.value = ""; // clear placeholder
    if (inputContainer) inputContainer.classList.remove("show"); // hide initially

    // --- Initialize ACE Editor ---
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.session.getUndoManager().markClean();
    console.log("ACE editor initialized");

    let lastCode = "";
    let isRunning = false;

    // --- Utility: check if code uses Scanner ---
    function requiresInput(code) {
        return /Scanner\s+.*=\s*new\s+Scanner\s*\(.*System\.in.*\)/.test(code);
    }

    // --- Toggle input container ---
    function toggleInputBox(show) {
        if (!inputContainer) return;
        if (show) inputContainer.classList.add("show");
        else {
            inputContainer.classList.remove("show");
            if (inputBox) inputBox.value = "";
        }
        updateRunButtonState(); // always check run button
    }

    // --- Enable/disable Run button dynamically ---
    function updateRunButtonState() {
        const code = editor.getValue().trim();
        const needsInput = requiresInput(code);

        if (!code) {
            runBtn.disabled = true;
            feedback.innerText = "Please enter code to run.";
            feedback.className = "feedback-info";
        } else if (needsInput && (!inputBox || !inputBox.value.trim())) {
            runBtn.disabled = true;
            feedback.innerText = "Please provide input for your program.";
            feedback.className = "feedback-info";
        } else {
            runBtn.disabled = false;
            feedback.innerText = "";
            feedback.className = "";
        }
    }

    // --- Initial state ---
    runBtn.disabled = true;
    updateRunButtonState();

    // Listen for editor and input changes
    editor.session.on('change', updateRunButtonState);
    if (inputBox) inputBox.addEventListener('input', updateRunButtonState);

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        event.stopPropagation();

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

            const res = await fetch("http://localhost:8081/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: bodyData.toString()
            });

            const output = await res.text();
            outputBox.value = `---OUTPUT_START---\n${output}\n---OUTPUT_END---`;

            // --- Friendly feedback ---
            if (!output.trim()) {
                feedback.innerText = "No output produced yet.";
                feedback.className = "feedback-info";
                submitBtn.disabled = true;
            } else if (/error/i.test(output)) {
                feedback.innerText = /compilation/i.test(output)
                    ? "Compilation error detected."
                    : /exception/i.test(output)
                        ? "Runtime exception occurred."
                        : "Check your code for issues.";
                feedback.className = "feedback-warning";
                submitBtn.disabled = true;
            } else {
                feedback.innerText = "Output generated successfully!";
                feedback.className = "feedback-success";
                submitBtn.disabled = false;
            }

            editor.session.getUndoManager().markClean();
        } catch (err) {
            outputBox.value = "ERROR: Cannot connect to server.\n" + err.message;
            feedback.innerText = "Server error. Please try again.";
            feedback.className = "feedback-warning";
            submitBtn.disabled = true;
        } finally {
            isRunning = false;
        }
    });

    // --- Submit Button ---
    submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        const code = editor.getValue().trim();
        if (!code) return;

        outputBox.value = "Code submitted successfully!";
        feedback.innerText = "Code submitted!";
        feedback.className = "feedback-success";
        submitBtn.disabled = true;
    });

    window.onbeforeunload = null;
});
