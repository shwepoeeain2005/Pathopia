package com.teamproject.backend.controller;

import com.teamproject.backend.dto.HistoryEntry;
import com.teamproject.backend.dto.SimulationStateResponse;
import com.teamproject.backend.dto.StartSimulationRequest;
import com.teamproject.backend.dto.SubmitChoiceRequest;
import com.teamproject.backend.model.SimulationRun;
import com.teamproject.backend.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    @Autowired
    private SimulationService simulationService;

    @GetMapping("/check-unfinished")
    public ResponseEntity<?> checkUnfinished(Authentication authentication) {
        try {
            UUID userId = UUID.fromString(authentication.getName());

            Optional<SimulationRun> existing = simulationService.findUnfinishedRun(userId);

            if (existing.isPresent()) {
                SimulationRun run = existing.get();
                return ResponseEntity.ok(new UnfinishedRunInfo(
                        run.getId().toString(),
                        run.getCareer().getId(),
                        run.getCareer().getTitle()
                ));
            }
            return ResponseEntity.ok().body(null);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/start")
    public ResponseEntity<?> startSimulation(
            @RequestBody StartSimulationRequest request,
            Authentication authentication
    ) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            SimulationRun run = simulationService.startNewRun(userId, request.getCareerId());
            return ResponseEntity.ok(simulationService.buildStateResponse(run));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{runId}")
    public ResponseEntity<?> deleteRun(@PathVariable String runId, Authentication authentication) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            simulationService.deleteRun(UUID.fromString(runId), userId);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/{runId}/resume")
    public ResponseEntity<?> resumeRun(@PathVariable String runId) {
        try {
            SimulationRun run = simulationService.recordResume(UUID.fromString(runId));
            return ResponseEntity.ok(simulationService.buildStateResponse(run));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Submits a choice. The response now includes lastRealityText — the
     * reality_text of the choice the player just picked — so the frontend
     * can show the Reality popup before advancing to the next moment.
     * If this choice completes the run, the reflection is generated and
     * included in the response's aiReflection field automatically.
     */
    @PostMapping("/{runId}/choice")
    public ResponseEntity<?> submitChoice(
            @PathVariable String runId,
            @RequestBody SubmitChoiceRequest request
    ) {
        try {
            SimulationService.SimulationChoiceResult result =
                    simulationService.submitChoice(UUID.fromString(runId), request);
            SimulationStateResponse response = simulationService.buildStateResponse(
                    result.getRun(), result.getRealityText());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Fallback endpoint: re-triggers background reflection generation for a
     * completed run that doesn't have one yet (e.g. the job started at
     * completion died on a transient Gemini error). Returns the run's current
     * state right away — it never blocks on Gemini. The frontend polls
     * GET /{runId} for the result.
     */
    @PostMapping("/{runId}/regenerate-reflection")
    public ResponseEntity<?> regenerateReflection(@PathVariable String runId) {
        try {
            SimulationRun run = simulationService.regenerateReflection(UUID.fromString(runId));
            return ResponseEntity.ok(simulationService.buildStateResponse(run));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Returns the logged-in user's completed simulation history,
     * newest first.
     */
    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            List<HistoryEntry> history = simulationService.getHistory(userId);
            return ResponseEntity.ok(history);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Returns the full state of one specific run (used to reopen an old
     * completed run's reflection via the History page). Only the run's
     * own owner can fetch it.
     */
    @GetMapping("/{runId}")
    public ResponseEntity<?> getRun(
            @PathVariable String runId,
            Authentication authentication
    ) {
        try {
            UUID userId = UUID.fromString(authentication.getName());
            SimulationStateResponse response = simulationService.getRunById(
                    UUID.fromString(runId), userId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    static class UnfinishedRunInfo {
        public String runId;
        public String careerId;
        public String careerTitle;

        public UnfinishedRunInfo(String runId, String careerId, String careerTitle) {
            this.runId = runId;
            this.careerId = careerId;
            this.careerTitle = careerTitle;
        }
    }
}