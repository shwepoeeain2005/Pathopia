package com.teamproject.backend.controller;

import com.teamproject.backend.dto.StartSimulationRequest;
import com.teamproject.backend.dto.SubmitChoiceRequest;
import com.teamproject.backend.model.SimulationRun;
import com.teamproject.backend.service.SimulationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/simulation")
public class SimulationController {

    @Autowired
    private SimulationService simulationService;

    /**
     * Checks if the logged-in user already has an unfinished run for this
     * career. Frontend calls this BEFORE starting a new run, to decide
     * whether to show the Resume Conflict popup.
     */
    @GetMapping("/check-unfinished/{careerId}")
    public ResponseEntity<?> checkUnfinished(
            @PathVariable String careerId,
            Authentication authentication
    ) {
        UUID userId = UUID.fromString(authentication.getName());

        Optional<SimulationRun> existing = simulationService.findUnfinishedRun(userId, careerId);

        if (existing.isPresent()) {
            SimulationRun run = existing.get();
            return ResponseEntity.ok(new UnfinishedRunInfo(
                    run.getId().toString(),
                    run.getCareer().getId(),
                    run.getCareer().getTitle()
            ));
        }
        return ResponseEntity.ok().body(null);
    }

    /**
     * Starts a brand new run. If an unfinished run already exists for this
     * career, the frontend should have already resolved that via the
     * Resume Conflict popup (calling DELETE /api/simulation/{runId} first
     * if the user chose "Start New").
     */
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

    /**
     * Deletes an unfinished run — called when the user picks "Start New"
     * over resuming an existing unfinished run.
     */
    @DeleteMapping("/{runId}")
    public ResponseEntity<?> deleteRun(@PathVariable String runId) {
        try {
            simulationService.deleteRun(UUID.fromString(runId));
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * Resumes an existing run — returns its current state, and records
     * that a resume happened (increments pauseCount).
     */
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
     * Submits a choice for the current scenario in a run. This is the
     * core gameplay loop endpoint — called every time the user picks A/B/C/D.
     */
    @PostMapping("/{runId}/choice")
    public ResponseEntity<?> submitChoice(
            @PathVariable String runId,
            @RequestBody SubmitChoiceRequest request
    ) {
        try {
            SimulationRun run = simulationService.submitChoice(UUID.fromString(runId), request);
            return ResponseEntity.ok(simulationService.buildStateResponse(run));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Small inline response shape for the unfinished-run check
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