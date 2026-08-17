package com.teamproject.backend.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulation_runs")
public class SimulationRun {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @ManyToOne
    @JoinColumn(name = "current_scenario_id")
    private Scenario currentScenario; // where the user currently is; enables Continue/resume

    @Column(nullable = false)
    private String status = "in_progress"; // "in_progress" or "completed" — no grade/tier field

    @Column(name = "choices_history", columnDefinition = "TEXT")
    private String choicesHistory; // JSON array of every choice made, in order, including behavior data

    @Column(name = "accumulated_scores", columnDefinition = "TEXT")
    private String accumulatedScores; // JSON — running trait totals, never shown as a number/grade to the user

    @Column(name = "pause_count")
    private Integer pauseCount = 0; // how many times the user exited and resumed this run

    @Column(name = "ai_reflection", columnDefinition = "TEXT")
    private String aiReflection; // generated reflection text, saved once completed

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt; // null while still in progress

    @PrePersist
    protected void onCreate() {
        this.startedAt = LocalDateTime.now();
    }

    public SimulationRun() {
    }

    // Getters and setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public Career getCareer() {
        return career;
    }

    public void setCareer(Career career) {
        this.career = career;
    }

    public Scenario getCurrentScenario() {
        return currentScenario;
    }

    public void setCurrentScenario(Scenario currentScenario) {
        this.currentScenario = currentScenario;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getChoicesHistory() {
        return choicesHistory;
    }

    public void setChoicesHistory(String choicesHistory) {
        this.choicesHistory = choicesHistory;
    }

    public String getAccumulatedScores() {
        return accumulatedScores;
    }

    public void setAccumulatedScores(String accumulatedScores) {
        this.accumulatedScores = accumulatedScores;
    }

    public Integer getPauseCount() {
        return pauseCount;
    }

    public void setPauseCount(Integer pauseCount) {
        this.pauseCount = pauseCount;
    }

    public void incrementPauseCount() {
        this.pauseCount = (this.pauseCount == null ? 0 : this.pauseCount) + 1;
    }

    public String getAiReflection() {
        return aiReflection;
    }

    public void setAiReflection(String aiReflection) {
        this.aiReflection = aiReflection;
    }

    public LocalDateTime getStartedAt() {
        return startedAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
