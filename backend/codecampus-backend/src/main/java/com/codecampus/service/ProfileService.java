package com.codecampus.service;

import com.codecampus.dto.ProfileDTO;
import com.codecampus.model.Profile;
import com.codecampus.model.User;
import com.codecampus.repository.ProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    // Use absolute path for uploads
    private final String uploadDir = System.getProperty("user.dir") + "/uploads/profile-pictures/";

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
        // Ensure directory exists
        File dir = new File(uploadDir);
        if (!dir.exists()) dir.mkdirs();
    }

    public ProfileDTO getProfile(User user) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile starter = new Profile();
                    starter.setUser(user);
                    starter.setBio("");
                    starter.setProfilePicture("/uploads/profile-pictures/starter-profile.jpg");
                    return starter;
                });

        String picture = profile.getProfilePicture() != null ? profile.getProfilePicture()
                : "/uploads/profile-pictures/starter-profile.jpg";

        return new ProfileDTO(profile.getBio(), picture);
    }

    public ProfileDTO updateProfile(User user, String bio, MultipartFile profilePicture) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    Profile newProfile = new Profile();
                    newProfile.setUser(user);
                    return newProfile;
                });

        if (bio != null) {
            profile.setBio(bio);
        }

        if (profilePicture != null && !profilePicture.isEmpty()) {
            try {
                String originalFilename = profilePicture.getOriginalFilename();
                if (originalFilename == null) originalFilename = "profile.png";

                // sanitize filename
                originalFilename = originalFilename.replaceAll("[^a-zA-Z0-9.-]", "_");

                File dest = new File(uploadDir + user.getId() + "_" + originalFilename);
                profilePicture.transferTo(dest);

                // Save URL path relative to backend for frontend access
                profile.setProfilePicture("/uploads/profile-pictures/" + dest.getName());

            } catch (IOException e) {
                throw new RuntimeException("Failed to save profile picture", e);
            }
        }

        profileRepository.save(profile);

        String picture = profile.getProfilePicture() != null ? profile.getProfilePicture()
                : "/uploads/profile-pictures/starter-profile.jpg";

        return new ProfileDTO(profile.getBio(), picture);
    }
}
