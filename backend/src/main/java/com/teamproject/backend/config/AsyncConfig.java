package com.teamproject.backend.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.ThreadPoolExecutor;

/**
 * Enables {@code @Async} and provides the executor used for post-simulation
 * reflection generation.
 *
 * <p>Each in-flight reflection can occupy up to three threads on this pool:
 * one orchestrator (the {@code @Async}
 * {@link com.teamproject.backend.service.ReflectionGenerationService#generateAndSaveAsync}
 * call) plus the two Gemini calls it fans out into — {@code GeminiReflectionService}
 * runs the "decision" and "challenges" prompts in parallel. The pool is sized to
 * absorb a couple of concurrent completions; past that, {@link ThreadPoolExecutor.CallerRunsPolicy}
 * degrades to running the work on the submitting thread instead of rejecting it.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "reflectionExecutor")
    public ThreadPoolTaskExecutor reflectionExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(8);
        executor.setMaxPoolSize(8);
        executor.setQueueCapacity(25);
        executor.setThreadNamePrefix("reflection-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.initialize();
        return executor;
    }
}
