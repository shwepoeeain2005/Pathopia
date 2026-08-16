# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project state

Pathopia is a monorepo with a Spring Boot backend and a React (Vite) frontend. Both sides are currently unmodified framework scaffolds (`spring-boot-starter-webmvc` on the backend, `create-vite` React+TypeScript template on the frontend) — no domain code, REST endpoints, or database wiring exists yet. `database/` and `docs/` are empty placeholders (`.gitkeep` only).

## Repository layout

- `backend/` — Spring Boot app, Maven build, package root `com.teamproject.backend`
- `frontend/` — Vite + React + TypeScript app
- `database/` — empty, reserved for DB assets
- `docs/` — empty, reserved for documentation

Backend and frontend each have their own `.git`-ignored `.idea` folder and are otherwise independent (no shared tooling, no root-level package manager or build orchestration).

## Backend (`backend/`)

- Java 21, Spring Boot 4.1.0 (parent POM), Maven wrapper included
- Dependencies: `spring-boot-starter-webmvc`, Lombok, `spring-boot-devtools` (runtime), `spring-boot-starter-webmvc-test` (test)
- Build: `./mvnw clean install` (or `mvnw.cmd` on Windows)
- Run: `./mvnw spring-boot:run`
- Test all: `./mvnw test`
- Test single class: `./mvnw test -Dtest=BackendApplicationTests`
- Config: `backend/src/main/resources/application.properties` (currently only sets `spring.application.name`)
- Entry point: `backend/src/main/java/com/teamproject/backend/BackendApplication.java`

The Lombok annotation processor is wired explicitly in `pom.xml`'s `maven-compiler-plugin` executions (`default-compile` / `default-testCompile`) — if adding other annotation-processing dependencies (e.g. MapStruct), they need to be added to those `annotationProcessorPaths` blocks too, not just the `<dependencies>` section.

## Frontend (`frontend/`)

- React 19 + TypeScript, built with Vite 8
- Install: `npm install` (run from `frontend/`)
- Dev server: `npm run dev`
- Build: `npm run build` (runs `tsc -b` then `vite build` — type errors fail the build)
- Lint: `npm run lint` (ESLint flat config in `eslint.config.js`, using `typescript-eslint` recommended rules + `eslint-plugin-react-hooks` + `eslint-plugin-react-refresh`)
- Preview production build: `npm run preview`

No test runner is configured yet.