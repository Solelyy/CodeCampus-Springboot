package com.codecampus.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5500") // change to your frontend port
public class CodeRunnerController {

    // Path to Java SDK (Mac SDKMAN example)
    private static final String JDK_PATH = "/Users/jessagozun/.sdkman/candidates/java/current/bin";

    @PostMapping("/run")
    public ResponseEntity<String> runCode(@RequestParam String code) {
        File file = new File("Main.java");

        try (FileWriter writer = new FileWriter(file)) {
            writer.write(code);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server Error: Cannot write code file.\n" + e.getMessage());
        }

        try {
            // Compile
            ProcessBuilder compile = new ProcessBuilder(getExecutable("javac"), file.getAbsolutePath());
            compile.redirectErrorStream(true);
            Process compileProcess = compile.start();

            String compileOutput = new BufferedReader(new InputStreamReader(compileProcess.getInputStream()))
                    .lines()
                    .reduce("", (acc, l) -> acc + l + "\n");
            compileProcess.waitFor();

            if (!compileOutput.isEmpty()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.TEXT_PLAIN)
                        .body("Compilation Error:\n" + compileOutput);
            }

            // Run
            ProcessBuilder run = new ProcessBuilder(getExecutable("java"), "Main");
            run.redirectErrorStream(true);
            Process runProcess = run.start();

            String runOutput = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))
                    .lines()
                    .reduce("", (acc, l) -> acc + l + "\n");
            runProcess.waitFor();

            return ResponseEntity.ok()
                    .contentType(MediaType.TEXT_PLAIN)
                    .body(runOutput.isEmpty() ? "No output." : runOutput);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server Error: " + e.getMessage());
        } finally {
            file.delete();
        }
    }

    @PostMapping("/save")
    public ResponseEntity<String> saveCode(@RequestParam String code) {
        String filename = "SavedCode_" + System.currentTimeMillis() + ".java";
        File file = new File(filename);

        try (FileWriter writer = new FileWriter(file)) {
            writer.write(code);
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500)
                    .contentType(MediaType.TEXT_PLAIN)
                    .body("Server Error: Cannot save code.\n" + e.getMessage());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body("Code saved successfully as " + filename);
    }

    private String getExecutable(String command) {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return JDK_PATH + File.separator + command + ".exe";
        } else {
            return JDK_PATH + File.separator + command;
        }
    }
}
