package com.codecampus.controller;

import com.codecampus.dto.CodeExecutionResultDTO;
import com.codecampus.service.CodeRunnerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "http://localhost:5500")
public class CodeRunnerController {

    @Autowired
    private CodeRunnerService codeRunnerService;

    @PostMapping("/run")
    public ResponseEntity<CodeExecutionResultDTO> runCode(
            @RequestParam String code,
            @RequestParam(required = false) String input
    ) {
        CodeExecutionResultDTO result = codeRunnerService.runJavaCode(code, input);
        return ResponseEntity.ok(result);
    }
}
