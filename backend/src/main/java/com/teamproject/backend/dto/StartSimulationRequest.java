package com.teamproject.backend.dto;

public class StartSimulationRequest {

    private String careerId;

    public StartSimulationRequest() {
    }

    public String getCareerId() {
        return careerId;
    }

    public void setCareerId(String careerId) {
        this.careerId = careerId;
    }
}