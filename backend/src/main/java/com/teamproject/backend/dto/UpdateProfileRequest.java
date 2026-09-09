package com.teamproject.backend.dto;

public class UpdateProfileRequest {

    // Null means "leave unchanged" for each field, so the caller can update
    // just the name, just the picture, or both in one request.
    private String fullName;
    private String profilePictureUrl;

    public UpdateProfileRequest() {
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getProfilePictureUrl() {
        return profilePictureUrl;
    }

    public void setProfilePictureUrl(String profilePictureUrl) {
        this.profilePictureUrl = profilePictureUrl;
    }
}
