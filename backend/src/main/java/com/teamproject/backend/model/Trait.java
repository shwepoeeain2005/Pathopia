package com.teamproject.backend.model;

import jakarta.persistence.*;

@Entity
@Table(name = "traits")
public class Trait {

    @Id
    private String id; // e.g. "communication", "business-acumen"

    @Column(nullable = false)
    private String name; // display name, e.g. "Communication"

    @Column(nullable = false)
    private String type; // "cross-career" or "role-specific"

    @Column(name = "career_id")
    private String careerId; // null if cross-career, else which career (e.g. "data-analyst")

    public Trait() {
    }

    // Getters and setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getCareerId() {
        return careerId;
    }

    public void setCareerId(String careerId) {
        this.careerId = careerId;
    }
}