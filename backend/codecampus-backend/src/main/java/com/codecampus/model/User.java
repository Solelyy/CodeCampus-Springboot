package com.codecampus.model;

import jakarta.persistence.*;

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

    @Column(name = "first_name", nullable = false)
    private String firstName;

    @Column(name = "last_name", nullable = false)
    private String lastName;

    @ManyToMany(mappedBy= "students")
    private Set<Course> joinedCourses = new HashSet<>();

    //Getters and Setters
    public Long getId(){ return id;};
    public void setUsername(String username) { this.username= username;}
    public String getUsername() { return username;}
    public void setPassword(String password) { this.password=password;}
    public String getPassword() { return password;}
    public void setRole(String role) { this.role=role;}
    public String getRole() { return role;}
    public String getFirstName() {return firstName;}
    public void setFirstName(String firstName) {this.firstName = firstName;}
    public String getLastName() {return lastName;}
    public void setLastName(String lastName) {this.lastName = lastName;}
    public String getFullName() {
        return firstName + " " + lastName;
    }
    public String getRoleForSecurity() {
        return "ROLE_" + role.toUpperCase();
    }
}
