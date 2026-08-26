package com.teamproject.backend.repository;

import com.teamproject.backend.model.Choice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ChoiceRepository extends JpaRepository<Choice, UUID> {

    // Get all choices (A/B/C/D) for one scenario, so the Simulation page can display them
    List<Choice> findByScenarioIdOrderByOptionKeyAsc(String scenarioId);
}