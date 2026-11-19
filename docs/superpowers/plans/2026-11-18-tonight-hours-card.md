# Tonight Hours Card Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The hours card shows tonight's real hourly row and summary sentence for the visitor's place.

**Architecture:** Pure word rules in `src/sky/hours.js` turn `useNight`'s night, Moon, showers and clouds into cells and a sentence. `HoursCard` renders them; Tonight fetches the forecast like Home.

**Tech Stack:** React 19, astronomy-engine, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-18-tonight-hours-card-design.md`

## Global Constraints

- Code style: uppercase section headers, several blank lines between sections, no other comments, minimal classes.
- Times use `clock(date, timeZone)`. Copy exactly as in the spec.
- Cloud thresholds: under 20 Clear, under 60 Patchy, otherwise Cloudy (same as `skyWord`).

## Review Focus

- A night with no full darkness: no Fully dark or Dawn cells; cloud sentence uses all night hours. Tested in Task 1.
- Forecast missing or partly missing (null hours): hours say "Dark"; a null hour never counts as a change. Tested in Task 1.
- Moon both rises and sets in one night: both moments appear. Tested in Task 1.
- Weak showers (Northern Taurids, about 5 an hour) are not mentioned. Tested in Task 1.
- A moment exactly on the hour shows next to that hour, sorted by time. Checked in Task 2's browser pass.

---

### Task 1: Hours wording

**Files:** Modify `src/sky/moon.js` (export `moonCrossings(moon, night)` returning `{ upAtSunset, rise, set }` as Dates or null). Create `src/sky/hours.js`, `src/sky/hours.test.js`.

**Interfaces:**
- `hourCells({ night, moon, clouds, timeZone }) -> { time: Date, label: string, kind: string, word: string, moment: boolean }[]`. `kind` is one of `sunset, twilight, fully-dark, clear, patchy, cloudy, dark, moonrise, moonset, dawn, sunrise`.
- `hoursSummary({ night, moon, clouds, showers, status, timeZone }) -> string`. `status` is `'loading' | 'ready' | 'failed'`.

- [ ] Tests with hand-made nights (hourly `times`, `sun` per 10-minute step, twilight times) and real `buildNight` where astronomy matters: each cloud sentence in the spec, loading and failed text, shower above and below 8 an hour, Moon sets, Moon rises, both, no full darkness, null cloud hours.
- [ ] Watch them fail, implement, run `npm test`.

### Task 2: Real hours card

**Files:** `src/components/ui/icons.jsx` (Patchy, Dark, Moonrise, Sunrise icons; arrows on Sunset), `src/components/tonight/HoursCard.jsx` (props `sky, status, timeZone`), `src/pages/Tonight.jsx` (`useForecast(place, Math.floor(now / HOUR))`, pass `forecast.raw` to `useNight`).

- [ ] Render cells and summary; keep the arrows, appearing heading and press behavior.
- [ ] Lint, tests, real Chrome captures (desktop and phone), then an icon sheet in `mockups/` for the user.
