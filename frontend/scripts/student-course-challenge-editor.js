document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded - DOM fully ready");

    // --- Initialize ACE Editor ---
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.session.getUndoManager().markClean();
    console.log("ACE editor initialized");

    // --- DOM Elements ---
    const runBtn = document.getElementById("runBtn");
    const submitBtn = document.getElementById("saveBtn"); // Your Submit button
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    let lastCode = "";      // Keep track of last code to prevent duplicate runs
    let isRunning = false;  // Prevent multiple concurrent runs

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
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

        // Prevent duplicate runs
        if (isRunning || code === lastCode) {
            console.log("Duplicate or running code prevented.");
            return;
        }

        isRunning = true;
        lastCode = code;

        try {
            const res = await fetch("http://localhost:8081/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "code=" + encodeURIComponent(code)
            });

            if (!res.ok) {
                outputBox.innerText = `Error: Server responded with ${res.status}`;
                feedback.innerText = "Feedback: Failed.";
                submitBtn.disabled = true;
                isRunning = false;
                return;
            }

            const output = await res.text();
            console.log("Server output:", output);

            outputBox.innerText = output || "No output.";
            feedback.innerText = output.includes("Error") ? "Feedback: Failed." : "Feedback: Passed!";
            submitBtn.disabled = feedback.innerText.includes("Failed");

            // Mark editor clean
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

    // --- Submit Button (optional) ---
    submitBtn.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();

        const code = editor.getValue().trim();
        if (!code) return;

        console.log("Submit clicked. Code ready to send to backend or save.");
        outputBox.innerText = "Code submitted successfully!";
        submitBtn.disabled = true;
    });

    // --- Prevent any unwanted reloads ---
    window.onbeforeunload = null;
});
