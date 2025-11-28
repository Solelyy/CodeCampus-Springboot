package com.codecampus.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table (name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column (nullable = false, unique = true)
    private String username;

    @Column (nullable = false)
    private String password;

    @Column (nullable = false)
    private String role;

    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "email", nullable = false)
    private String email;

    @Column(name = "failed_login_attempts", nullable = false)
    private int failedLoginAttempts = 0;

    @Column
    private LocalDateTime lockoutTime;

    // --- IMPORTANT: Equals and HashCode ---
    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof User)) return false;
        return id != null && id.equals(((User) o).id);
    }

    @Override
    public int hashCode() {
        return 31;
    }

    //Getters and Setters
    public Long getId(){ return id;}
    public void setUsername(String username) { this.username= username;}
    public String getUsername() { return username;}
    public void setPassword(String password) { this.password=password;}
    public String getPassword() { return password;}
    public void setRole(String role) {
        this.role=role.toUpperCase();
    }
    public String getRole() { return role;}
    public String getName() {return name;}
    public void setName(String name) {this.name = name;}

    public String getFirstName(){
        if (name == null || name.isBlank()) return "";
        return name.trim().split(" ")[0];
    }
    public String getRoleForSecurity() {
        return "ROLE_" + role.toUpperCase();
    }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email;}

    public int getFailedLoginAttempts() { return failedLoginAttempts;}
    public void setFailedLoginAttempts(int failedLoginAttempts) {
        this.failedLoginAttempts = failedLoginAttempts;
    }

    public LocalDateTime getLockoutTime() {
        return lockoutTime;
    }

    public void setLockoutTime(LocalDateTime lockoutTime) {
        this.lockoutTime = lockoutTime;
    }
}
