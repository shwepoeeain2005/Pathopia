package com.teamproject.backend.dto;

import java.util.List;

public class SimulationStateResponse {

    private String runId;
    private String status; // "in_progress" or "completed"
    private String careerId;
    private String careerTitle;

    // Current scenario details
    private String scenarioId;
    private String scenarioTitle;
    // e.g. "Onboarding" or "Phase 3" — frontend derives the "Moment N / 8"
    // badge from the trailing number here so it stays correct across a
    // refresh instead of relying on a client-side counter.
    private String phase;
    private String scenarioSetting;
    private String backgroundImageUrl;
    private String situation;
    private String dialogueChunks; // raw JSON string, frontend parses it
    private boolean isEnding;

    // Choices available for the current scenario (empty if isEnding is true)
    private List<ChoiceOption> choices;

    // Only populated when the run is completed
    private String aiReflection;

    // Raw JSON string of the run's running trait totals (same shape as
    // Choice.traitScores, e.g. {"communication": 45, "technical-analysis": 30}).
    // The frontend parses it and feeds it to the Reflection page's radar
    // chart — never shown to the user as a number or grade.
    private String accumulatedScores;

    // Only populated right after a choice submission — holds the reality_text
    // of the choice the player JUST picked, so the frontend can show the
    // Reality popup before moving on to the next moment. Null when this
    // response is from starting/resuming a run (nothing was just chosen).
    private String lastRealityText;

    public static class ChoiceOption {
        private String choiceId;
        private String optionKey;
        private String text;

        public ChoiceOption(String choiceId, String optionKey, String text) {
            this.choiceId = choiceId;
            this.optionKey = optionKey;
            this.text = text;
        }

        public String getChoiceId() { return choiceId; }
        public String getOptionKey() { return optionKey; }
        public String getText() { return text; }
    }

    public SimulationStateResponse() {
    }

    // Getters and setters

    public String getRunId() { return runId; }
    public void setRunId(String runId) { this.runId = runId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getCareerId() { return careerId; }
    public void setCareerId(String careerId) { this.careerId = careerId; }

    public String getCareerTitle() { return careerTitle; }
    public void setCareerTitle(String careerTitle) { this.careerTitle = careerTitle; }

    public String getScenarioId() { return scenarioId; }
    public void setScenarioId(String scenarioId) { this.scenarioId = scenarioId; }

    public String getScenarioTitle() { return scenarioTitle; }
    public void setScenarioTitle(String scenarioTitle) { this.scenarioTitle = scenarioTitle; }

    public String getPhase() { return phase; }
    public void setPhase(String phase) { this.phase = phase; }

    public String getScenarioSetting() { return scenarioSetting; }
    public void setScenarioSetting(String scenarioSetting) { this.scenarioSetting = scenarioSetting; }

    public String getBackgroundImageUrl() { return backgroundImageUrl; }
    public void setBackgroundImageUrl(String backgroundImageUrl) { this.backgroundImageUrl = backgroundImageUrl; }

    public String getSituation() { return situation; }
    public void setSituation(String situation) { this.situation = situation; }

    public String getDialogueChunks() { return dialogueChunks; }
    public void setDialogueChunks(String dialogueChunks) { this.dialogueChunks = dialogueChunks; }

    public boolean isEnding() { return isEnding; }
    public void setEnding(boolean ending) { isEnding = ending; }

    public List<ChoiceOption> getChoices() { return choices; }
    public void setChoices(List<ChoiceOption> choices) { this.choices = choices; }

    public String getAiReflection() { return aiReflection; }
    public void setAiReflection(String aiReflection) { this.aiReflection = aiReflection; }

    public String getAccumulatedScores() { return accumulatedScores; }
    public void setAccumulatedScores(String accumulatedScores) { this.accumulatedScores = accumulatedScores; }

    public String getLastRealityText() { return lastRealityText; }
    public void setLastRealityText(String lastRealityText) { this.lastRealityText = lastRealityText; }
}