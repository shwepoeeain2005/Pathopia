---
name: Astra Academy
colors:
  surface: '#141125'
  surface-dim: '#141125'
  surface-bright: '#3a364d'
  surface-container-lowest: '#0e0b1f'
  surface-container-low: '#1c192d'
  surface-container: '#201d32'
  surface-container-high: '#2b273d'
  surface-container-highest: '#353248'
  on-surface: '#e5dffb'
  on-surface-variant: '#cbc3d7'
  inverse-surface: '#e5dffb'
  inverse-on-surface: '#312e43'
  outline: '#958ea0'
  outline-variant: '#494454'
  surface-tint: '#d0bcff'
  primary: '#d0bcff'
  on-primary: '#3c0091'
  primary-container: '#a078ff'
  on-primary-container: '#340080'
  inverse-primary: '#6d3bd7'
  secondary: '#4cd7f6'
  on-secondary: '#003640'
  secondary-container: '#03b5d3'
  on-secondary-container: '#00424e'
  tertiary: '#ffb95f'
  on-tertiary: '#472a00'
  tertiary-container: '#ca8100'
  on-tertiary-container: '#3e2400'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#d0bcff'
  on-primary-fixed: '#23005c'
  on-primary-fixed-variant: '#5516be'
  secondary-fixed: '#acedff'
  secondary-fixed-dim: '#4cd7f6'
  on-secondary-fixed: '#001f26'
  on-secondary-fixed-variant: '#004e5c'
  tertiary-fixed: '#ffddb8'
  tertiary-fixed-dim: '#ffb95f'
  on-tertiary-fixed: '#2a1700'
  on-tertiary-fixed-variant: '#653e00'
  background: '#141125'
  on-background: '#e5dffb'
  surface-variant: '#353248'
  space-deep: '#0F0C20'
  electric-violet: '#8B5CF6'
  neon-cyan: '#06B6D4'
  amber-gold: '#F59E0B'
  glass-stroke: rgba(139, 92, 246, 0.3)
  glass-surface: rgba(15, 12, 32, 0.6)
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.03em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 28px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: Space Grotesk
    fontSize: 14px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.08em
  label-sm:
    fontFamily: Space Grotesk
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.1em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  unit: 8px
  container-sm: 16px
  container-md: 32px
  container-lg: 64px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
---

## Brand & Style

This design system establishes a **Futuristic Space-Academy** aesthetic, tailored for a career simulation platform where users are "cadets" navigating their professional futures. The brand personality is aspirational, high-tech, and empowering, designed to evoke the feeling of a mission control interface rather than a corporate tool.

The visual direction is a refined **Glassmorphism** style. It relies on deep atmospheric layering, high-performance translucency, and "energy-based" visual cues like neon borders and radial glows. The interface should feel like a holographic projection—lightweight yet structurally sound, with a clear focus on progress and data visualization.

## Colors

The palette is optimized for a dark-mode-only experience to maintain the "Deep Space" immersion.

- **Primary (Electric Violet):** Used for structural identity, interactive states, and branding. It represents the "energy" of the platform.
- **Secondary (Neon Cyan):** Reserved for data, technology-focused information, and success states. It acts as the high-tech counterpoint to the violet.
- **Tertiary (Amber Gold):** The "Hero" color. It is strictly used for the most important calls to action and achievement markers, symbolizing the "North Star" of one's career path.
- **Neutral (Deep Space Purple):** The foundational void. All surfaces derive from this hue to ensure a cohesive, low-strain visual environment.

Gradients should primarily flow from Electric Violet to Deep Space Purple. Neon Cyan is used for focus rings and precision accents.

## Typography

The typography system prioritizes clarity and a "technical" vibe. **Plus Jakarta Sans** provides a modern, legible foundation for all primary UI elements and reading experiences. 

For metadata, stats, and "system-readout" text, **Space Grotesk** is used. This secondary font should almost always be set in uppercase with increased letter spacing to mimic digital instrument clusters and flight HUDs. Large headlines should be tightly tracked to appear more like a cohesive visual block.

## Layout & Spacing

The layout philosophy uses a **Fluid Grid** to emphasize the expansive nature of space. 

- **Desktop (1440px+):** 12-column grid with 80px side margins and 24px gutters. Use wide horizontal sections to allow "Glass" panels to breathe.
- **Tablet (768px - 1439px):** 8-column grid with 40px margins.
- **Mobile (Up to 767px):** 4-column grid with 20px margins.

Spacing follows an 8px modular scale. "Negative space" is treated as a design element; use `container-lg` (64px) padding to separate major simulation modules, preventing the UI from feeling like a cramped dashboard.

## Elevation & Depth

This system replaces traditional drop shadows with **Luminous Depth**. 

1.  **Background Layer:** A deep radial gradient starting from `#1A1635` at the center to `#0F0C20` at the edges.
2.  **Glass Layer (Standard):** `backdrop-filter: blur(12px)` with a 1px solid border of `glass-stroke` (30% Violet). This creates a sense of floating.
3.  **Active/Hover Layer:** Increased blur (20px) and a `0 0 20px rgba(139, 92, 246, 0.15)` outer glow.
4.  **Priority Layer:** Used for modals or critical alerts; these feature a secondary inner glow of Cyan to differentiate from standard panels.

Avoid any solid black or opaque backgrounds. Transparency is key to the "holographic" narrative.

## Shapes

The shape language is "Rounded" (0.5rem base) to provide a sophisticated, ergonomic feel that balances the "sharpness" of the space theme.

- **Buttons & Inputs:** Use the base 0.5rem (8px) for a standard modern look.
- **Cards & Panels:** Use `rounded-lg` (16px) to define large content areas.
- **Status Badges/Chips:** Use `rounded-full` (pill) for high-contrast visibility and a friendlier feel.

## Components

- **Primary Buttons:** Solid **Amber Gold** (#F59E0B) with dark text. They should have a subtle outer gold glow (`drop-shadow`) to appear as the primary light source on the screen.
- **Input Fields:** Modern rounded containers with `glass-surface` background. Focus states must trigger a dual-ring effect: a 1px **Neon Cyan** border and a 4px soft **Electric Violet** outer glow.
- **Stats Preview Chips:** Small pill-shaped badges using a semi-transparent Cyan background (`rgba(6, 182, 212, 0.15)`) with Space Grotesk text. These serve as "system readouts" for player levels or career stats.
- **Glass Cards:** The primary container. Must feature a `1px` top-weighted gradient border (from white at 20% opacity to violet at 10% opacity) to simulate light catching the edge of a glass pane.
- **Progress Bars:** Dual-layered. The track is `space-deep` with a 10% opacity border; the fill is a horizontal gradient from **Electric Violet** to **Neon Cyan**, finished with a glowing "spark" at the leading edge.