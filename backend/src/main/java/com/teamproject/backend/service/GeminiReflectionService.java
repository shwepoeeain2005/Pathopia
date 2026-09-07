package com.teamproject.backend.service;

import com.teamproject.backend.dto.ReflectionSections;
import com.teamproject.backend.model.Career;
import com.teamproject.backend.model.SimulationRun;
import tools.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.CompletionException;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadLocalRandom;

@Service
public class GeminiReflectionService {

    private final String apiKey;
    private final Executor reflectionExecutor;

    /**
     * Base host for the Gemini REST API. Defaults to Google directly, but can be
     * pointed at a reverse proxy (e.g. a Cloudflare Worker) via the
     * {@code GEMINI_API_BASE_URL} env var. This is how we reach Gemini from
     * regions Google geo-blocks without running a VPN on the machine.
     */
    private final String geminiUrl;

    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate;

    public GeminiReflectionService(
            @Value("${GEMINI_API_KEY}") String apiKey,
            @Value("${GEMINI_API_BASE_URL:https://generativelanguage.googleapis.com}") String baseUrl,
            @Qualifier("reflectionExecutor") Executor reflectionExecutor) {
        this.apiKey = apiKey;
        this.geminiUrl = baseUrl.replaceAll("/+$", "")
                + "/v1beta/models/gemini-3.6-flash:generateContent";
        this.reflectionExecutor = reflectionExecutor;

        // Reflection calls are slow (tens of seconds) but must not hang
        // forever — running on a background pool, a stuck socket would pin a
        // thread indefinitely (the old code used a bare RestTemplate with no
        // timeouts at all).
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(10_000);
        factory.setReadTimeout(90_000);
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Generates the reflection as two Gemini calls run in parallel: one for the
     * "decision pattern / pressure approach" pair, one for the "challenges ahead /
     * career compatibility" pair. Splitting the work roughly halves the
     * wall-clock wait versus asking for all sections in a single response.
     *
     * <p>"whatYouExperienced" is no longer generated here — the frontend shows a
     * static version of that section on its own screen while this runs.
     */
    public ReflectionSections generateReflection(SimulationRun run) {
        Career career = run.getCareer();

        CompletableFuture<String> decisionCall = CompletableFuture.supplyAsync(
                () -> callGeminiWithRetry(buildDecisionPrompt(run, career)), reflectionExecutor);
        CompletableFuture<String> challengesCall = CompletableFuture.supplyAsync(
                () -> callGeminiWithRetry(buildChallengesPrompt(run, career)), reflectionExecutor);

        String decisionRaw;
        String challengesRaw;
        try {
            decisionRaw = decisionCall.join();
            challengesRaw = challengesCall.join();
        } catch (CompletionException e) {
            Throwable cause = e.getCause() != null ? e.getCause() : e;
            throw new RuntimeException("Gemini reflection call failed: " + cause.getMessage(), cause);
        }

        ReflectionSections decision = parseSections(decisionRaw);
        ReflectionSections challenges = parseSections(challengesRaw);

        ReflectionSections merged = new ReflectionSections();
        merged.setDecisionPattern(decision.getDecisionPattern());
        merged.setPressureApproach(decision.getPressureApproach());
        merged.setChallengesAhead(challenges.getChallengesAhead());
        merged.setCareerCompatibility(challenges.getCareerCompatibility());
        return merged;
    }

    private static final String INTRO = """
            You are writing a calm, thoughtful reflection for a user who just \
            completed a career simulation. Respond ONLY with a valid JSON object \
            matching the exact schema below — no markdown, no code fences, no \
            explanation before or after, just the raw JSON.""";

    private static final String SHARED_RULES = """
            STRICT RULES — violating any of these is a failure:
            1. Write entirely in Burmese (Myanmar Unicode), except for the JSON \
            keys themselves, which must stay in English exactly as shown in the \
            schema below.
            2. NEVER mention numbers, percentages, scores, grades, or point \
            values anywhere in the Burmese text. Describe tendencies in plain \
            descriptive language only.
            3. NEVER reference specific scenario names, specific choice letters \
            (A/B/C/D), or specific moments by name, even though you're reasoning \
            from the detailed choice history above — translate what you notice \
            into pattern-level language only, never a recap of moments.
            4. Write in second person, calm and warm tone, never clinical or \
            robotic-sounding.
            5. Each section should be genuinely substantial — 3-5 sentences \
            minimum per section, written with real specificity.
            6. Notice contradictions or selective patterns where they exist.
            7. Do not use bullet points or lists — write in flowing prose.
            8. Keep only the word "simulation" in English rather than \
            transliterating it into Burmese phonetics (e.g. "...ဒီ Simulation \
            တစ်ခုလုံးမှာ..."). All other technical or trait-related terms may be \
            written in whichever language reads most naturally in context — do \
            not force English on these.""";

    private String buildContext(SimulationRun run, Career career) {
        String accumulatedScoresJson = run.getAccumulatedScores();
        String behaviorSummaryJson = summarizeBehaviorData(run.getChoicesHistory());
        String fullChoiceHistoryJson = run.getChoicesHistory();
        int pauseCount = run.getPauseCount() != null ? run.getPauseCount() : 0;

        return """
            CONTEXT:
            Career: %s
            Career description: %s

            Accumulated trait tendencies (relative emphasis across choices made, \
            NOT scores or grades — do not reference these as numbers anywhere in \
            your output):
            %s

            Behavioral summary across the playthrough (average time spent per \
            decision, total mind-changes, longest single pause, etc.):
            %s

            Full choice-by-choice history for this playthrough (each entry shows \
            which scenario, which trait scores that choice contributed, how long \
            it took, and how many times the player changed their mind before \
            confirming). Use this as your PRIMARY source for identifying specific, \
            grounded strengths and weaknesses — reason carefully across the full \
            sequence to notice real patterns (e.g. consistently slow on choices \
            that scored high in one trait but fast on others, or a trait that was \
            almost always chosen alongside another specific trait):
            %s

            Number of times the user paused and resumed this simulation session: %d
            """.formatted(
                career.getTitle(),
                career.getDescription(),
                accumulatedScoresJson,
                behaviorSummaryJson,
                fullChoiceHistoryJson,
                pauseCount
        );
    }

    private String buildDecisionPrompt(SimulationRun run, Career career) {
        return INTRO + "\n\n" + buildContext(run, career) + "\n" + SHARED_RULES + "\n\n" + """
            FOR THIS RESPONSE, write only these two sections:
            - "decisionPattern": the pattern in how the user tended to make \
            decisions across the playthrough — what they reached for first, where \
            they hesitated, what they seemed to weigh most heavily.
            - "pressureApproach": how the user approached the high-pressure, \
            time-sensitive moments specifically, and how that compared with their \
            calmer decisions.

            RETURN EXACTLY THIS JSON SCHEMA (keys in English, values in Burmese):
            {
              "decisionPattern": "...",
              "pressureApproach": "..."
            }""";
    }

    private String buildChallengesPrompt(SimulationRun run, Career career) {
        return INTRO + "\n\n" + buildContext(run, career) + "\n" + SHARED_RULES + "\n\n" + """
            FOR THIS RESPONSE, write only these two sections, and follow these \
            additional rules:
            - "challengesAhead" must be the most detailed and substantial part of \
            your output. For each challenge or weakness you identify, pair it with \
            concrete, actionable advice on what specifically the person could work \
            on or practice to address it — not just naming a risk, but giving real \
            direction. Reason from the full choice history to ground each point in \
            something real about how they actually played, not generic career \
            advice that could apply to anyone. Aim for at least 5-6 sentences, \
            covering 2-3 distinct strength/weakness pairs with advice attached to \
            each.
            - This response is forward-looking only. Do NOT recap what the user \
            experienced or restate their general decision style — that is covered \
            in another part of the reflection.
            - "careerCompatibility" MUST include an explicit statement that this \
            simulation cannot determine the user's future, before offering any \
            suggestion. Keep this section SHORT — 3-4 sentences, a closing note, \
            not an extended analysis.

            RETURN EXACTLY THIS JSON SCHEMA (keys in English, values in Burmese):
            {
              "challengesAhead": "...",
              "careerCompatibility": "..."
            }""";
    }

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

    private static final int MAX_GEMINI_ATTEMPTS = 4;

    /**
     * {@code gemini-3.6-flash} regularly returns 503 ("experiencing high
     * demand") and occasionally 429 under load. Those are transient — retry a
     * few times with backoff (plus jitter, so the two parallel calls don't
     * lock-step) before giving up.
     */
    private String callGeminiWithRetry(String prompt) {
        for (int attempt = 1; ; attempt++) {
            try {
                return callGemini(prompt);
            } catch (HttpStatusCodeException e) {
                int code = e.getStatusCode().value();
                boolean retryable = e.getStatusCode().is5xxServerError() || code == 429;
                if (!retryable || attempt >= MAX_GEMINI_ATTEMPTS) {
                    throw e;
                }
                sleep(attempt * 3000L + ThreadLocalRandom.current().nextLong(1500));
            }
        }
    }

    private void sleep(long millis) {
        try {
            Thread.sleep(millis);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("Interrupted while backing off before a Gemini retry", e);
        }
    }

    private String callGemini(String prompt) {
        Map<String, Object> part = Map.of("text", prompt);
        Map<String, Object> content = Map.of("parts", List.of(part));
        Map<String, Object> body = Map.of("contents", List.of(content));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        String urlWithKey = geminiUrl + "?key=" + apiKey;

        Map response = restTemplate.postForObject(urlWithKey, requestEntity, Map.class);

        List<Map> candidates = (List<Map>) response.get("candidates");
        Map firstCandidate = candidates.get(0);
        Map contentObj = (Map) firstCandidate.get("content");
        List<Map> parts = (List<Map>) contentObj.get("parts");
        return (String) parts.get(0).get("text");
    }

    private ReflectionSections parseSections(String rawText) {
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
