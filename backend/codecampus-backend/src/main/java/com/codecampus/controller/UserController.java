package com.codecampus.controller;

import com.codecampus.model.User;
import com.codecampus.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import com.codecampus.dto.AuthResponse;
import com.codecampus.security.JwtUtil;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @PostMapping("/signup")
    public ResponseEntity<Map<String, Object>> signup(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String email = request.get("email");
        String password = request.get("password");
        String role = request.get("role");
        String name = request.get("name");

        try {
            userService.createUser(username, password, email, role, name);
            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Account created successfully"
            ));
        } catch (Exception e) {
            // Always return JSON, even on errors
            return ResponseEntity
                    .badRequest()
                    .body(Map.of(
                            "status", "error",
                            "message", e.getMessage() != null ? e.getMessage() : "An unexpected error occurred"
                    ));
        }
    }

    /*
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.get("username"), request.get("password")));
            SecurityContextHolder.getContext().setAuthentication(authentication);

            String username = request.get("username");
            User user = userService.findByUsername(username);
            String token = jwtUtil.generateToken(username);
            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRoleForSecurity()));
        } catch (Exception e) {
            return ResponseEntity.status(401).body(Map.of("error", "Incorrect username or password"));
        }
    }*/

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        String username = request.get("username");
        String password = request.get("password");

        try {
            // Use the UserService login method with failed-attempt tracking
            User user = userService.loginUser(username, password);

            // If login successful, generate JWT token
            String token = jwtUtil.generateToken(username);

            return ResponseEntity.ok(new AuthResponse(token, user.getUsername(), user.getRoleForSecurity()));

        } catch (Exception e) {
            String message = e.getMessage();

            if (message.contains("locked")) {
                return ResponseEntity.status(423) // 423 Locked
                        .body(Map.of("error", message));
            } else if (message.contains("Invalid password")) {
                return ResponseEntity.status(401) // 401 Unauthorized
                        .body(Map.of("error", "Incorrect username or password"));
            } else if (message.contains("User not found")) {
                return ResponseEntity.status(404) // 404 Not Found
                        .body(Map.of("error", "Incorrect username or password."));
            } else {
                return ResponseEntity.status(400) // 400 Bad Request
                        .body(Map.of("error", "Incorrect username or password."));
            }
        }
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }

        String username = authentication.getName();
        User user = userService.findByUsername(username);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        return ResponseEntity.ok(Map.of(
                "username", user.getUsername(),
                "name", user.getName(),
                "firstName", user.getFirstName(),
                "role", user.getRole()
        ));
    }

    //LOGIN
    /*
    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@RequestBody Map<String, String> request) {
        try {
            String username = request.get("username");
            String password = request.get("password");

            // Authenticate using Spring Security
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(username, password)
            );

            // Store authentication in security context
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Retrieve full user info from DB
            User user = userService.findByUsername(username);

            return ResponseEntity.ok(Map.of(
                    "status", "success",
                    "message", "Login successful",
                    "role", user.getRole(),
                    "firstName", user.getFirstName(),
                    "lastName", user.getLastName()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "error",
                    "message", "Incorrect username or password."
            ));
        }
    } */
}