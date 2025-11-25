package com.codecampus.service;

import com.codecampus.dto.ProfileDTO;
import com.codecampus.model.Profile;
import com.codecampus.model.User;
import com.codecampus.repository.ProfileRepository;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    public ProfileDTO getProfile(User user) {
        Profile profile = profileRepository.findByUser(user)
                .orElseGet(() -> {
                    // Return a starter profile if not found
                    Profile starter = new Profile();
                    starter.setUser(user);
                    starter.setBio("");
                    starter.setProfilePicture("/frontend/assets/images/starter-profile.jpeg");
                    return starter;
                });

        // Ensure default picture if null
        String picture = profile.getProfilePicture() != null ? profile.getProfilePicture() : "/frontend/assets/images/starter-profile.jpeg";

        return new ProfileDTO(profile.getBio(), picture);
    }
}
