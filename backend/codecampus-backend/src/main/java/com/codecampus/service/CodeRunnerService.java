package com.codecampus.service;

import com.codecampus.dto.CodeExecutionResultDTO;
import org.springframework.stereotype.Service;

import java.io.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class CodeRunnerService {

    private static final String JDK_PATH = "/Users/jessagozun/.sdkman/candidates/java/current/bin";

    public CodeExecutionResultDTO runJavaCode(String code, String input) {
        CodeExecutionResultDTO result = new CodeExecutionResultDTO();

        boolean hasMain = code.matches("(?s).*public\\s+static\\s+void\\s+main\\s*\\(.*\\).*");
        boolean requiresInput = code.contains("System.in") || code.matches("(?s).*Scanner\\s+\\w+\\s*=\\s*new\\s+Scanner\\s*\\(System\\.in\\).*");

        result.setHasMain(hasMain);
        result.setRequiresInput(requiresInput);

        if (!hasMain) {
            result.setOutput("No runnable code detected.");
            return result;
        }

        String className = extractClassName(code);
        if (className.isEmpty()) className = "Main";

        File javaFile = new File(className + ".java");
        try (FileWriter writer = new FileWriter(javaFile)) {
            writer.write(code);
        } catch (IOException e) {
            result.setOutput("Server Error: Cannot write code file.");
            return result;
        }

        try {
            // Compile
            ProcessBuilder compile = new ProcessBuilder(getExecutable("javac"), javaFile.getAbsolutePath());
            compile.redirectErrorStream(true);
            Process compileProcess = compile.start();

            String compileOutput = new BufferedReader(new InputStreamReader(compileProcess.getInputStream()))
                    .lines().reduce("", (acc, l) -> acc + l + "\n");

            int exitCode = compileProcess.waitFor(); // CHECK EXIT CODE

            if (exitCode != 0) {
                result.setOutput("Compilation Error:\n" + (compileOutput.isBlank() ? "Unknown error." : compileOutput));
                result.setCompileError(true);
                return result;
            }


            // Run
            ProcessBuilder runBuilder = new ProcessBuilder(getExecutable("java"), className);
            runBuilder.redirectErrorStream(true);

            Process runProcess = runBuilder.start();

            // Always close STDIN so the program can't hang waiting for input
            try (BufferedWriter writer = new BufferedWriter(new OutputStreamWriter(runProcess.getOutputStream()))) {
                if (requiresInput && input != null && !input.isEmpty()) {
                    writer.write(input);
                    writer.newLine();
                }
                writer.flush();
            }


            String programOutput = new BufferedReader(new InputStreamReader(runProcess.getInputStream()))
                    .lines().reduce("", (acc, l) -> acc + l + "\n");
            runProcess.waitFor();

            result.setOutput(programOutput.isEmpty() ? "No output." : programOutput);

        } catch (Exception e) {
            result.setOutput("Server Error: " + e.getMessage());
        } finally {
            javaFile.delete();
        }

        return result;
    }

    // --- Utility ---
    private String extractClassName(String code) {
        Pattern pattern = Pattern.compile("\\bclass\\s+(\\w+)\\b");
        Matcher matcher = pattern.matcher(code);
        return matcher.find() ? matcher.group(1) : "";
    }

    private String getExecutable(String command) {
        if (System.getProperty("os.name").toLowerCase().contains("win")) {
            return JDK_PATH + File.separator + command + ".exe";
        } else {
            return JDK_PATH + File.separator + command;
        }
    }
}
