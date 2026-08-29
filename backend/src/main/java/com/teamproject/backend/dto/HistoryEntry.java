package com.teamproject.backend.dto;

public class HistoryEntry {

    private String runId;
    private String careerId;
    private String careerTitle;
    private String completedAt; // ISO string

    public HistoryEntry(String runId, String careerId, String careerTitle, String completedAt) {
        this.runId = runId;
        this.careerId = careerId;
        this.careerTitle = careerTitle;
        this.completedAt = completedAt;
    }

    public String getRunId() { return runId; }
    public String getCareerId() { return careerId; }
    public String getCareerTitle() { return careerTitle; }
    public String getCompletedAt() { return completedAt; }
}