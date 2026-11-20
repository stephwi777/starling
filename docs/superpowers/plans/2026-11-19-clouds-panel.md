# Clouds Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open a Clouds details panel from the Clouds tile: 8-night strip, stacked low/middle/high bars per hour, hour picking, and rows for cover, transparency, dew, haze and rain.

**Architecture:** Extract the Moon panel's popover shell into `Popover.jsx` and use it for both panels. Pure functions in `src/sky/cloudPanel.js` turn forecast and air-quality responses into per-hour data and words. `CloudsPanel.jsx` is a child route `tonight/clouds`.

**Tech Stack:** React 19, React Router (declarative), Vitest, astronomy-engine, Open-Meteo forecast and air-quality APIs, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-19-clouds-panel-design.md`

## Global Constraints

- Code style: uppercase section headers, several blank lines between sections, no other comments, minimal classes, theme tokens only, sentence case.
- Inside panels use `div`, never `section` (global section padding).
- 44px targets, keyboard support, `prefers-reduced-motion` plus `:root.still`.
- The user commits. Leave the work uncommitted on main.
- The Moon panel must look and behave exactly as before.

## Review Focus

- **Clicking the Clouds tile while the Moon panel is open:** it closes the Moon panel only, with no navigation race. Pinned by keeping the single shared `panelClose` toggle (Task 3).
- **Polar day (no dark hours) or a night with no forecast:** no crash, and the panel shows "No night" or "No forecast". Tested in Task 2 (`cloudHours` with empty hours, and `cloudSummary` null cases).
- **Hours missing in only one layer field:** bar heights still add up to total cover. Tested in Task 2 (`barLayers` with nulls).
- **Air-quality request fails or is still loading:** the Haze row says "Not available" or "Loading" and other rows still work. Tested in Task 2 (`hazeWords`).
- **Switching to a shorter night keeps the time of night, clamped.** Tested in Task 2 (`sameHour`).

---

### Task 1: Forecast and air-quality requests

**Files:**
- Modify: `src/sky/weather.js` (FIELDS, `past_days`, export `moments`)
- Create: `src/sky/air.js`, `src/sky/useAir.js`
- Test: `src/sky/weather.test.js`, `src/sky/air.test.js`

**Interfaces:**
- Produces:
  - `moments(raw) -> number[]`
  - `airUrl(place) -> string`
  - `fetchAir(place, signal, fetcher) -> Promise<raw>`
  - `useAir(place) -> { raw, status: 'loading'|'ready'|'failed' }`

- [ ] Test: `weatherUrl` contains `cloud_cover_low`, `dew_point_2m`, `precipitation_probability` and `past_days=2`. `airUrl` contains `aerosol_optical_depth`, `past_days=2`, `forecast_days=7` and the timezone.
- [ ] Run `npx vitest run src/sky/weather.test.js src/sky/air.test.js` and expect FAIL.
- [ ] Implement it. `useAir` mirrors `useForecast` (AbortController; key by lat/lon).
- [ ] Run the tests again and expect PASS. The existing weather tests still pass.

### Task 2: Cloud panel data and words

**Files:**
- Create: `src/sky/cloudPanel.js`
- Test: `src/sky/cloudPanel.test.js`

**Interfaces:**
- Consumes:
  - `buildNight(place, index, now)`
  - `wholeHours(night)`
  - `moments(raw)`
- Produces:
  - `panelNights(place, now) -> { nights: night[], tonight: 1 }`, for nights −1 to 6
  - `cloudHours(night, raw, air) -> hour[]`. Each hour is `{ time, dark, cover, low, mid, high, temp, dew, rain, humidity, aod }`, with null where missing.
  - `startHour(hours, now) -> index`
  - `sameHour(fromNight, fromHour, toNight, toHours) -> index`, keeping the offset from noon and clamping to the new night
  - `barLayers(hour) -> [{ layer:'low'|'mid'|'high', size }]`, sizes in percent of full height that sum to `cover`
  - `cloudSummary(hour) -> { kind, line } | null`
  - `transparencyWords(hour) -> { value, note }`
  - `dewWords(hour, unit) -> { value, note }`
  - `hazeWords(aod, status) -> string`

- [ ] Write the tests, using the spec's exact thresholds and copy:
  - `cloudSummary`:
    - `{cover:10}` gives Clear
    - `{cover:40, low:5, mid:5, high:40}` gives Mostly clear plus the thin high clouds line
    - `{cover:40, low:30}` gives Patchy clouds
    - `{cover:100, low:0, mid:100}` gives Cloudy plus the "solid deck" line
    - `{cover:70, low:60}` gives the "Low clouds block" line
    - `cover:null` gives null
  - `transparencyWords`:
    - cover 85 gives Hidden / behind the clouds
    - aod .05, humidity 50, high 0 gives Excellent
    - aod .25, humidity 90, high 70 gives Bad
    - aod null, humidity 75, high 0 gives Good
  - `dewWords`:
    - temp 40, dew 37 in °F gives High, "3° above the dew point"
    - temp 10, dew 7 in °C gives Some
    - an equal temp and dew point gives "At the dew point"
    - null gives "—"
  - `hazeWords`: .05 Very little, .15 Light, .3 Noticeable, .5 Heavy, null with ready "Not forecast yet", loading "Loading", failed "Not available"
  - `barLayers`: `{cover:100, low:0, mid:100, high:20}` sizes sum to 100; `{cover:50, low:null, mid:null, high:null}` gives one high-less layer list that sums to 50 (treat unknown layers as low)
  - `sameHour`: a later offset into a shorter night clamps to its last hour
  - `startHour`:
    - now inside the night gives the hour containing now
    - otherwise the first dark hour
- [ ] Run `npx vitest run src/sky/cloudPanel.test.js` and expect FAIL.
- [ ] Implement it. The dew gap is converted to °C when `unit` is `°F`. Thresholds are 2.2 and 4.5.
- [ ] Run the tests again and expect PASS.

### Task 3: Popover shell and Moon panel refactor

**Files:**
- Create: `src/components/panel/Popover.jsx`, `src/components/panel/Popover.css`
- Modify:
  - `src/components/moon/MoonPanel.jsx`
  - `src/components/moon/MoonPanel.css`
  - `src/pages/Tonight.jsx`
  - `src/components/tonight/TonightTiles.jsx`
- Move: `src/components/moon/popoverPlace.js(+test)` to `src/components/panel/`

**Interfaces:**
- Produces: `<Popover title="Moon" titleId="moon-title" link={ref} panelClose={ref} onScroller?>{children}</Popover>`. The scroller ref is exposed to children via render prop or forwarded; the shell owns spot, leaving, close, focus, scroll lock (`:root.popover-open`) and the arrow.
- Outlet context: `{ place, now, forecast, links: { moon, clouds }, panelClose }`

- [ ] Move the shell CSS and logic. The classes are `.popover`, `.popover-arrow`, `.popover-scroll`, `.popover-head` and `.popover-close`, and the keyframes are renamed `popover-*`.
- [ ] Both tiles use a `.tile-link` with a `toggle` that closes any open panel (`panelClose.current`).
- [ ] Run `npx vitest run` and expect PASS. In the browser, check that the Moon panel opens, closes, places and keeps focus as before.

### Task 4: Clouds panel

**Files:**
- Create:
  - `src/components/clouds/CloudsPanel.jsx`
  - `src/components/clouds/CloudChart.jsx`
  - `src/components/clouds/NightStrip.jsx`
  - `src/components/clouds/CloudsPanel.css`
- Modify: `src/App.jsx` (route `clouds`), `src/pages/Tonight.jsx` (title)

- [ ] Build it to match mockup v6:
  - **Strip:** 8 columns, 44px buttons, aria-current, tonight teal, past dimmed
  - **Date bar:** ‹ › with aria-disabled at the ends
  - **Chart:**
    - the SVG with layers and the cloud icon at 60% or more
    - role="slider" with aria-valuetext; arrow, Home, End and Page keys
    - pointer drag with `touch-action: pan-y`
  - **Hour labels** every 3 local hours
  - **Key**, then the **verdict**, "at 11pm", the line, the rows and the note
- [ ] Run `npx vitest run`, then `npm run build`. Expect PASS.
- [ ] Verify in the browser:
  - wide popover beside the tile, and the phone sheet
  - keyboard
  - drag
  - the night strip
  - reduced motion
