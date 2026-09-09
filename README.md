# Pathopia

Pathopia is a career simulation platform. A user picks a career, plays
through a branching, scenario-based simulation of a real workday in that
role, and afterwards receives an AI-generated reflection — written by Google
Gemini — analyzing their decision patterns, how they handled pressure, and
concrete challenges to work on, based on the actual choices they made.

Built solo as a semester keystone project for CST-4105 "Enterprise
Applications Development using Java" at the University of Information
Technology, Myanmar.

## How it works

1. **Pick a career** from the available options (each with its own set of
   scenarios, choices, and trait weightings).
2. **Play through the simulation** — a sequence of dialogue-driven scenarios
   where every choice contributes to a running set of trait scores and is
   logged with timing/hesitation data (how long you took, how many times you
   changed your mind).
3. **Get an AI reflection** — once the run completes, the full choice
   history and accumulated trait tendencies are sent to Gemini, which
   generates a written reflection covering your decision pattern, how you
   handled high-pressure moments, challenges to work on (with concrete
   advice), and career compatibility — all without ever surfacing raw
   numbers or scores to the user.
4. **Review your history** — past completed runs (with their reflections)
   are available to revisit or delete later.

## Stack

- **Backend:** Java 21, Spring Boot 4.1, Spring Security (JWT auth),
  Spring Data JPA / Hibernate, PostgreSQL ([Neon](https://neon.tech),
  serverless), Maven
- **Frontend:** React 19, Vite, React Router
- **AI:** Google Gemini API
- **Auth:** Stateless JWT (`jjwt`)

## Repository layout

```
backend/    Spring Boot app (Maven, package root com.teamproject.backend)
frontend/   Vite + React app
database/   Schema-only SQL dump for reference
docs/       Architecture notes and diagrams
```

## Running it locally

### Backend

```
cd backend
cp .env.example .env   # fill in your own DB, JWT, and Gemini values
./mvnw spring-boot:run
```

`.env` is loaded automatically (via `dotenv-java`) and is gitignored — see
`backend/.env.example` for every variable it needs and what each one does.
Any Postgres instance works; the project was built and tested against Neon.

### Frontend

```
cd frontend
npm install
npm run dev
```

## Core features

- JWT-based registration/login, with an editable profile (display name +
  uploaded profile picture)
- A full branching simulation engine: scenarios, timed/weighted choices,
  pause/resume support, and per-choice behavioral logging
- Single-call Gemini reflection generation per completed run, with retry
  handling for transient failures
- A run history page — revisit past reflections or delete a run
- Career/scenario/choice content lives entirely in the database, not
  hardcoded, so new careers can be added without a code change

## Notes

- The Gemini API is geo-blocked in some regions (including where this was
  built and demoed) — `GEMINI_API_BASE_URL` in `.env` can point at a reverse
  proxy (e.g. a Cloudflare Worker) instead of Google directly to route
  around that without needing a VPN.
- `docs/` has deeper write-ups of the architecture and database design for
  anyone wanting more detail than this README.
