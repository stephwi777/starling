# Seeing Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Score seeing per hour from three causes, and add a Seeing panel like the Clouds panel.

**Architecture:**
- `weather.js` returns per-hour `air` values in m/s.
- `seeing.js` scores hours and writes words.
- `SeeingPanel.jsx` reuses `Popover`, `NightStrip` and `useChartPicking`.
- `startHour` and `sameHour` move to `panelNights.js` so both hourly panels share them.

**Tech Stack:** React 19, React Router, Vitest, Open-Meteo, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-20-seeing-panel-design.md`

## Global Constraints

- Site code style; theme tokens only; `div`s inside panels.
- 44px targets, keyboard, screen readers, reduced motion.
- The user commits.

## Review Focus

- **The forecast is missing upper-level wind for an hour:** that hour shows dim dots and "No forecast", and the night average skips it. Tested in Task 1.
- **Places outside the US:** km/h and "10 km up". Tested in Task 1 (`seeingRows`).
- **Calm jet stream with very gusty ground:** the score drops, and the Ground wind row says "Very gusty". Tested in Task 1.
- **Wind directions that oppose with equal speeds:** the layers still count as churning (vector difference). Tested in Task 1 (`shearOf`).

---

### Task 1: Data and scoring

**Files:** `src/sky/weather.js` (+test), `src/sky/seeing.js` (+test), and `src/sky/panelNights.js`, which takes `startHour` and `sameHour` from `cloudPanel.js` (update imports and tests).

**Interfaces:**
- **`nightWeather(raw, night).air`:** `[{ jet, shear, gust, wind } | null]` per night hour (replaces `jets`)
- **`shearOf(speeds, directions) -> number`**
- **`hourScore(air) -> 1..5`** and **`levelsOf(air) -> { jet, layers, ground }`**
- **`seeingWords({ night, air, status, timeZone })`:** same return shape as today
- **`seeingRows(air, country) -> { jet, layers, ground }`:** each `{ value, note }`
- **`SEEING`:** `[{ value, line, best }]`, indexed by score

- [ ] Tests:
  - the existing seeing tests, with `air` objects whose shear and gust are 0
  - gusts of 12 m/s with a 5 m/s jet give 'Average' (5 − 0 − 0 − 2 = 3)
  - shear of 20 gives −2
  - `shearOf([10, 10], [0, 180])` is 20
  - `seeingRows` for a US place gives 'Light' and '34 mph, 34,000 ft up' for a 15 m/s jet, and for France gives '54 km/h, 10 km up'
  - `nightWeather` turns mph into m/s for `air`
- [ ] Implement, then run `npx vitest run` and expect PASS.

### Task 2: Tile and panel

**Files:**
- Modify: `TonightTiles.jsx`, `Tonight.jsx` (`links.seeing`, `TITLES.seeing`), `App.jsx`
- Create:
  - `src/components/seeing/SeeingPanel.jsx`
  - `src/components/seeing/SeeingChart.jsx`
  - `src/components/seeing/SeeingPanel.css`

- [ ] **Tile:** `TileLink` to `seeing`; remove `.still`.
- [ ] **Panel:** match mockup v2. The chart is role="slider" with valuetext like "11pm, Average".
- [ ] Run `npx vitest run` and `npm run build`. In the browser, check desktop and phone, the keys, and the other panels.
