# Tonight, Part 1 (Sky Math, Page, Weather) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the real Tonight page from `mockups/tonight-almanac.html`, with sky math done in the browser and Open-Meteo weather (build-order milestones 1 and 2 of the spec).

**Architecture:** Plain, tested functions in `src/sky/` turn a place and a night into data. One hook, `useNight`, combines them with weather. Components in `src/components/tonight/` only display that data. Settings (mode, gear, light) live in a small context, like the place.

**Tech Stack:** React 19, React Router 8, Vite 8, Vitest 5, astronomy-engine 2.1.19, Open-Meteo forecast API.

**Spec:** `docs/superpowers/specs/2026-11-12-tonight-design.md`

## Global Constraints

- Code style: uppercase section headers (`// SECTION` in JS, `/* SECTION */` in CSS, `{/* SECTION */}` in JSX), several blank lines between sections, no other comments, only the classes that are needed.
- Colors only through theme variables in `src/styles/theme.css`, so red light can swap them.
- All times shown in the place's `timeZone`, formatted "9:15pm" / "9pm".
- Nights are sampled every 10 minutes from sunset rounded down to the hour to sunrise rounded up.
- Visible tonight: above 8° (15° for telescope objects) while the Sun is below −8°.
- Best window: Sun below −18° and clouds under 40%, at least 30 minutes.
- Touch targets at least 40px tall; the slider is a native `<input type="range">`.
- No new dependency except `astronomy-engine` in this plan.

## Review Focus

- A place far north in summer where it never gets fully dark: twilight times are `null`, the verdict and tiles must not crash. Test in Task 3 and Task 5.
- Weather that fails to load or comes back with gaps: the page still shows everything, the verdict says to check for clouds. Test in Task 5 and Task 9.
- A place in another time zone than the device: times use the place's zone. Test in Task 2.
- Switching nights or places while weather is still loading: the newer request wins. Handled in Task 9 with an `AbortController`.
- Search text with odd characters or nothing matching: the list shows the "Nothing matches" line. Checked in the browser in Task 8.

---

### Task 1: Branch, dependency and settings storage

**Files:**
- Create: `src/settings/settingsStorage.js`, `src/settings/settingsStorage.test.js`

**Interfaces:**
- Produces: `DEFAULT_SETTINGS = { mode: 'hobbyist', gear: 3, light: 'normal' }`, `loadSettings(storage?) -> settings`, `saveSettings(settings, storage?)`. Key `starling.settings`, saved as `{ version: 1, settings }`.

- [ ] **Step 1:** `git switch -c phase-3-tonight` and `npm install astronomy-engine@2.1.19`.
- [ ] **Step 2: Write the failing tests:** round-trip; nothing saved → defaults; broken JSON → defaults; wrong version → defaults; an unknown `mode`, a `gear` outside 1–3, or an unknown `light` → defaults; throwing storage never throws on load or save. Reuse the fake storages from `src/place/placeStorage.test.js`.
- [ ] **Step 3:** Run `npm test`. Expected: the new tests fail.
- [ ] **Step 4:** Implement, following `src/place/placeStorage.js`.
- [ ] **Step 5:** Run `npm test`. Expected: all pass.
- [ ] **Step 6:** Commit "Adds astronomy-engine and settings storage".

### Task 2: Words

**Files:**
- Create: `src/sky/words.js`, `src/sky/words.test.js`

**Interfaces:**
- Produces: `clock(date, timeZone) -> '9:15pm'`, `hourLabel(date, timeZone) -> '9pm'`, `compass(az) -> 'south-southwest'`, `shortCompass(az) -> 'SSW'`, `height(alt) -> 'low'`, `fists(alt) -> '3 fists up'`, `where(alt, az) -> 'Low in the southwest'`.

