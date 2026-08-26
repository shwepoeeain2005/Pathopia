package com.teamproject.backend.service;

import com.teamproject.backend.dto.ReflectionSections;
import com.teamproject.backend.dto.SimulationStateResponse;
import com.teamproject.backend.dto.SubmitChoiceRequest;
import com.teamproject.backend.model.*;
import com.teamproject.backend.repository.*;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class SimulationService {

    @Autowired
    private SimulationRunRepository simulationRunRepository;

    @Autowired
    private CareerRepository careerRepository;

    @Autowired
    private ScenarioRepository scenarioRepository;

    @Autowired
    private ChoiceRepository choiceRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private GeminiReflectionService geminiReflectionService;

    private final ObjectMapper objectMapper = new ObjectMapper();

    public SimulationRun startNewRun(UUID userId, String careerId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Career career = careerRepository.findById(careerId)
                .orElseThrow(() -> new RuntimeException("Career not found"));

        List<Scenario> careerScenarios = scenarioRepository.findByCareerId(careerId);
        if (careerScenarios.isEmpty()) {
            throw new RuntimeException("This career has no scenarios yet");
        }
        Scenario firstScenario = findStartingScenario(careerScenarios);

        SimulationRun run = new SimulationRun();
        run.setUser(user);
        run.setCareer(career);
        run.setCurrentScenario(firstScenario);
        run.setStatus("in_progress");
        run.setChoicesHistory("[]");
        run.setAccumulatedScores("{}");
        run.setPauseCount(0);

        return simulationRunRepository.save(run);
    }

    private Scenario findStartingScenario(List<Scenario> scenarios) {
        Set<String> targetedScenarioIds = new HashSet<>();
        for (Scenario s : scenarios) {
            List<Choice> choices = choiceRepository.findByScenarioIdOrderByOptionKeyAsc(s.getId());
            for (Choice c : choices) {
                if (c.getNextScenario() != null) {
                    targetedScenarioIds.add(c.getNextScenario().getId());
                }
            }
        }
        for (Scenario s : scenarios) {
            if (!targetedScenarioIds.contains(s.getId())) {
                return s;
            }
        }
        return scenarios.get(0);
    }

    public Optional<SimulationRun> findUnfinishedRun(UUID userId, String careerId) {
        return simulationRunRepository.findFirstByUserIdAndCareerIdAndStatusOrderByStartedAtDesc(
                userId, careerId, "in_progress");
    }

    public void deleteRun(UUID runId) {
        simulationRunRepository.deleteById(runId);
    }

    public SimulationRun recordResume(UUID runId) {
        SimulationRun run = simulationRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Simulation run not found"));
        run.incrementPauseCount();
        return simulationRunRepository.save(run);
    }

    /**
     * Submits a choice for the current scenario in a run.
     * If this choice completes the run (no next scenario), this just marks
     * it completed and returns — it does NOT generate the AI reflection.
     * Reflection generation can take 40+ seconds (Gemini), so it's kept out
     * of this request entirely; the frontend triggers it as a separate call
     * (generateReflection/regenerateReflection) once it can show a loading
     * state tied to that actual wait, instead of blocking choice submission
     * on it.
     */
    public SimulationChoiceResult submitChoice(UUID runId, SubmitChoiceRequest request) {
        SimulationRun run = simulationRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Simulation run not found"));

        if (!"in_progress".equals(run.getStatus())) {
            throw new RuntimeException("This simulation run is already completed");
        }

        Choice choice = choiceRepository.findById(UUID.fromString(request.getChoiceId()))
                .orElseThrow(() -> new RuntimeException("Choice not found"));

        if (!choice.getScenario().getId().equals(run.getCurrentScenario().getId())) {
            throw new RuntimeException("This choice does not belong to the current scenario");
        }

        int timeSpentSeconds = 0;
        if (request.getScenarioLoadedAt() != null && request.getChoiceSubmittedAt() != null) {
            timeSpentSeconds = (int) ((request.getChoiceSubmittedAt() - request.getScenarioLoadedAt()) / 1000);
        }

        int changedMindCount = 0;
        List<String> clicks = request.getClickSequence();
        if (clicks != null && !clicks.isEmpty()) {
            changedMindCount = Math.max(0, clicks.size() - 1);
        }

        try {
            Map<String, Integer> accumulated = objectMapper.readValue(
                    run.getAccumulatedScores(), Map.class);
            Map<String, Integer> choiceScores = objectMapper.readValue(
                    choice.getTraitScores(), Map.class);

            for (Map.Entry<String, Integer> entry : choiceScores.entrySet()) {
                accumulated.merge(entry.getKey(), entry.getValue(), Integer::sum);
            }
            run.setAccumulatedScores(objectMapper.writeValueAsString(accumulated));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update trait scores", e);
        }

        try {
            List<Map<String, Object>> history = objectMapper.readValue(
                    run.getChoicesHistory(), List.class);

            Map<String, Object> entry = new HashMap<>();
            entry.put("scenarioId", run.getCurrentScenario().getId());
            entry.put("choiceId", choice.getId().toString());
            entry.put("optionKey", choice.getOptionKey());
            entry.put("timeSpentSeconds", timeSpentSeconds);
            entry.put("changedMindCount", changedMindCount);
            entry.put("clickSequence", clicks);

            history.add(entry);
            run.setChoicesHistory(objectMapper.writeValueAsString(history));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update choice history", e);
        }

        Scenario next = choice.getNextScenario();
        if (next == null) {
            run.setStatus("completed");
            run.setCompletedAt(LocalDateTime.now());
            // aiReflection is intentionally left null here — the frontend
            // calls regenerateReflection() as a separate request once it's
            // ready to show a loading state for it.
        } else {
            run.setCurrentScenario(next);
        }

        SimulationRun savedRun = simulationRunRepository.save(run);
        return new SimulationChoiceResult(savedRun, choice.getRealityText());
    }

    /**
     * Generates (or regenerates) the AI reflection for a completed run.
     * This is now the primary trigger for reflection generation — the
     * frontend calls it right after a run completes, once it can show a
     * loading state tied to this actual call — not just a fallback retry.
     * Kept as a separate endpoint/method from submitChoice() specifically
     * so the potentially 40+ second Gemini call never blocks that request.
     */
    public SimulationRun regenerateReflection(UUID runId) {
        SimulationRun run = simulationRunRepository.findById(runId)
                .orElseThrow(() -> new RuntimeException("Simulation run not found"));

        if (!"completed".equals(run.getStatus())) {
            throw new RuntimeException("This run is not completed yet");
        }

        ReflectionSections sections = geminiReflectionService.generateReflection(run);
        try {
            run.setAiReflection(objectMapper.writeValueAsString(sections));
        } catch (Exception e) {
            throw new RuntimeException("Failed to save generated reflection", e);
        }

        return simulationRunRepository.save(run);
    }

    public SimulationStateResponse buildStateResponse(SimulationRun run) {
        return buildStateResponse(run, null);
    }

    public SimulationStateResponse buildStateResponse(SimulationRun run, String lastRealityText) {
        SimulationStateResponse response = new SimulationStateResponse();
        response.setRunId(run.getId().toString());
        response.setStatus(run.getStatus());
        response.setCareerId(run.getCareer().getId());
        response.setCareerTitle(run.getCareer().getTitle());

        Scenario scenario = run.getCurrentScenario();
        response.setScenarioId(scenario.getId());
        response.setScenarioTitle(scenario.getTitle());
        response.setPhase(scenario.getPhase());
        response.setScenarioSetting(scenario.getSetting());
        response.setBackgroundImageUrl(scenario.getBackgroundImageUrl());
        response.setSituation(scenario.getSituation());
        response.setDialogueChunks(scenario.getDialogueChunks());
        response.setEnding(scenario.isEnding());

        List<Choice> choices = choiceRepository.findByScenarioIdOrderByOptionKeyAsc(scenario.getId());
        List<SimulationStateResponse.ChoiceOption> options = new ArrayList<>();
        for (Choice c : choices) {
            options.add(new SimulationStateResponse.ChoiceOption(
                    c.getId().toString(), c.getOptionKey(), c.getText()));
        }
        response.setChoices(options);

        if ("completed".equals(run.getStatus())) {
            response.setAiReflection(run.getAiReflection());
        }

        response.setLastRealityText(lastRealityText);

        return response;
    }

    public static class SimulationChoiceResult {
        private final SimulationRun run;
        private final String realityText;

        public SimulationChoiceResult(SimulationRun run, String realityText) {
            this.run = run;
            this.realityText = realityText;
        }

        public SimulationRun getRun() { return run; }
        public String getRealityText() { return realityText; }
    }
}