package com.teamproject.backend.dto;

public class ReflectionSections {

    private String whatYouExperienced;
    private String decisionPattern;
    private String pressureApproach;
    private String challengesAhead;
    private String careerCompatibility;

    public ReflectionSections() {
    }

    public String getWhatYouExperienced() { return whatYouExperienced; }
    public void setWhatYouExperienced(String v) { this.whatYouExperienced = v; }

    public String getDecisionPattern() { return decisionPattern; }
    public void setDecisionPattern(String v) { this.decisionPattern = v; }

    public String getPressureApproach() { return pressureApproach; }
    public void setPressureApproach(String v) { this.pressureApproach = v; }

    public String getChallengesAhead() { return challengesAhead; }
    public void setChallengesAhead(String v) { this.challengesAhead = v; }

    public String getCareerCompatibility() { return careerCompatibility; }
    public void setCareerCompatibility(String v) { this.careerCompatibility = v; }
}