- [ ] **Step 1: Failing tests:**
  - `clock(new Date('2026-11-14T03:15:00Z'), 'America/Chicago')` is `'9:15pm'`; the same instant in `'Europe/Paris'` is `'4:15am'`; `clock(new Date('2026-11-14T03:00:00Z'), 'America/Chicago')` is `'9pm'`.
  - `compass(0)`, `compass(359)` → `'north'`; `compass(202.5)` → `'south-southwest'`; `shortCompass(225)` → `'SW'`.
  - `height(5)` on the horizon, `(20)` low, `(40)` halfway up, `(60)` high, `(80)` nearly overhead.
  - `fists(4)` → `'1 fist up'`, `fists(44)` → `'4 fists up'`.
  - `where(20, 225)` → `'Low in the southwest'`; `where(80, 10)` → `'Nearly overhead'`.
- [ ] **Step 2:** Run `npm test`; they fail.
- [ ] **Step 3:** Implement with `Intl.DateTimeFormat('en-US', { timeZone, hour: 'numeric', minute: '2-digit' })`, lowercasing AM/PM and dropping `:00`.
- [ ] **Step 4:** Run `npm test`; pass.
- [ ] **Step 5:** Commit "Adds plain-language sky words".

### Task 3: Night

**Files:**
- Create: `src/sky/night.js`, `src/sky/night.test.js`

**Interfaces:**
- Consumes: a place `{ latitude, longitude, timeZone }`.
- Produces: `observerFor(place) -> Astronomy.Observer`, `nightStart(place, now) -> Date` (noon on the local date whose evening is "tonight"), `buildNight(place, index, now) -> { index, start, end, times: Date[], sun: number[], hours, sunset, sunrise, civilDusk, nauticalDusk, astroDusk, astroDawn, nauticalDawn, civilDawn, moonAngle, moonLit }`. Twilight fields are `null` when the Sun never reaches that depth.

- [ ] **Step 1: Failing tests** (Kansas City sample place, `now = 2026-11-13T20:00:00Z`; US Naval Observatory times):
  - Night 0 sunset within 2 minutes of 2026-11-13 17:05 CST (`23:05Z`), sunrise within 2 minutes of 2026-11-14 07:00 CST, civil dusk within 2 minutes of 17:34 CST.
  - `start` is 17:00 CST, `end` is 08:00 CST, `times` step 10 minutes, `sun.length === times.length`.
  - `moonLit` between 0.15 and 0.22 (USNO says 18%).
  - `now` at 2026-11-14 08:00Z (2am CST) still returns the night that began Nov 13.
  - Night index 3 starts on Nov 16.
  - Fairbanks (64.84, −147.72, `America/Anchorage`) with `now` 2026-06-21 20:00Z: `astroDusk` and `nauticalDusk` are `null`, and nothing throws.
- [ ] **Step 2:** Run; fail.
- [ ] **Step 3:** Implement with `SearchRiseSet`, `SearchAltitude`, `Equator` + `Horizon` for the Sun, `Illumination('Moon')` and `MoonPhase` at start + 4 hours. If the Sun doesn't set, use noon + 6h to noon + 18h as the range.
- [ ] **Step 4:** Run; pass.
- [ ] **Step 5:** Commit "Adds night timing from astronomy-engine".

### Task 4: Catalog and tracks

**Files:**
- Create: `src/sky/catalog/planets.js`, `stars.js`, `constellations.js`, `deepSky.js`, `showers.js`, `src/sky/tracks.js`, `src/sky/tracks.test.js`

**Interfaces:**
- Produces (catalog): arrays of objects `{ name, kind, gear, color, hint, body? , ra?, dec?, mag?, id?, size?, con? }`. Kinds: `planet`, `moon`, `star`, `shape`, `cluster`, `galaxy`, `nebula`, `planetary`, `globular`, `double`, `shower`. Constellations also export `figures` (lists of `[ra, dec]` lines). Data copied from the mockup, with the Moon added to `planets.js` as `MOON`.
- Produces (tracks): `positionAt(object, date, observer) -> { alt, az, ra, dec }`, `trackObject(object, night, observer) -> { ...object, track, visible, reason, rise, set, bestIndex, cells: { level, twilight }[], mag }`.

