package com.teamproject.backend.dto;

import java.util.List;

public class SubmitChoiceRequest {

    private String choiceId; // the UUID of the final Choice the user submitted

    private Long scenarioLoadedAt;   // epoch millis, when the scenario/choices appeared
    private Long choiceSubmittedAt;  // epoch millis, when the user hit submit

    private List<String> clickSequence; // e.g. ["A", "C", "A"] — every option key clicked, in order, before submitting

    public SubmitChoiceRequest() {
    }

    public String getChoiceId() {
        return choiceId;
    }

    public void setChoiceId(String choiceId) {
        this.choiceId = choiceId;
    }

    public Long getScenarioLoadedAt() {
        return scenarioLoadedAt;
    }

    public void setScenarioLoadedAt(Long scenarioLoadedAt) {
        this.scenarioLoadedAt = scenarioLoadedAt;
    }

    public Long getChoiceSubmittedAt() {
        return choiceSubmittedAt;
    }

    public void setChoiceSubmittedAt(Long choiceSubmittedAt) {
        this.choiceSubmittedAt = choiceSubmittedAt;
    }

    public List<String> getClickSequence() {
        return clickSequence;
    }

    public void setClickSequence(List<String> clickSequence) {
        this.clickSequence = clickSequence;
    }
}