package com.teamproject.backend.dto;

public class ProfileResponse {

    private String fullName;
    private String email;
    private String profilePictureUrl;

    public ProfileResponse(String fullName, String email, String profilePictureUrl) {
        this.fullName = fullName;
        this.email = email;
        this.profilePictureUrl = profilePictureUrl;
    }

    public String getFullName() {
        return fullName;
    }

    public String getEmail() {
        return email;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }
}
