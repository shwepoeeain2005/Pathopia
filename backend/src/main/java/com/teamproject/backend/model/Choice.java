package com.teamproject.backend.model;

import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "choices")
public class Choice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "scenario_id", nullable = false)
    private Scenario scenario; // which scenario this choice belongs to

    @Column(name = "option_key", nullable = false)
    private String optionKey; // "A", "B", "C", "D"

    @Column(columnDefinition = "TEXT", nullable = false)
    private String text; // the choice text shown to the player

    @ManyToOne
    @JoinColumn(name = "next_scenario_id")
    private Scenario nextScenario; // which scenario this choice leads to (null if this choice ends the run)

    @Column(name = "reality_text", columnDefinition = "TEXT")
    private String realityText; // the "Behind the Career" popup content for this choice

    @Column(name = "trait_scores", columnDefinition = "TEXT")
    private String traitScores; // stored as JSON string, e.g. {"communication": 15, "problem-solving": 10}

    public Choice() {
    }

    // Getters and setters

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public Scenario getScenario() {
        return scenario;
    }

    public void setScenario(Scenario scenario) {
        this.scenario = scenario;
    }

    public String getOptionKey() {
        return optionKey;
    }

    public void setOptionKey(String optionKey) {
        this.optionKey = optionKey;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Scenario getNextScenario() {
        return nextScenario;
    }

    public void setNextScenario(Scenario nextScenario) {
        this.nextScenario = nextScenario;
    }

    public String getRealityText() {
        return realityText;
    }

    public void setRealityText(String realityText) {
        this.realityText = realityText;
    }

    public String getTraitScores() {
        return traitScores;
    }

    public void setTraitScores(String traitScores) {
        this.traitScores = traitScores;
    }
}