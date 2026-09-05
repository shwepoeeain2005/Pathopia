package com.teamproject.backend.service;

import com.teamproject.backend.dto.ReflectionSections;
import com.teamproject.backend.model.SimulationRun;
import com.teamproject.backend.repository.SimulationRunRepository;
import tools.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.Set;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Owns AI-reflection generation for a completed run. Split out of
 * {@link SimulationService} so the {@code @Async} entry point is invoked
 * across a bean boundary (a self-invocation would bypass the async proxy).
 */
@Service
public class ReflectionGenerationService {

    private static final Logger log = LoggerFactory.getLogger(ReflectionGenerationService.class);

    @Autowired
    private SimulationRunRepository simulationRunRepository;

    @Autowired
    private GeminiReflectionService geminiReflectionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    // runIds whose reflection is currently being generated on a background
    // thread — so a duplicate trigger (the frontend fallback firing while the
    // submit-time job is still running) doesn't kick off a second Gemini round.
    private final Set<UUID> inFlight = ConcurrentHashMap.newKeySet();

    /**
     * Generates the AI reflection for a completed run and saves it. Idempotent:
     * returns early if the run already has one, so the synchronous fallback
     * endpoint and the background job can't clobber each other.
     */
    public void generateAndSave(UUID runId) {
        SimulationRun run = simulationRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Simulation run not found"));

        if (!"completed".equals(run.getStatus())) {
            throw new RuntimeException("This run is not completed yet");
        }
        if (run.getAiReflection() != null) {
            return;
        }

        ReflectionSections sections = geminiReflectionService.generateReflection(run);
        try {
            run.setAiReflection(objectMapper.writeValueAsString(sections));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save generated reflection", e);
        }
        simulationRunRepository.save(run);
    }

    /**
     * Fire-and-forget variant, triggered the moment a run completes so
     * generation overlaps the Reality box and the "What You Experienced" screen
     * the player sees next. Failures are logged, not propagated — the frontend
     * falls back to the synchronous regenerate-reflection endpoint.
     */
    @Async("reflectionExecutor")
    public void generateAndSaveAsync(UUID runId) {
        if (!inFlight.add(runId)) {
            return;
        }
        try {
            generateAndSave(runId);
        } catch (Exception e) {
            log.warn("Background reflection generation failed for run {}: {}", runId, e.getMessage());
        } finally {
            inFlight.remove(runId);
        }
    }
}
