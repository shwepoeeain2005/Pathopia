# Pathopia — Landing Page Design Spec (v2)

## Overall Purpose
First-impression marketing page for a career-simulation web app. Tone: ethereal, dreamy, glowing, atmospheric — NOT flat, NOT gamified, NOT corporate.

## Brand Slogan
**"Not a test. Not a game. A glimpse."**
Use this as a subtext line under the main tagline in the hero, and again in the footer near the logo.

## CRITICAL BUG TO FIX FIRST
The hero tagline currently renders with overlapping/stacked text ("Experience Your Future Before You" overlapping "Future Before You Choose."). Fix line-height and vertical spacing so it renders as clean, non-overlapping lines before any other styling work.

---

## Attached Reference Images (use directly, do not recreate from description)
- `hero-background.png` — 1920x1080 illustrated night skyline artwork, hero section background
- `logo-full.png` — full "PATHOPIA" wordmark + star-in-circle mark, pale lavender, transparent background
- `back-to-top-icon.png` — standalone star-in-circle icon, transparent background

**Sizing note:** both logo and back-to-top icon were rendered too small in the last build. Increase logo height to roughly 40-48px in the nav (was too tiny to read). Increase back-to-top icon to a clearly clickable ~48-56px tap target.

---

## Color Palette (v2 — replaces all previous flat colors)

| Color | Hex | Role |
|---|---|---|
| Near-black indigo | `#14102b` | Deepest background — base of the below-hero section, replaces flat pale background entirely |
| Deep plum | `#2d2154` | Card backgrounds, footer background |
| Muted violet | `#6b4d94` | Secondary card fill/gradient partner |
| Dusty rose | `#b97ca3` | Replaces the previous candy-pink box — muted, same family as violet, not neon |
| Warm gold | `#d9a94f` | PRIMARY contrast accent — step numbers, icon badges, dividers, button glow, hover states |
| Dusty aqua | `#6fa8a3` | SECONDARY cool accent — links, subtle icon glow, hover states. Used sparingly alongside gold for a warm/cool balance |
| Soft cream | `#f2e9dc` | Body text color — warmer than pure white |

**No flat single-color fills anywhere below the hero.** Every card/box background should be a subtle gradient (e.g. `#2d2154` → `#6b4d94`, or `#6b4d94` → `#b97ca3`), never one flat hex value. Add a soft outer glow/shadow (colored shadow, not just gray/black) behind each card so they feel like they're emitting light, matching the Moonie-style reference aesthetic.

## Typography
- Headings / logo: elegant serif
- Body text / UI text: Quicksand
- Body text color: `#f2e9dc` (soft cream), NOT pure white
- Step numbers (see "How It Works" section): large, bold, serif, in `#d9a94f` at reduced opacity (~30-40%) sitting behind/beside the card content — mirrors the oversized "01/02/03" numeral pattern from the reference

---

## Page Structure (top to bottom)
1. Nav bar (transparent, overlaid on hero)
2. Hero section (full viewport height, background art + tagline + slogan + buttons)
3. "How Pathopia Works" — 3-step section (NEW)
4. Below-the-fold content (What is Pathopia / Features / About Project) — gradient glass cards
5. Footer (expanded — slogan, social icons, mock contact)
6. Back-to-top button (floating, bottom-right)

---

## 0. Nav Bar
- Background: transparent, overlaid on hero art
- Left: `logo-full.png`, sized ~40-48px height (larger than previous build)
- Right: plain text links — **"Login"** and **"Register"**
- Sticky/fixed to top of viewport

---

## 1. Hero Section

### Background
- `hero-background.png`, full-bleed, `background-size: cover`, `background-position: center`

### Tagline
- Main line: "Experience Your Future Before You Choose." — fix overlap bug, clean line-height
- Subtext line beneath it, smaller, italic or lighter weight: **"Not a test. Not a game. A glimpse."** in `#f2e9dc` at slightly reduced opacity

### Login / Register Buttons — REDESIGN
Previous version (flat solid indigo pills) looked cheap — replace entirely:
- Background: gradient, `#6b4d94` → `#2d2154`
- Border: thin 1px `#d9a94f` (gold) outline at low opacity, OR a soft gold glow shadow instead of a hard border
- Text: `#f2e9dc`
- Button text: **"Sign in & Explore"** (Login) and **"Start your journey"** (Register)
- Hover state: gold glow intensifies, subtle scale-up (1.03x), smooth transition
- Rounded corners, but not full-pill — slightly less rounded than previous version for a more refined feel

