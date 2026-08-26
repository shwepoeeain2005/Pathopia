package com.teamproject.backend.service;

import com.teamproject.backend.dto.ReflectionSections;
import com.teamproject.backend.model.Career;
import com.teamproject.backend.model.SimulationRun;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class GeminiReflectionService {

    // Read from backend/.env via the existing DotenvEnvironmentPostProcessor,
    // same mechanism as DB_URL / JWT_SECRET.
    @Value("${GEMINI_API_KEY}")
    private String apiKey;

    private static final String GEMINI_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * Generates the 5-section reflection for a completed simulation run.
     * Gathers accumulated trait scores + behavioral data from choices_history,
     * builds the prompt, calls Gemini, and parses the JSON response.
     */
    public ReflectionSections generateReflection(SimulationRun run) {
        Career career = run.getCareer();

        String prompt = buildPrompt(run, career);
        String rawResponseText = callGemini(prompt);
        return parseResponse(rawResponseText);
    }

    private String buildPrompt(SimulationRun run, Career career) {
        String accumulatedScoresJson = run.getAccumulatedScores();
        String behaviorDataJson = summarizeBehaviorData(run.getChoicesHistory());
        int pauseCount = run.getPauseCount() != null ? run.getPauseCount() : 0;

        return """
            You are writing a calm, thoughtful reflection for a user who just \
            completed a career simulation. Respond ONLY with a valid JSON object \
            matching the exact schema below — no markdown, no code fences, no \
            explanation before or after, just the raw JSON.

            CONTEXT:
            Career: %s
            Career description: %s

            Accumulated trait tendencies (relative emphasis across choices made, \
            NOT scores or grades — do not reference these as numbers anywhere in \
            your output):
            %s

            Behavioral data across the playthrough (average time spent per \
            decision in seconds, and how many times the user changed their mind \
            before confirming a choice, per moment):
            %s

            Number of times the user paused and resumed this simulation session: %d

            STRICT RULES — violating any of these is a failure:
            1. Write entirely in Burmese (Myanmar Unicode), except for the JSON \
            keys themselves, which must stay in English exactly as shown in the \
            schema below.
            2. NEVER mention numbers, percentages, scores, grades, or point \
            values anywhere in the Burmese text. Describe tendencies in plain \
            descriptive language only.
            3. NEVER reference specific scenario names, specific choice letters \
            (A/B/C/D), or specific moments by name. Speak only in overall \
            patterns and tendencies.
            4. Write in second person, calm and warm tone, never clinical or \
            robotic-sounding.
            5. Each section should be genuinely substantial — 3-5 sentences \
            minimum per section, written with real specificity.
            6. Notice contradictions or selective patterns where they exist.
            7. The final section ("careerCompatibility") MUST include an \
            explicit statement that this simulation cannot determine the \
            user's future, before offering any suggestion.
            8. Do not use bullet points or lists — write in flowing prose.
            9. Keep only the word "simulation" in English rather than\s
            transliterating it into Burmese phonetics (e.g. "...ဒီ Simulation\s
            တစ်ခုလုံးမှာ..."). All other technical or trait-related terms\s
            (Root Cause, Trade-off, Data Integrity, etc.) may be written in\s
            whichever language — English or Burmese — reads most naturally in\s
            context, exactly as your own scenario scripts already do. Do not force\s
            English on these terms.

            RETURN EXACTLY THIS JSON SCHEMA (keys in English, values in Burmese):
            {
              "whatYouExperienced": "...",
              "decisionPattern": "...",
              "pressureApproach": "...",
              "challengesAhead": "...",
              "careerCompatibility": "..."
            }
            """.formatted(
                career.getTitle(),
                career.getDescription(),
                accumulatedScoresJson,
                behaviorDataJson,
                pauseCount
        );
    }

    /**
     * Reads choices_history and produces a small summary of timing/mind-change
     * patterns rather than dumping the raw array — keeps the prompt compact
     * and gives the model pre-digested signal instead of raw logs.
     */
    private String summarizeBehaviorData(String choicesHistoryJson) {
        try {
            List<Map<String, Object>> history = objectMapper.readValue(choicesHistoryJson, List.class);
            if (history.isEmpty()) {
                return "{}";
            }

            int totalTime = 0;
            int totalChanges = 0;
            int maxTime = 0;
            int maxChanges = 0;

            for (Map<String, Object> entry : history) {
                int t = ((Number) entry.getOrDefault("timeSpentSeconds", 0)).intValue();
                int c = ((Number) entry.getOrDefault("changedMindCount", 0)).intValue();
                totalTime += t;
                totalChanges += c;
                maxTime = Math.max(maxTime, t);
                maxChanges = Math.max(maxChanges, c);
            }

            int count = history.size();
            Map<String, Object> summary = new LinkedHashMap<>();
            summary.put("averageSecondsPerDecision", count > 0 ? totalTime / count : 0);
            summary.put("totalMindChanges", totalChanges);
            summary.put("longestPauseOnADecision", maxTime);
            summary.put("mostMindChangesOnOneDecision", maxChanges);
            summary.put("totalDecisionsMade", count);

            return objectMapper.writeValueAsString(summary);
        } catch (Exception e) {
            return "{}";
        }
    }

    private String callGemini(String prompt) {
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String urlWithKey = GEMINI_URL + "?key=" + apiKey;

        Map response = restTemplate.postForObject(urlWithKey, requestEntity, Map.class);

        // Navigate Gemini's response shape: candidates[0].content.parts[0].text
        List<Map> candidates = (List<Map>) response.get("candidates");
        Map firstCandidate = candidates.get(0);
        Map contentObj = (Map) firstCandidate.get("content");
        List<Map> parts = (List<Map>) contentObj.get("parts");
        return (String) parts.get(0).get("text");
    }

    private ReflectionSections parseResponse(String rawText) {
        // Gemini sometimes wraps JSON in markdown code fences despite
        // instructions not to — strip them defensively before parsing.
        String cleaned = rawText.trim();
        if (cleaned.startsWith("```")) {
            cleaned = cleaned.replaceAll("^```(json)?", "").replaceAll("```$", "").trim();
        }

        try {
            return objectMapper.readValue(cleaned, ReflectionSections.class);
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Gemini reflection response: " + rawText, e);
        }
    }
}