# Presentation Prep Checklist

Prep for the Pathopia presentation. Nothing here is urgent to the hour — but
do section A within the next couple of days, not on the last day.

Context for section A: **all simulation story content (careers, scenarios,
dialogue, choices, reality text — every Burmese line) lives only in the Neon
database.** There is no SQL seed, migration, or backup in this repo. If that
database is wiped or the Neon project is deleted, the app still runs but every
career shows "no scenarios yet", and it cannot be rebuilt from the code.

---

## A. Protect the story content (do this first)

- [x] **Instant snapshot (2 min, no tools):** Neon dashboard -> project ->
      **Branches** -> create a branch named `presentation-backup`. Frozen copy
      of the data as of now. *(Done Sep 5 — `presentation-backup` branch created.)*

- [x] **Real export (do this too):** Neon dashboard -> **Connection Details**
      -> copy the `psql` connection string, then run:
      ```
      pg_dump "postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require" --no-owner --no-privileges -f pathopia-db-YYYY-MM-DD.sql
      ```
      No `pg_dump`? Install "PostgreSQL client tools", or via Docker:
      ```
      docker run --rm postgres:17 pg_dump "postgresql://USER:PASSWORD@HOST/DBNAME?sslmode=require" > pathopia-db-YYYY-MM-DD.sql
      ```
      Put the file in `database/` and commit it — then it's version-controlled
      and safe on more than one machine. *(Done Sep 5 —
      `database/pathopia-db-2026-09-05.sql`, 965KB, all 6 tables confirmed
      present with real data. Note: Neon is on Postgres 18, not 17 — needed
      `pg_dump` 18.x specifically, an older client refuses to dump a newer
      server. Not yet committed — do that whenever you're ready.)*

- [x] **Confirm the data is actually there.** Neon SQL editor:
      ```sql
      SELECT count(*) FROM careers;
      SELECT count(*) FROM scenarios;
      SELECT count(*) FROM choices;
      ```
      If any count looks wrong, stop and investigate before doing anything else.
      *(Done Sep 5, via the pg_dump output itself: careers=4, scenarios=76,
      choices=292, simulation_runs=77, traits=20, users=25 — all reasonable.)*

- [ ] **Back up `backend/.env`** — copy its contents into a password manager or
      somewhere safe off the machine. It is git-ignored, so it currently exists
      in exactly one place. Keys it holds: `GEMINI_API_KEY`, `DB_URL`,
      `DB_USER`, `DB_PASSWORD`, `JWT_SECRET`.

- [ ] **NEW (found Sep 5): Gemini API is geo-blocked on this network.**
      Direct testing showed Gemini's API rejects requests from this machine's
      network with `400 FAILED_PRECONDITION: User location is not supported
      for the API use.` A VPN (routed through a supported country) fixes it —
      confirmed working. **Whatever machine/network you present from must have
      the VPN active for the entire presentation**, or every reflection will
      silently fail again exactly like it did today. Test that the VPN itself
      doesn't drop mid-session before presentation day. (This goes away
      entirely if the backend ever gets deployed to a real host instead of
      running locally — see the deployment discussion below — but that's on
      hold for now given uncertain school internet.)

- [x] **NEW (fixed Sep 5): Neon connection-pool drops.** HikariCP was using
      default timeouts (30 min max-lifetime), far longer than Neon's ~5 min
      auto-suspend — pooled connections were going stale and silently failing
      requests (including reflection saves) with "connection has been closed."
      Fixed in `backend/src/main/resources/application.properties` (shorter
      `max-lifetime`/`idle-timeout` + a `keepalive-time` ping). **Requires a
      backend restart to take effect** — do that before your next test run.

---

## B. Finish the reflection change & keep services alive

- [x] **Finalize the two placeholder Burmese strings** (marked with comments in
      the code):
  - `whatYouExperiencedText()` in
    `frontend/src/pages/Simulation/Simulation.jsx` — the static "What You
    Experienced" paragraph shown after the final Reality box.
  - `REFLECTION_INTRO_TEXT` in `frontend/src/pages/Reflection/Reflection.jsx`
    — the two framing sentences under the disclaimer.
  *(Reviewed Sep 5 — kept as-is, no changes needed.)*

- [ ] **Test the new reflection flow end-to-end** — it has not run against live
      Gemini + a real playthrough yet. Play a career to the end and confirm:
      Reality box -> "What You Experienced" screen -> "Get Reflection" ->
      loading -> 4 sections + radar on the Reflection page. Then reopen it from
      History and confirm it still renders.

- [ ] **Check Gemini quota.** Google AI Studio / Cloud Console -> the API key ->
      usage limits. Note requests-per-minute and per-day. The reflection now
      makes **2 Gemini calls per run** (plus retries on 503/429), so a demo with
      several runs uses quota faster. Run 3-4 reflections back-to-back one day
      this week and make sure no 429.

- [ ] **Log into Neon 2-3 times this week** so the project stays active. (Its
      compute also sleeps after ~5 min idle — first request after that is slow
      but recovers.)

- [ ] *(Optional)* Extend the login token — `JwtUtil.EXPIRATION_TIME` is 24h,
      so a token from today is dead tomorrow. Can be bumped to ~7 days for the
      presentation window.

- [ ] *(Optional)* Add a committed `.env.example` listing the required keys
      (no values) so the config is documented in the repo.

---

## C. Day before the presentation

- [ ] Wake the Neon DB (open the dashboard, or hit the app once).
- [ ] On the **exact machine you'll present from**: confirm `backend/.env` is
      present, then `cd backend && ./mvnw spring-boot:run` and
      `cd frontend && npm run dev` both start clean.
- [ ] Full dry run, twice: register/login -> pick a career -> play all 8
      scenarios -> reflection -> check History.
- [ ] If presenting from a different laptop than you develop on: copy
      `backend/.env` there, run `npm install` in `frontend/`, and let Maven
      download its dependencies once (needs internet).

---

## D. Presentation day

- [ ] Log in fresh right before starting (token good for 24h — or 7 days if you
      did the optional bump in section B).
- [ ] Start the backend first, wait for it to finish booting, then the frontend.
- [ ] Make sure nothing else is using ports **8080** and **5173**.
- [ ] Pause OneDrive sync while presenting — this repo lives in a OneDrive
      folder and its sync has caused file-lock issues before.
- [ ] Have a phone hotspot ready as internet backup (Gemini + Neon both need
      the network).

---

## Not a concern

- `@supabase/supabase-js` is in `package.json` but unused anywhere in the code —
  no Supabase project, no keys.
- `JWT_SECRET` does not expire.
- No hosting / domain / SSL to renew — everything runs locally (`localhost:8080`
  backend, Vite dev server on `5173` proxying `/api`).
