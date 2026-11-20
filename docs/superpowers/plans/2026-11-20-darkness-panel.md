# Darkness Tile and Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redraw the Darkness tile with the Sun's true noon-to-noon path, and add a Darkness panel with Sun and Moon (truly dark) details.

**Architecture:** Pure functions in `src/sky/darkPanel.js` sample Sun and Moon altitude, find truly dark windows and write words. The tile and the panel draw from the same samples. The panel reuses `Popover`, a shared `NightStrip`, and a shared chart-picking hook moved out of the Clouds panel.

**Tech Stack:** React 19, React Router, Vitest, astronomy-engine, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-20-darkness-panel-design.md`

## Global Constraints

- Code style: uppercase section headers, several blank lines between sections, no other comments, minimal classes, theme tokens only, sentence case.
- Use `div` inside panels, never `section`.
- 44px targets, keyboard, screen readers, reduced motion, `:root.still`.
- The user commits. Leave the work uncommitted on main.
- The Moon and Clouds panels must look and behave as before.

## Review Focus

- **Waning Moon** (rises mid-night, so the window ends at moonrise): the tile reads "Moon rises at …; truly dark until then." Tested in Task 2 with a waning-Moon night (Dec 3, 2026, Kansas City).
- **Near full Moon** (no truly dark time): the verdict is "No truly dark hours". Tested in Task 2 (Nov 23, 2026).
- **New Moon** (Moon down through all the dark hours): one window covering the whole dark span, and "No Moon during the dark hours." Tested in Task 2 (Dec 9, 2026).
- **Summer at high latitude** (no full dark): the verdict is "No full dark", with no crash. Tested in Task 2 (Oslo, June 21, 2026).
- **Polar day:** "No night". Tested in Task 2 (Tromsø, June 21, 2026).

---

### Task 1: Share the night strip, night list and chart picking

**Files:**
- Create:
  - `src/sky/panelNights.js` (move `panelNights` from `cloudPanel.js`)
  - `src/components/panel/NightStrip.jsx` and `NightStrip.css` (moved from clouds; classes `night-strip`, `night-days`, `night-date`, `night-arrow`)
  - `src/components/panel/useChartPicking.js` (moved from CloudChart)
- Modify: `cloudPanel.js`, `cloudPanel.test.js`, `CloudsPanel.jsx`, `CloudChart.jsx`, `CloudsPanel.css`

**Interfaces:**
- Produces:
  - `panelNights(place, now) -> { nights, tonight }`
  - `<NightStrip nights tonight chosen timeZone onPick />`
  - `useChartPicking(count, { onChoose, onStep, onNight, bigStep = 1 }) -> handlers` (Shift with the arrow keys moves `bigStep`)

- [ ] Move the code, keeping behavior identical, and update the imports.
- [ ] Run `npx vitest run` and expect all tests to pass. In the browser, the Clouds panel works as before.

### Task 2: Darkness data and words

**Files:**
- Create: `src/sky/darkPanel.js`, `src/sky/darkPanel.test.js`
- Modify: `src/sky/darkness.js` (export `darkSpan(night) -> {from, to} | null`, used by `darknessWords`)

**Interfaces:**
- Produces:
  - `STEP_COUNT = 145`
  - `skyPath(observer, noon) -> { times, sun, moon }` (10-minute samples)
  - `trulyDark(night) -> [{ from, to }]` (uses `night.observer`, `darkSpan`, and Moon `SearchRiseSet` events inside the span)
  - `moonLine(night, windows, timeZone) -> string | null`
  - `darkVerdict(night, windows, lit, timeZone) -> { value, line }`
  - `sampleKind(sun, moon) -> 'day'|'twilight'|'moonlit'|'dark'`
  - `atWords(time, sun, moon, timeZone) -> string`
  - `hoursWords(ms) -> string`
  - `moonTimes(place, noon, timeZone) -> string`

- [ ] Write tests for Kansas City (`SAMPLE_PLACE`), building nights with `buildNight(place, 0, now)` for these dates:
  - **Nov 19:**
    - one window starting at moonset (`clock` = '2:32am') and ending at astronomical dawn
    - `moonLine` is 'Moon sets at 2:32am; truly dark after.'
    - `darkVerdict.value` is '3 hr 1 min' (or whatever the exact minutes come to)
    - verdict line starts with 'truly dark, 2:32am–'
  - **Nov 23:** `trulyDark` returns []. `darkVerdict` gives `{ value: 'No truly dark hours', line: 'The 100% lit Moon is up all night.' }`.
  - **Dec 3:** one window starts at astronomical dusk and ends at moonrise. `moonLine` matches /^Moon rises at .*; truly dark until then\.$/.
  - **Dec 9:** one window equals `darkSpan`. `moonLine` is 'No Moon during the dark hours.'
  - **Oslo, June 21:** `darkVerdict.value` is 'No full dark'.
  - **Tromsø, June 21:** 'No night'.
  - **`hoursWords`:**
    - 3h is '3 hr'
    - 3h 10m is '3 hr 10 min'
    - 40m is '40 min'
  - **`sampleKind`:**
    - (5, −10) is day
    - (−10, 20) is twilight
    - (−30, 5) is moonlit
    - (−30, −5) is dark
  - **`atWords`:** 9:30pm, −51, 30 gives '9:30pm · Fully dark, Moon up · Sun 51° below the horizon'.
  - **`skyPath`:** 145 samples, the first at noon.
- [ ] Run `npx vitest run src/sky/darkPanel.test.js` and expect FAIL.
- [ ] Implement it. Split the dark span at Moon events and keep the pieces whose midpoint has the Moon below 0°.
- [ ] Run it again and expect PASS.

### Task 3: Tile curve

**Files:** Modify `src/components/tonight/TonightTiles.jsx`, plus `darkness.js` and `darkness.test.js` (remove `darkNow` if nothing else uses it).

- [ ] Replace `SunPath` with a noon-to-noon curve from `skyPath`.
  - The y scale runs from the night's highest Sun +5° to its lowest −5°.
  - Strokes are colored by `sampleKind` (day `--beak`, twilight `--snow-shade`, dark `--teal`, moonlit `--moon`).
  - The dashed horizon stays, with a now dot.
- [ ] The third line becomes `moonLine`. The tile gets a `TileLink` to `darkness`, and `.still` is removed.
- [ ] Run `npx vitest run` and expect PASS.

### Task 4: Darkness panel

**Files:**
- Create:
  - `src/components/darkness/DarknessPanel.jsx`
  - `src/components/darkness/DarkChart.jsx`
  - `src/components/darkness/DarknessPanel.css`
- Modify: `src/App.jsx` (route `darkness`), `Tonight.jsx` (`TITLES.darkness`, `links.darkness`)

- [ ] Build it to match mockup v3 B:
  - **State:** `{ place, night, index }`. The index starts at now's sample on tonight and is kept across nights.
  - **Chart:**
    - sky bands use `color-mix` tokens
    - "Horizon" and "Fully dark below" lines, 6pm/midnight/6am guides
    - chosen line and dot
    - Moon lane with "Moon up · N% lit"
  - **Key, picking line and rows** as in the spec. The chart is role="slider", and `bigStep` is 6 (an hour).
- [ ] Run `npx vitest run` and `npm run build`, and expect PASS.
- [ ] Verify in the browser:
  - wide and phone layouts
  - keys, drag, the strip
  - the Moon and Clouds panels unchanged
