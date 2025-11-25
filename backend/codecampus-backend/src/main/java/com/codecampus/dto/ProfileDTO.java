package com.codecampus.dto;

public class ProfileDTO {
    private String bio;
    private String profilePicture;

    public ProfileDTO(String bio, String profilePicture) {
        this.bio = bio;
        this.profilePicture = profilePicture;
    }

    // Getters & Setters
    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getProfilePicture() { return profilePicture; }
    public void setProfilePicture(String profilePicture) { this.profilePicture = profilePicture; }
}
