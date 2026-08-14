package com.teamproject.backend.repository;

import com.teamproject.backend.model.Scenario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScenarioRepository extends JpaRepository<Scenario, String> {

    // Get all scenarios belonging to one career (e.g. all Data Analyst scenes)
    List<Scenario> findByCareerId(String careerId);
}