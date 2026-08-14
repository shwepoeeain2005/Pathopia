package com.teamproject.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "scenarios")
public class Scenario {

    @Id
    private String id; // e.g. "DA_A", "DA_B1"

    @ManyToOne
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @Column(nullable = false)
    private String title;

    private String phase; // e.g. "Phase 1: Problem Definition"

    private String setting; // e.g. "PayUp FinTech Office"

    @Column(name = "background_image_url")
    private String backgroundImageUrl;

    @Column(columnDefinition = "TEXT")
    private String situation; // short setup text shown before dialogue

    @Column(name = "dialogue_chunks", columnDefinition = "TEXT")
    private String dialogueChunks; // stored as JSON string, parsed on the frontend

    @Column(name = "is_ending")
    private boolean isEnding = false; // marks final moment, no "success/fail" label

    public Scenario() {
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public Career getCareer() {
        return career;
    }

    public void setCareer(Career career) {
        this.career = career;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getPhase() {
        return phase;
    }

    public void setPhase(String phase) {
        this.phase = phase;
    }

    public String getSetting() {
        return setting;
    }

    public void setSetting(String setting) {
        this.setting = setting;
    }

    public String getBackgroundImageUrl() {
        return backgroundImageUrl;
    }

    public void setBackgroundImageUrl(String backgroundImageUrl) {
        this.backgroundImageUrl = backgroundImageUrl;
    }

    public String getSituation() {
        return situation;
    }

    public void setSituation(String situation) {
        this.situation = situation;
    }

    public String getDialogueChunks() {
        return dialogueChunks;
    }

    public void setDialogueChunks(String dialogueChunks) {
        this.dialogueChunks = dialogueChunks;
    }

    public boolean isEnding() {
        return isEnding;
    }

    public void setEnding(boolean ending) {
        isEnding = ending;
    }
}