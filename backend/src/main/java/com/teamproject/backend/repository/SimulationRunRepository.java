package com.teamproject.backend.repository;

import com.teamproject.backend.model.SimulationRun;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface SimulationRunRepository extends JpaRepository<SimulationRun, UUID> {

    // Get all of one user's simulation runs (used for History page)
    List<SimulationRun> findByUserId(UUID userId);

    // Check if a user has an unfinished simulation for a given career (used for the Resume/Start New popup)
    Optional<SimulationRun> findByUserIdAndCareerIdAndStatus(UUID userId, String careerId, String status);

    // Get all completed runs for a user, most recent first (used for History list + Dashboard "Recent History")
    List<SimulationRun> findByUserIdAndStatusOrderByCompletedAtDesc(UUID userId, String status);
}