### Scroll Indicator
- Small downward chevron, bottom-center, subtle glow

---

## 2. "How Pathopia Works" — NEW SECTION
Insert this between the hero and the existing below-fold content. Layout inspired by numbered step-card pattern (icon top-left, large number top-right, title, description) — but rendered in Pathopia's dark/glow aesthetic, not the light pastel style of the reference.

### Section heading
"How Pathopia Works"
Subtext: "From curiosity to career clarity — in three simple steps."

### Layout
- 3 cards side by side (stack vertically on mobile)
- Each card: gradient background (`#2d2154` → `#6b4d94`), soft glow shadow, generous padding, rounded corners
- Top-left: custom icon in a soft circular badge (thin-line/duotone style, NOT emoji — glowing outline aesthetic matching the brand's star/compass visual language; these are custom assets to be created separately, use a simple placeholder circle/star shape for now)
- Top-right: large oversized step number (01/02/03) in `#d9a94f` gold at ~30-40% opacity, serif font, sitting behind/beside content
- Title: serif, `#f2e9dc`
- Description: Quicksand, `#f2e9dc` at slightly reduced opacity

### Copy
**01 — Choose Your Path**
Pick a career track that intrigues you — Data Analyst, Project Manager, Software Engineer, or UI/UX Designer.

**02 — Live the Moments**
Navigate real workplace scenarios and make choices that shape your journey.

**03 — Reflect & Discover**
Receive a personalized reflection on how your choices reveal your strengths.

---

## 3. Below-the-Fold Content
- Page background: `#14102b` (near-black indigo) — NOT the previous flat pale lavender
- Each section is a gradient glass card, NOT flat single-color fill, floating on the dark background with soft glow shadow
- Boxes still don't touch each other — dark background visible in the gaps

### Section: "What is Pathopia?"
- Card gradient: `#2d2154` → `#6b4d94`
- Text: `#f2e9dc`, Quicksand
- Content: "Instead of simply telling you about careers, Pathopia lets you experience realistic career situations and discover whether a profession truly fits your strengths."

### Section: "Features"
- Card gradient: `#6b4d94` → `#b97ca3` (muted dusty rose, NOT flat candy pink)
- Checklist style, each item with a small gold or aqua star-bullet icon
- Items: Interactive Career Simulation / AI Reflection / Personalized Skill Analysis / Career History
- Text: `#f2e9dc`

### Section: "About Project"
- Card gradient: `#2d2154` → `#6b4d94`
- Content: "Pathopia is a student-built project exploring how simulation can make career discovery feel human, honest, and a little wondrous."
- "Meet Our Team" link/button, styled in gold `#d9a94f`

---

## 4. Footer — EXPANDED
Previous version was too bare (just logo + one link). Rebuild with real structure:

- Background: `#2d2154` (deep plum)
- Layout: multi-column
  - **Column 1:** Logo (`logo-full.png`) + slogan "Not a test. Not a game. A glimpse." beneath it, in small italic cream text
  - **Column 2:** Quick links — About, Login, Register
  - **Column 3:** Mock social icons (Instagram, LinkedIn, Twitter/X placeholders — simple line icons in cream/gold, no real links needed yet)
  - **Column 4:** Mock contact info — e.g. "hello@pathopia.app" (placeholder), "Yangon, Myanmar" (placeholder)
- Bottom row: thin divider line in gold at low opacity, then small copyright text: "© 2026 Pathopia. A student project."
- Stack columns vertically on mobile

---

## 5. Back-to-Top Button
- `back-to-top-icon.png`, sized larger than previous build (~48-56px tap target)
- Soft gold glow behind the icon on hover
- Appears after scrolling past hero, smooth scroll-to-top on click

---

## Layout Notes
- Desktop: hero fills full viewport width/height
- Mobile: hero art stays centered on star + skyline core; buildings may crop at edges
- All cards/sections stack vertically on mobile, maintaining gradient + glow treatment
- Login/Register hero buttons stack vertically on narrow widths

## What This Page Should NOT Include
- No flat single-hex color fills anywhere below the hero
- No pure white text — use soft cream `#f2e9dc`
- No visible scores, stats, or gamified badges
- No stock photography — illustrated/custom art only
- No emoji-style icons — thin-line/duotone glowing icons only, matching brand visual language
