package com.codecampus.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5500")
public class CodeRunnerController {

    // Path to Java SDK
    private static final String JDK_PATH = "/Users/jessagozun/.sdkman/candidates/java/current/bin";

    @PostMapping("/run")
    public ResponseEntity<?> runCode(@RequestParam String code, @RequestParam(required = false) String input) {
        boolean hasMain = code.matches("(?s).*public\\s+static\\s+void\\s+main\\s*\\(.*\\).*");
        boolean requiresInput = code.contains("System.in") || code.matches("(?s).*Scanner\\s+\\w+\\s*=\\s*new\\s+Scanner\\s*\\(System\\.in\\).*");

        if (!hasMain) {
            String jsonResponse = String.format("{\"output\":\"No runnable code detected.\", \"requiresInput\":false, \"hasMain\":false}");
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(jsonResponse);
        }

        String className = extractClassName(code);
        if (className.isEmpty()) className = "Main";

        File javaFile = new File(className + ".java");
        try (FileWriter writer = new FileWriter(javaFile)) {
            writer.write(code);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body("{\"output\":\"Server Error: Cannot write code file.\", \"requiresInput\":false, \"hasMain\":false}");
        }

        String output = "";
        try {
            // Compile
            ProcessBuilder compile = new ProcessBuilder(getExecutable("javac"), javaFile.getAbsolutePath());
            compile.redirectErrorStream(true);
            Process compileProcess = compile.start();

            output = new BufferedReader(new InputStreamReader(compileProcess.getInputStream()))
                    .lines().reduce("", (acc, l) -> acc + l + "\n");
            compileProcess.waitFor();

            if (!output.isEmpty()) {
                String json = String.format("{\"output\":\"Compilation Error:\\n%s\", \"requiresInput\":false, \"hasMain\":true}", escapeJson(output));
                return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(json);
            }

            // Run
            ProcessBuilder runBuilder = new ProcessBuilder(getExecutable("java"), className);
            runBuilder.redirectErrorStream(true);
            Process runProcess = runBuilder.start();

            // Provide input if needed
            if (requiresInput && input != null && !input.isEmpty()) {
                try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                    writer.write(input);
                    writer.newLine();
                    writer.flush();
                }
            }

            output = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))
                    .lines().reduce("", (acc, l) -> acc + l + "\n");

            runProcess.waitFor();

        } catch (Exception e) {
            e.printStackTrace();
            String json = String.format("{\"output\":\"Server Error: %s\", \"requiresInput\":false, \"hasMain\":true}", escapeJson(e.getMessage()));
            return ResponseEntity.status(500).contentType(MediaType.APPLICATION_JSON).body(json);
        } finally {
            javaFile.delete();
        }

        if (output.isEmpty()) output = "No output.";

        String jsonResponse = String.format("{\"output\":\"%s\", \"requiresInput\":%b, \"hasMain\":true}", escapeJson(output), requiresInput);
        return ResponseEntity.ok().contentType(MediaType.APPLICATION_JSON).body(jsonResponse);
    }



    // --- Utility: Extract class name ---
    private String extractClassName(String code) {
        Pattern pattern = Pattern.compile("\\bclass\\s+(\\w+)\\b");
        Matcher matcher = pattern.matcher(code);
        return matcher.find() ? matcher.group(1) : "";
    }

    // --- Escape JSON string ---
    private String escapeJson(String s) {
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", "\\n");
    }

    private String getExecutable(String command) {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return JDK_PATH + File.separator + command + ".exe";
        } else {
            return JDK_PATH + File.separator + command;
        }
    }
}