- [ ] **Step 1: Failing tests** (Kansas City, night 0 from Nov 13 2026):
  - Saturn is visible, `reason === ''`, best time between 8pm and 10pm CST.
  - Omega Centauri: not visible, `'below the horizon all night'`.
  - Mercury: not visible, `'too close to the Sun'`.
  - The Moon's `set` time is within 10 minutes of 20:17 CST (USNO).
  - `cells.length === night.hours`, each `level` 0–3.
  - A telescope object at 12° in full darkness is not visible; a naked-eye one at 12° is.
- [ ] **Step 2:** Run; fail.
- [ ] **Step 3:** Implement, porting `describe()` from the mockup. Planet magnitude from `Illumination(body, bestTime).mag`.
- [ ] **Step 4:** Run; pass.
- [ ] **Step 5:** Commit "Adds sky catalog and object tracks".

### Task 5: Best window and verdict

**Files:**
- Create: `src/sky/best.js`, `src/sky/best.test.js`

**Interfaces:**
- Consumes: `night`, `clouds: number[] | null` (one value per hour), tracked planets.
- Produces: `bestWindow(night, clouds) -> { from, to } | null` (sample indexes), `verdict({ night, clouds, best, planets, timeZone }) -> string`.

- [ ] **Step 1: Failing tests** using a hand-built night (24 samples of 10 minutes, 4 hours):
  - Dark everywhere, clouds `null` → window covers all dark samples; verdict `'Dark from 6:37pm to 5:28am. Check the sky for clouds.'` style (uses `astroDusk` and `astroDawn`).
  - Clouds 80% in hour 3 → window ends before it.
  - Window under 30 minutes → `null`.
  - Clouds all 90 → `'Cloudy all night. A good night to plan instead.'`
  - Clouds alternating 50 and 30, no window → `'Clouds come and go all night. Watch for clear breaks.'`
  - With a window and `moonLit` 0.8 → contains `'but the Moon is bright'`.
  - Brightest naked-eye planet above 15° mid-window is named: `'Saturn is the brightest planet up.'`
  - `astroDusk` `null` (never fully dark) → `'It doesn’t get fully dark tonight.'` and no crash.
- [ ] **Step 2:** Run; fail.
- [ ] **Step 3:** Implement, porting `bestWindow()` and `verdict()` from the mockup.
- [ ] **Step 4:** Run; pass.
- [ ] **Step 5:** Commit "Adds best viewing window and verdict".

### Task 6: Settings context and the night hook

**Files:**
- Create: `src/settings/SettingsContext.jsx`, `src/settings/useSettings.js`, `src/sky/useNight.js`
- Modify: `src/main.jsx` (wrap the app in `SettingsProvider` inside `PlaceProvider`)

**Interfaces:**
- Produces: `useSettings() -> { mode, gear, light, setMode, setGear, setLight }`; the provider saves on change and sets `document.documentElement.dataset.light`.
- Produces: `useNight(place, index, weather) -> { night, observer, moon, planets, stars, shapes, deep, showers, clouds, best, verdict, nowIndex }`, memoized on place, index and weather.

- [ ] **Step 1:** Implement both (no tests: thin React glue over tested functions).
- [ ] **Step 2:** `npm test` and `npm run lint` pass.
- [ ] **Step 3:** Commit "Adds settings context and night hook".

### Task 7: Page frame, intro, nights, glance and time ribbon

**Files:**
- Create: `src/pages/Tonight.jsx`, `src/pages/Tonight.css`, `src/components/tonight/OptionSwitch.jsx`, `NightPicker.jsx`, `Glance.jsx`, `TimeRibbon.jsx`, `Icons.jsx` (+ a `.css` for each component with styles)
- Modify: `src/App.jsx` (route `tonight` → `Tonight`), `src/styles/theme.css` (sky, planet, panel and red-light variables from the mockup)

