package com.teamproject.backend.controller;

import com.teamproject.backend.dto.ProfileResponse;
import com.teamproject.backend.dto.UpdateProfileRequest;
import com.teamproject.backend.model.User;
import com.teamproject.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

// Deliberately NOT under /api/auth/** — that prefix is permitAll in
// SecurityConfig (register/login must work with no token yet). This path
// falls under the default "anyRequest().authenticated()" rule, so both
// endpoints below require a valid JWT.
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/me")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
            return ResponseEntity.ok(new ProfileResponse(
                    user.getFullName(), user.getEmail(), user.getProfilePictureUrl()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.getFullName() != null) {
                String trimmed = request.getFullName().trim();
                if (trimmed.isEmpty()) {
                    return ResponseEntity.badRequest().body("Name cannot be empty.");
                }
                user.setFullName(trimmed);
            }

            if (request.getProfilePictureUrl() != null) {
                user.setProfilePictureUrl(request.getProfilePictureUrl());
            }

            User saved = userRepository.save(user);
            return ResponseEntity.ok(new ProfileResponse(
                    saved.getFullName(), saved.getEmail(), saved.getProfilePictureUrl()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
