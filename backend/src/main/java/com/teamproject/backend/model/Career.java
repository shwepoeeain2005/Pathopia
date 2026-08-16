package com.teamproject.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "careers")
public class Career {

    @Id
    private String id; // e.g. "data-analyst", "pm", "swe", "uiux"

    @Column(nullable = false)
    private String title; // e.g. "Junior Data Analyst"

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "card_image_url")
    private String cardImageUrl;

    @Column(name = "bg_music_url")
    private String bgMusicUrl;

    public Career() {
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCardImageUrl() {
        return cardImageUrl;
    }

    public void setCardImageUrl(String cardImageUrl) {
        this.cardImageUrl = cardImageUrl;
    }

    public String getBgMusicUrl() {
        return bgMusicUrl;
    }

    public void setBgMusicUrl(String bgMusicUrl) {
        this.bgMusicUrl = bgMusicUrl;
    }
}