package com.codecampus.service;

import com.codecampus.repository.UserRepository;
import com.codecampus.model.User;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserService implements UserDetailsService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepository userRepository;

   // private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ✅ Create user
    public void createUser(String username, String password, String role, String firstName, String lastName) throws Exception {
        if (username.length() < 4) {
            throw new Exception("Username must be at least 4 characters long.");
        }

        String passwordRegex = "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&]).{8,}$";
        if (!password.matches(passwordRegex)) {
            throw new Exception("Password must contain uppercase, lowercase, number, and special character, and be at least 8 characters long.");
        }

        if (userRepository.existsByUsername(username)) {
            throw new Exception("Username already exists.");
        }

        User user = new User();
        user.setUsername(username);
        user.setPassword(passwordEncoder.encode(password));
        user.setRole(role);
        user.setFirstName(firstName);
        user.setLastName(lastName);

        userRepository.save(user);
    }

    // ✅ Manual login (used only if we bypass Spring Security)
    public User loginUser(String username, String password) throws Exception {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new Exception("User not found."));

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new Exception("Invalid password.");
        }

        return user;
    }

    // ✅ Find user by username
    public User findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found."));
    }

    // ✅ Required by Spring Security — this is how it loads users for authentication
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
}
