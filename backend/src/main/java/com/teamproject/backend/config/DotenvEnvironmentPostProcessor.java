package com.teamproject.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import io.github.cdimascio.dotenv.DotenvEntry;
import org.springframework.boot.EnvironmentPostProcessor;
import org.springframework.boot.SpringApplication;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.util.HashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    // Depending on how the run is launched (IntelliJ module root vs. repo
    // root vs. `mvn` from the backend folder), the JVM's working directory
    // varies. dotenv-java only looks in the working directory by default,
    // so we try the folders .env could realistically be in and use the
    // first one that actually has it, instead of silently finding nothing.
    private static final String[] CANDIDATE_DIRS = { ".", "backend" };

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Map<String, Object> properties = new HashMap<>();

        for (String dir : CANDIDATE_DIRS) {
            Dotenv dotenv = Dotenv.configure()
                    .directory(dir)
                    .ignoreIfMissing()
                    .load();

            for (DotenvEntry entry : dotenv.entries()) {
                properties.put(entry.getKey(), entry.getValue());
            }

            if (!properties.isEmpty()) {
                break; // found and loaded a real .env, stop looking
            }
        }

        environment.getPropertySources().addLast(new MapPropertySource("dotenv", properties));
    }
}