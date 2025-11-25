package com.codecampus.controller;

import com.codecampus.dto.ProfileDTO;
import com.codecampus.model.User;
import com.codecampus.service.ProfileService;
import com.codecampus.service.UserService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {

    private final ProfileService profileService;
    private final UserService userService;

    public ProfileController(ProfileService profileService, UserService userService) {
        this.profileService = profileService;
        this.userService = userService;
    }

    @GetMapping
    public ProfileDTO getProfile(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) throw new RuntimeException("User not authenticated");

        User user = userService.findByUsername(userDetails.getUsername());
        if (user == null) throw new RuntimeException("User not found");

        return profileService.getProfile(user);
    }
}