**Interfaces:**
- `OptionSwitch({ label, options: [{ value, label }], value, onChange })` renders a labeled group of `aria-pressed` buttons.
- `NightPicker({ place, index, onPick })`, `Glance({ data, mode })`, `TimeRibbon({ data, at, onTime })`.
- `Icons.jsx` exports `MoonIcon({ angle, r })`, `ObjectIcon({ object, moonAngle })`, `GearIcons({ level })`.
- The chosen night lives in the URL as `?night=YYYY-MM-DD` via `useSearchParams`.

- [ ] **Step 1:** Build the components from the mockup's markup and CSS, using the theme variables.
- [ ] **Step 2:** In the browser at `/starling/tonight`: the intro, nights, tiles and ribbon show for Kansas City; arrow keys move the slider and the spoken text updates; picking a night updates the address.
- [ ] **Step 3:** Commit "Adds the Tonight page frame and time ribbon".

### Task 8: Sky view and object list

**Files:**
- Create: `src/components/tonight/SkyDome.jsx`, `PickedObject.jsx`, `ObjectList.jsx`, `Category.jsx`, `ObjectRow.jsx`, `SunTimes.jsx` (+ CSS)

**Interfaces:**
- `SkyDome({ data, at, gear, picked })` with `role="img"` and a spoken summary; `PickedObject({ object, data, at, mode })`; `ObjectList({ data, at, picked, onPick })` holds the search text and the Show filter; `Category({ title, note, objects, empty })`; `ObjectRow({ object, at, picked, onPick })`.

- [ ] **Step 1:** Build from the mockup: category order Sun and twilight, Moon, Planets, Meteor showers, Comets (empty, links to `/calendar`), Bright stars, Constellations, Deep sky. Space stations wait for part 2.
- [ ] **Step 2:** In the browser: picking a row circles it on the map; search "m31" finds the Andromeda Galaxy; search "zzz" shows "Nothing matches"; Show "Everything" lists hidden objects; Advanced shows the number columns; 375px has no sideways scroll.
- [ ] **Step 3:** Commit "Adds the sky view and object list".

### Task 9: Weather

**Files:**
- Create: `src/sky/weather.js`, `src/sky/weather.test.js`
- Modify: `src/sky/useNight.js`, `src/pages/Tonight.jsx`, `NightPicker.jsx`, `Glance.jsx`

**Interfaces:**
- Produces: `fetchWeather(place, signal) -> raw Open-Meteo JSON` (hourly `cloud_cover, temperature_2m, wind_speed_10m, relative_humidity_2m, visibility, wind_speed_250hPa`, `forecast_days=8`, `timezone=place.timeZone`, °F and mph for `country === 'US'`), `nightWeather(raw, night, timeZone) -> { clouds: number[], temp, wind, seeing: 1–5, transparency: 1–5, units } | null`, `skyWord(clouds) -> 'Clear' | 'Patchy' | 'Cloudy'`.
- Seeing estimate from 250 hPa wind in m/s: under 20 → 4, under 35 → 3, under 50 → 2, else 1. Transparency from humidity: under 60% → 4, under 80% → 3, else 2; minus 1 when visibility is under 10 km.

- [ ] **Step 1: Failing tests:** a fake response maps each night hour to the right local hour string (`'2026-11-13T17:00'` for the 17:00 CST sample); missing hours give `null`; `skyWord` boundaries at 20 and 60; the URL asks for fahrenheit and mph only for US places; a rejected fetch makes `useNight` treat clouds as `null`.
- [ ] **Step 2:** Run; fail.
- [ ] **Step 3:** Implement, and fetch in `Tonight.jsx` with an `AbortController` per place.
- [ ] **Step 4:** Run; pass. In the browser the tiles, cloud cells, best window and verdict use real weather.
- [ ] **Step 5:** Commit "Adds Open-Meteo weather to Tonight".
