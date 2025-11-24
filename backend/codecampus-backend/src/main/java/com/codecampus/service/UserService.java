package com.codecampus.service;

import com.codecampus.repository.UserRepository;
import com.codecampus.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

   // private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // Create user
    public void createUser(String username, String password, String email, String role, String name) throws Exception {
        // --- Validate username
        if (username.length() < 4) {
            throw new Exception("Username must be at least 4 characters long.");
        }

        // --- Validate email format
        String emailRegex = "^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!email.matches(emailRegex)) {
            throw new Exception("Invalid email format.");
        }

        System.out.println("EMAIL RECEIVED BY BACKEND: [" + email + "]");

        // --- Validate password
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$";
        if (!password.matches(passwordRegex)) {
            throw new Exception("Password must contain uppercase, lowercase, number, and special character, and be at least 8 characters long.");
        }

        // --- Validate if username and email exists
        if (userRepository.existsByUsername(username)) {
            throw new Exception("Username already exists.");
        }

        if (userRepository.existsByEmail((email))) {
            throw new Exception("Email already exists");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setName(name);
        user.setEmail(email);

        userRepository.save(user);
    }

    // Find user by username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    // Required by Spring Security — this is how it loads users for authentication
    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return org.springframework.security.core.userdetails.User
                .withUsername(user.getUsername())
                .password(user.getPassword())
                .roles(user.getRoleForSecurity().replace("ROLE_", "")) // Spring Security .roles() will prepend ROLE_
                .build();
    }

    private static final int MAX_FAILED_ATTEMPTS = 5;
    private static final long LOCK_TIME_DURATION = 15; // minutes

    public User loginUser(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found."));

        // Check if account is locked
        if (user.getLockoutTime() != null && user.getLockoutTime().isAfter(LocalDateTime.now())) {
            throw new Exception("Account locked for 15 minutes. Try again later.");
        }

        // Check password
        if (!passwordEncoder.matches(password, user.getPassword())) {
            // Increment failed attempts
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);

            // Lock account if max attempts reached
            if (attempts >= MAX_FAILED_ATTEMPTS) {
                user.setLockoutTime(LocalDateTime.now().plusMinutes(LOCK_TIME_DURATION));
                user.setFailedLoginAttempts(0); // reset counter after lock
            }

            userRepository.save(user);
            throw new Exception("Invalid password.");
        }

        // Reset failed attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockoutTime(null);
        userRepository.save(user);

        return user;
    }
}
