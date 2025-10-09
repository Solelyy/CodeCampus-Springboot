package com.codecampus.controller;

import org.springframework.web.bind.annotation.*;
import java.io.*;

@RestController
@RequestMapping("/api")
public class CodeRunnerController {

    // Use SDKMAN Java path on Mac
    private static final String JDK_PATH = "/Users/jessagozun/.sdkman/candidates/java/current/bin";

    @PostMapping("/run")
    public String runCode(@RequestParam String code) {
        File file = new File("Main.java");

        // Write user code to Main.java
        try (FileWriter writer = new FileWriter(file)) {
            writer.write(code);
        } catch (IOException e) {
            e.printStackTrace();
            return "Server Error: Cannot write code file.\n" + e.getMessage();
        }

        try {
            // --- Compile ---
            ProcessBuilder compile = new ProcessBuilder(
                    getExecutable("javac"),
                    file.getAbsolutePath()
            );
            compile.redirectErrorStream(true);
            Process compileProcess = compile.start();
            String compileOutput = new String(compileProcess.getInputStream().readAllBytes());
            compileProcess.waitFor();

            if (!compileOutput.isEmpty()) {
                return "Compilation Error:\n" + compileOutput;
            }

            // --- Run ---
            ProcessBuilder run = new ProcessBuilder(
                    getExecutable("java"),
                    "Main"
            );
            run.redirectErrorStream(true);
            Process runProcess = run.start();
            String runOutput = new String(runProcess.getInputStream().readAllBytes());
            runProcess.waitFor();

            return runOutput.isEmpty() ? "No output." : runOutput;

        } catch (Exception e) {
            e.printStackTrace();
            return "Server Error: " + e.getMessage();
        } finally {
            file.delete(); // Remove temporary file
        }
    }

    private String getExecutable(String command) {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return JDK_PATH + File.separator + command + ".exe";
        } else {
            return JDK_PATH + File.separator + command;
        }
    }
}
