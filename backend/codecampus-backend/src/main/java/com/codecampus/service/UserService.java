package com.codecampus.service;

import com.codecampus.repository.UserRepository;
import com.codecampus.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public void createUser (String username, String password, String role) throws Exception {
        //Username validation
        if (username.length() < 4) {
            throw new Exception("Username must be at least 4 characters long.");
        }

        //Password validation
        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$";
        if (!password.matches(passwordRegex)) {
            throw new Exception("Password must contain uppercase, lowercase, number, and special character, and be at least 8 characters long.");
        }

        //Check if username already exists
        if (userRepository.existsByUsername(username)){
            throw new Exception("Username already exists.");
        }
        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);

        userRepository.save(user);
    }

    //Sign in
    public User loginUser(String username, String password) throws Exception {
        // find the user by username
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found."));

        // compare raw password with hashed password in DB
        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid password.");
        }

        // return the user (you might exclude the password in response)
        return user;
    }
}
