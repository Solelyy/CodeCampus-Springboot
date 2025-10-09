document.addEventListener("DOMContentLoaded", () => {
    console.log("JS loaded - DOM fully ready");

    // --- Initialize ACE Editor ---
    const editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.session.setMode("ace/mode/java");
    editor.session.getUndoManager().markClean(); // mark clean to prevent Brave popup
    console.log("ACE editor initialized");

    // --- DOM Elements ---
    const runBtn = document.getElementById("runBtn");
    const saveBtn = document.getElementById("saveBtn");
    const outputBox = document.getElementById("output");
    const feedback = document.getElementById("feedback");

    // --- Prevent default form submit ---
    document.querySelectorAll("form").forEach(f => {
        f.addEventListener("submit", e => e.preventDefault());
    });

    // --- Run Code ---
    runBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        console.log("Run button clicked");

        const code = editor.getValue().trim();
        console.log("Code:", code);

        if (!code) {
            outputBox.innerText = "Error: No code provided.";
            feedback.innerText = "Feedback: Failed.";
            saveBtn.disabled = true;
            return;
        }

        const hasPrint = /System\.out\.println\s*\(.*\)/.test(code);
        if (!hasPrint) {
            outputBox.innerText = "Error: Missing System.out.println() statement.";
            feedback.innerText = "Feedback: Failed.";
            saveBtn.disabled = true;
            return;
        }

        try {
            const res = await fetch("http://localhost:8081/api/run", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "code=" + encodeURIComponent(code)
            });

            console.log("Fetch returned:", res);

            if (!res.ok) {
                outputBox.innerText = `Error: Server responded with ${res.status}`;
                feedback.innerText = "Feedback: Failed.";
                saveBtn.disabled = true;
                return;
            }

            const output = await res.text();
            console.log("Server output:", output);

            outputBox.innerText = output || "No output.";
            feedback.innerText = output.includes("Error") ? "Feedback: Failed." : "Feedback: Passed!";
            saveBtn.disabled = feedback.innerText.includes("Failed");

            // Mark editor clean after successful run
            editor.session.getUndoManager().markClean();

        } catch (err) {
            console.error("Fetch error:", err);
            outputBox.innerText = "Error connecting to server:\n" + err.message;
            feedback.innerText = "Feedback: Failed.";
            saveBtn.disabled = true;
        }
    });

    // --- Save Code ---
    saveBtn.addEventListener("click", async (event) => {
        event.preventDefault();
        console.log("Save button clicked");

        const code = editor.getValue().trim();
        if (!code) return;

        try {
            const res = await fetch("http://localhost:8081/api/save", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: "code=" + encodeURIComponent(code)
            });

            const result = await res.text();
            console.log("Save response:", result);

            outputBox.innerText = result; // show save result in output
            saveBtn.disabled = true;

            editor.session.getUndoManager().markClean(); // prevent Brave popup

        } catch (err) {
            console.error("Error saving code:", err);
            outputBox.innerText = "Error saving code:\n" + err.message;
        }
    });

    // --- Remove beforeunload popup completely ---
    window.onbeforeunload = null;
});
