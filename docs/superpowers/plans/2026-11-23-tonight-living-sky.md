# Tonight's Living Sky Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tonight's sky band shows tonight's real conditions using the 21 approved looks, while Home's sky stays exactly as it is.

**Architecture:** Grow the shared sky pieces. Pure functions in `src/sky/` pick the moment (`skyMoment.js`), read its conditions, and turn them into a look (`skyLook.js`); a Tonight-only sentence helper adds rain and snow wording (`bandLine.js`). `src/components/sky/` draws it: new solid cloud outlines and layouts, a falling rain/snow layer, and a soft fade between looks. Home keeps calling `nightLook`, which a test locks.

**Tech Stack:** React 19, Vite, plain CSS, SVG, astronomy-engine, Vitest (`npm test`), oxlint (`npm run lint`).

**Spec:** `docs/superpowers/specs/2026-11-23-tonight-living-sky-design.md`. Visual source of truth: `mockups/sky-looks.html` + `mockups/sky-looks.jsx` (open at `/starling/mockups/sky-looks.html` on the dev server). Read both before starting.

## Global Constraints

- Only Tonight's sky changes. Home's sky, Moon glow, stars, hills and sentence must not change at all (`nightLook` and `shortVerdict` outputs stay identical).
- Every look must match the approved mockup on desktop, at phone size (≤ 700 px) and in red light.
- Phone breakpoint is `max-width: 700px`, the same as SkyScene's existing Moon move.
- Words (date in `--mist`, sentence in `--frost`) keep at least 4.5:1 contrast against whatever sits behind them. If a cloud sits behind the date at real sizes, move the cloud away from the words; don't change an approved color or add a text shadow; tell the user.
- The sky is decorative (`aria-hidden`). Motion stops under `prefers-reduced-motion` and pauses under the site's `.still` class (MotionToggle.css already pauses all animations).
- Code style: section headers (`// NAME` / `/* NAME */` with three blank lines between sections), no other comments, minimal classes, plain code the user can review line by line. Lint with `npm run lint` (oxlint); it does not catch undefined names, so load Home and Tonight in the browser after each component task.
- Commit only when the user says to. Commit messages are plain sentences in the user's style (e.g. "Adds …"), ending with the Co-Authored-By line from the session.

## Review Focus

1. **The moment's hour is outside the forecast** (forecast shorter than the night, or one hour missing): expect the clear look with the real Moon, never a crash. Test in Task 3.
2. **A night with a clock change** (US fall-back, 2026-11-01 in Kansas City): the moment's hour must map to the right forecast hour. Test in Task 3.
3. **Southern hemisphere:** the Moon must stay flipped (`south`) on Tonight like it is today. Test in Task 2.
4. **Long place names and two-line sentences on phones:** rain and snow must still fade out around all the words. Checked in Task 8's browser step with a long sample name.
5. **Page left open across a look change** (dusk → night, clouds arriving): the sky fades over ~2 s without the words or hills flickering, and switches instantly with reduced motion. Checked in Task 9.

---

### Task 1: New sky colors

**Files:**
- Modify: `src/styles/theme.css` (normal tokens near line 44, red tokens near line 115)
- Test: `src/styles/theme.test.js`

**Interfaces:**
- Produces CSS tokens used by later tasks: `--cloud-front`, `--dawn-top`, `--dawn-middle`, `--dawn-low`, `--snow-dawn`, `--twilight-cloud-1` … `--twilight-cloud-4`, `--twilight-cloud-deep`, `--twilight-cloud-low`, `--twilight-cloudy-back`, plus new values for `--moonlit-*`, `--snow-moonlit`, `--overcast-top`, `--overcast-low`, `--cloud-1` … `--cloud-4`.

- [ ] **Step 1: Write the failing tests** in `theme.test.js`

```js
test('the living sky has every new color in both modes', () => {
  const names = ['--cloud-front', '--dawn-top', '--dawn-middle', '--dawn-low', '--snow-dawn', '--twilight-cloud-1', '--twilight-cloud-2', '--twilight-cloud-3', '--twilight-cloud-4', '--twilight-cloud-deep', '--twilight-cloud-low', '--twilight-cloudy-back']
  for (const theme of [normal, red]) {
    for (const name of names) expect(resolve(`var(${name})`, theme), name).toMatch(/^#/)
  }
  expect(normal['--moonlit-top']).toBe('#0c1030')
  expect(normal['--twilight-cloudy-back']).toBe('#463c82')
  expect(red['--dawn-low']).toBe('#661a10')
})

test('the date stays readable over the cloudy twilight sky', () => {
  for (const theme of [normal, red]) {
    expect(contrast(theme['--mist'], resolve('var(--twilight-cloudy-back)', theme))).toBeGreaterThanOrEqual(4.5)
  }
})
```

(Use the file's existing `resolve`, `contrast`, `normal`, `red` helpers.)

- [ ] **Step 2: Run** `npx vitest run src/styles/theme.test.js` — expect the two new tests to FAIL (tokens missing).

- [ ] **Step 3: Add the tokens.** Copy every value from the spec's "Colors" tables: changed values replace the existing ones; new tokens go next to their family. Twilight cloud tokens: normal `#4a4088`, `#50458f`, `#29235b`, `#2d2762`, deep `#1b1745`, low `#50458f`, cloudy-back `#463c82`; red `#4a120c`, `#52150e`, `#260906`, `#2a0a07`, deep `#1c0604`, low `#2a0a07`, cloudy-back `#52150e`. Leave `--overcast-middle` in place (nothing else changes).

- [ ] **Step 4: Run** `npx vitest run src/styles/theme.test.js` — expect all PASS, including the existing surface and contrast tests.

- [ ] **Step 5: Commit** (when the user says to): `git add src/styles/theme.css src/styles/theme.test.js`

### Task 2: The look rules

**Files:**
- Modify: `src/sky/skyLook.js`
- Test: `src/sky/skyLook.test.js`

**Interfaces:**
- Consumes: Task 1 tokens.
- Produces: `skyLook({ sunAlt, moonAlt, moonLit, moonAngle, cloudCover, isHome = false, fall = null, morning = false, twilightAllNight = false, south = false })` returning `{ phase, name, colors: { top, middle, low }, stars, clouds, moon: { angle, lit, halo, south } | null, sun, snow, fall }`.
  - `phase`: `'day' | 'dusk' | 'night'` (dawn keeps phase `'dusk'` so existing CSS keeps working).
  - `name`: `'day' | 'dusk' | 'dawn' | 'overcast' | 'patchy' | 'moonlit' | 'clear'`.
  - `clouds`: 0–3; forced to 3 when `fall` is set.
  - `fall`: `'rain' | 'snow' | null`, passed through.
  - `nightLook` keeps its signature and its exact output.

- [ ] **Step 1: Write the failing tests**

```js
test('home keeps exactly the same clear night', () => {
  expect(nightLook({ moonAngle: 120, moonLit: 0.75 })).toEqual({
    phase: 'night', name: 'clear',
    colors: { top: 'var(--clear-top)', middle: 'var(--clear-middle)', low: 'var(--clear-low)' },
    stars: 1, clouds: 0, moon: { angle: 120, lit: 0.75, halo: true, south: false },
    sun: false, snow: 'var(--snow)', fall: null,
  })
})

test('a bright Moon only fades a quarter of the stars', () => {
  expect(skyLook({ ...night, isHome: false, moonAlt: 30, moonLit: 0.92 }).stars).toBeCloseTo(0.77)
})

test('cloudy skies use a two-color gradient and hide the Moon', () => {
  const look = skyLook({ ...night, isHome: false, moonAlt: 30, moonLit: 0.9, cloudCover: 90 })
  expect(look).toMatchObject({ name: 'overcast', clouds: 3, stars: 0, moon: null })
  expect(look.colors.middle).toBe('color-mix(in srgb, var(--overcast-top), var(--overcast-low))')
})

test('rain or snow always brings the cloudy sky', () => {
  expect(skyLook({ ...night, isHome: false, cloudCover: 20, fall: 'rain' })).toMatchObject({ name: 'overcast', clouds: 3, fall: 'rain', moon: null })
})

test('morning twilight has its own colors', () => {
  const look = skyLook({ ...night, isHome: false, sunAlt: -8, morning: true })
  expect(look).toMatchObject({ phase: 'dusk', name: 'dawn', snow: 'var(--snow-dawn)' })
  expect(look.colors.low).toBe('var(--dawn-low)')
})

test('cloudy twilight keeps the twilight colors with huge clouds', () => {
  expect(skyLook({ ...night, isHome: false, sunAlt: -5, cloudCover: 92 })).toMatchObject({ name: 'dusk', clouds: 3, stars: 0, moon: null })
  expect(skyLook({ ...night, isHome: false, sunAlt: -5, fall: 'snow', morning: true })).toMatchObject({ name: 'dawn', clouds: 3, fall: 'snow' })
})

test('nights that never get fully dark stay in evening twilight', () => {
  expect(skyLook({ ...night, isHome: false, sunAlt: -15, morning: true, twilightAllNight: true })).toMatchObject({ phase: 'dusk', name: 'dusk' })
})

test('the Moon is flipped in the south', () => {
  expect(skyLook({ ...night, isHome: false, moonAlt: 20, moonLit: 0.5, south: true }).moon.south).toBe(true)
})
```

Update the existing test `'a bright Moon lifts the sky and hides faint stars'` to expect `stars` close to `1 - 0.9 * 0.25`, and `'every preset gives its own look'` if you add a `dawn` preset (do: `dawn: { sunAlt: -8, moonAlt: -10, moonLit: 0.3, moonAngle: 60, cloudCover: 0, morning: true }`).

- [ ] **Step 2: Run** `npx vitest run src/sky/skyLook.test.js` — expect the new tests to FAIL.

- [ ] **Step 3: Implement** the rules in `skyLook.js`:
  - phase: `'day'` when `sunAlt > 0 && isHome`; `'dusk'` when `sunAlt > -12` or `twilightAllNight`; otherwise `'night'`.
  - name: in phase `'dusk'` → `'dawn'` when `morning && !twilightAllNight`, else `'dusk'`; at night → `'overcast'` when clouds are 3 or `fall`, `'patchy'` at 2, `'moonlit'` when the Moon is up and > 0.6 lit, else `'clear'`.
  - stars: 0 when clouds are 3 or `fall`; moonlit `1 - moonLit * 0.25`; otherwise the current rules.
  - moon: `null` when below the horizon, or when clouds are 3 or `fall`.
  - colors: add `dawn` to `COLORS`; overcast middle is the `color-mix` string above; snow: add `dawn: 'var(--snow-dawn)'`.
  - `nightLook` passes `south` through `skyLook` instead of spreading it afterwards, and still forces `halo: true`.

- [ ] **Step 4: Run** `npx vitest run src/sky/skyLook.test.js src/styles/theme.test.js` — expect PASS.

- [ ] **Step 5: Commit** (when the user says to).

### Task 3: Which moment, and its conditions

**Files:**
- Create: `src/sky/skyMoment.js`
- Test: `src/sky/skyMoment.test.js`

**Interfaces:**
- Consumes: `buildNight(place, index, now)`, `observerFor(place)` from `night.js`; `positionAt(object, date, observer)` from `tracks.js`; `MOON` from `catalog/planets.js`; `nightWeather` output (`clouds`, `falls`: arrays indexed by whole hour from `night.start`).
- Produces:
  - `skyMoment(night, now) → Date`
  - `skyConditions({ night, moment, observer, clouds, falls, south }) → { sunAlt, moonAlt, moonLit, moonAngle, cloudCover, fall, morning, twilightAllNight, south }` (ready to spread into `skyLook`).

- [ ] **Step 1: Write the failing tests.** Build real nights with `buildNight` for fixed places and times (pattern: `night.test.js`).

```js
const KC = { latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago' }
const LONDON = { latitude: 51.5, longitude: -0.13, timeZone: 'Europe/London' }
const TROMSO = { latitude: 69.65, longitude: 18.96, timeZone: 'Europe/Oslo' }

test('after dark the sky shows right now', () => {
  const now = new Date('2026-11-24T04:00:00Z')
  expect(skyMoment(buildNight(KC, 0, now), now)).toEqual(now)
})

test('in the afternoon the sky shows the start of full darkness', () => {
  const now = new Date('2026-11-23T20:00:00Z')
  const night = buildNight(KC, 0, now)
  expect(skyMoment(night, now)).toEqual(night.astroDusk)
})

test('just after sunset the sky shows the twilight now', () => {
  const now = new Date('2026-11-23T23:20:00Z')
  expect(skyMoment(buildNight(KC, 0, now), now)).toEqual(now)
})

test('a night without full darkness shows its darkest moment before sunset', () => {
  const now = new Date('2026-06-21T12:00:00Z')
  const night = buildNight(LONDON, 0, now)
  const moment = skyMoment(night, now)
  const lowest = Math.min(...night.sun)
  expect(night.sun[night.times.findIndex(time => time.getTime() === moment.getTime())]).toBe(lowest)
})

test('midnight sun shows its darkest moment and polar night shows now', () => {
  const summer = new Date('2026-06-21T12:00:00Z')
  const winter = new Date('2026-12-21T12:00:00Z')
  expect(skyMoment(buildNight(TROMSO, 0, summer), summer)).not.toEqual(summer)
  expect(skyMoment(buildNight(TROMSO, 0, winter), winter)).toEqual(winter)
})

test('conditions read the forecast hour that contains the moment', () => {
  const now = new Date('2026-11-24T04:30:00Z')
  const night = buildNight(KC, 0, now)
  const hour = Math.floor((now - night.start) / 3600000)
  const clouds = night.times.map(() => 10)
  clouds[hour] = 88
  const falls = clouds.map(() => null)
  falls[hour] = 'snow'
  expect(skyConditions({ night, moment: now, observer: observerFor(KC), clouds, falls })).toMatchObject({ cloudCover: 88, fall: 'snow', morning: false, twilightAllNight: false })
})

test('a missing forecast hour reads as no clouds and no rain', () => {
  const now = new Date('2026-11-24T04:30:00Z')
  const night = buildNight(KC, 0, now)
  expect(skyConditions({ night, moment: now, observer: observerFor(KC), clouds: null, falls: null })).toMatchObject({ cloudCover: null, fall: null })
})

test('the forecast hour is right across the fall-back clock change', () => {
  const now = new Date('2026-11-01T08:30:00Z')
  const night = buildNight(KC, 0, now)
  const hour = Math.floor((now - night.start) / 3600000)
  const clouds = night.times.map((_, i) => i)
  expect(skyConditions({ night, moment: now, observer: observerFor(KC), clouds, falls: null }).cloudCover).toBe(hour)
})

test('the Moon is measured at the moment, not at midnight', () => {
  const now = new Date('2026-11-24T01:00:00Z')
  const night = buildNight(KC, 0, now)
  const conditions = skyConditions({ night, moment: now, observer: observerFor(KC), clouds: null, falls: null })
  expect(conditions.moonLit).not.toBe(night.moonLit)
  expect(conditions.morning).toBe(false)
})
```

- [ ] **Step 2: Run** `npx vitest run src/sky/skyMoment.test.js` — expect FAIL (module missing).

- [ ] **Step 3: Implement both functions.**
  - `skyMoment`: no sunset and no sunrise and the Sun stays below the horizon → `now`. No full darkness (`!night.astroDusk`), or no sunset → the `night.times` entry with the lowest `night.sun`, unless `now` is between sunset and sunrise (then `now`). Otherwise `now` when it is between `night.sunset` and `night.sunrise`, else `night.astroDusk`.
  - `skyConditions`: hour index = `Math.floor((moment - night.start) / HOUR)`; `cloudCover = clouds?.[hour] ?? null`, `fall = falls?.[hour] ?? null`; `sunAlt` from `Astronomy` at the moment (Sun horizon altitude); `moonAlt` from `positionAt(MOON, moment, observer).alt`; `moonLit = Astronomy.Illumination('Moon', moment).phase_fraction`; `moonAngle = Astronomy.MoonPhase(moment)`; `morning = moment > night.midnight`; `twilightAllNight = !night.astroDusk` (never-fully-dark and midnight-sun nights; a polar night that still reaches −18° has an astro dusk and uses the normal rules).

- [ ] **Step 4: Run** `npx vitest run src/sky/skyMoment.test.js` — expect PASS.

- [ ] **Step 5: Commit** (when the user says to).

### Task 4: Tonight's sentence

**Files:**
- Create: `src/sky/bandLine.js`
- Test: `src/sky/bandLine.test.js`
- Modify: `src/sky/useNight.js` (add `band` next to `summary`)

**Interfaces:**
- Consumes: `shortVerdict`, `bestWindow`, `windowEdges` from `best.js`; `wholeHours`, `fallSentence` from `hours.js`; `clock` from `words.js`.
- Produces: `bandLine({ night, clouds, falls, best, timeZone }) → string`; `useNight(...)` result gains `band`. `summary` is unchanged (Home's `useSummary` keeps using `shortVerdict`).

- [ ] **Step 1: Write the failing tests** with a hand-made night like `hours.test.js` does (or `buildNight` plus arrays), one per pattern from the spec:

```js
test('no rain keeps the usual sentence', () => {
  expect(bandLine({ night, clouds, falls: dry, best, timeZone })).toBe(shortVerdict({ night, clouds, best, timeZone }))
})
test('rain all night', () => { expect(bandLine({ night, clouds, falls: allRain, best: null, timeZone })).toBe('Rain likely all night.') })
test('rain, then a clear dark stretch', () => { expect(bandLine({ night, clouds, falls: rainUntil2, best: clearAfter2, timeZone })).toBe('Rain likely until 2am, then clear and dark until 5:40am.') })
test('a clear dark stretch, then rain', () => { expect(bandLine({ night, clouds, falls: rainFrom11, best: clearUntil11, timeZone })).toBe('Clear and dark until 11pm, then rain likely.') })
test('anything else uses the hours card wording', () => { expect(bandLine({ night, clouds, falls: onAndOff, best: null, timeZone })).toBe(fallSentence(night, onAndOff, timeZone)) })
test('snow says snow', () => { expect(bandLine({ night, clouds, falls: allSnow, best: null, timeZone })).toBe('Snow likely all night.') })
```

Pick the fixture times so the expected strings come out exactly (5:40am dawn, 2am, 11pm in `America/Chicago`).

- [ ] **Step 2: Run** `npx vitest run src/sky/bandLine.test.js` — expect FAIL.

- [ ] **Step 3: Implement `bandLine`.** Wet hours come from `wholeHours(night)` and `falls` exactly like `fallSentence`. Edge cases (one wet hour, wet only in twilight, a twilight-only clear stretch) are your call within the spec's four patterns; add a test for each one you decide. Then add `band: bandLine({ night: sky.night, clouds, falls: weather?.falls ?? null, best, timeZone: place.timeZone })` in `useNight`.

- [ ] **Step 4: Run** `npm test` — expect PASS (all suites).

- [ ] **Step 5: Commit** (when the user says to).

### Task 5: Tonight uses the living sky, with dev previews

**Files:**
- Create: `src/sky/useTonightSky.js`, `src/sky/skyPreviews.js`
- Modify: `src/pages/Tonight.jsx` (look and sentence)

**Interfaces:**
- Consumes: Tasks 2–4.
- Produces: `useTonightSky({ sky, place, now }) → look` (a `skyLook` result); `PREVIEWS` in `skyPreviews.js`: `{ [number]: skyLook input }` for looks 1–12, 14–22, with the inputs from `mockups/sky-looks.jsx` `CASES` (`sky` plus `fall`, `morning` from `dawn: true`, and `twilightAllNight: true` for 19).

- [ ] **Step 1: Implement `useTonightSky`.** `useMemo` over `skyMoment(sky.night, now)` → `skyConditions({ night: sky.night, moment, observer: sky.observer, clouds: sky.clouds, falls: sky.falls, south: place.latitude < 0 })` → `skyLook({ ...conditions, isHome: false })`. In development only (`import.meta.env.DEV`), a `?sky=N` search parameter returns `skyLook({ ...PREVIEWS[N], isHome: false })` instead.

- [ ] **Step 2: Wire Tonight.** Replace the `nightLook(...)` call with `useTonightSky({ sky, place, now })` and the band paragraph's `{sky.summary}` with `{sky.band}`. Home.jsx is not touched.

- [ ] **Step 3: Verify in the browser** (preview server `dev`; base `/starling/`):
  - `/starling/` (Home): identical to before (compare with a screenshot from `main` before your change).
  - `/starling/tonight`: loads with no console errors; the band sentence shows.
  - `/starling/tonight?sky=4`, `?sky=9`, `?sky=17`: colors and stars match the mockup looks 4, 9 and 17 (clouds are still the old drawing; that's Task 7).

- [ ] **Step 4: Run** `npm test && npm run lint` — expect PASS and zero warnings.

- [ ] **Step 5: Commit** (when the user says to).

### Task 6: Solid cloud outlines

**Files:**
- Create: `src/components/sky/cloudShapes.js`
- Test: `src/components/sky/cloudShapes.test.js`

**Interfaces:**
- Produces: `SHAPES` (the five bump lists from the spec, verbatim), `topAt(bumps, x) → number | null`, `bottomAt(bumps, x) → number`, `cloudPath(bumps) → string` (SVG path in the 200 × 72 box, flat bottom at 70), and `CLOUD_PATHS` (`{ wide, tall, long, hump, small }` precomputed at module load).

- [ ] **Step 1: Write the failing tests**

```js
test('every cloud is solid from its top edge to its bottom', () => {
  for (const bumps of Object.values(SHAPES)) {
    const start = bumps[0][0] - bumps[0][2]
    const end = bumps.at(-1)[0] + bumps.at(-1)[2]
    for (let x = start + 0.5; x < end; x += 0.5) {
      expect(topAt(bumps, x)).not.toBeNull()
      expect(topAt(bumps, x)).toBeLessThanOrEqual(bottomAt(bumps, x))
      expect(bottomAt(bumps, x)).toBeLessThanOrEqual(70)
    }
  }
})

test('the end bumps curve down to the flat bottom', () => {
  for (const bumps of Object.values(SHAPES)) {
    expect(bumps[0][1] + bumps[0][2]).toBe(70)
    expect(bumps.at(-1)[1] + bumps.at(-1)[2]).toBe(70)
  }
})

test('paths are closed and drawn once per shape', () => {
  for (const name of Object.keys(SHAPES)) expect(CLOUD_PATHS[name]).toMatch(/^M.*Z$/)
})
```

- [ ] **Step 2: Run** `npx vitest run src/components/sky/cloudShapes.test.js` — expect FAIL.

- [ ] **Step 3: Implement.** `topAt` = the smallest `cy − √(r² − (x − cx)²)` over bumps that span `x`; `bottomAt` = 70 between the first and last bump centers, and the first/last bump's lower arc (capped at 70) outside them. `cloudPath` traces `topAt` left to right and `bottomAt` right to left (sampling every 0.5 is what the mockup did and is fine; exact arcs are also fine).

- [ ] **Step 4: Run** the test — expect PASS.

- [ ] **Step 5: Commit** (when the user says to).

### Task 7: The new clouds

**Files:**
- Create: `src/components/sky/cloudLayouts.js`
- Modify: `src/components/sky/Clouds.jsx`, `src/components/sky/Clouds.css`, `src/components/sky/SkyScene.jsx` (pass `level`)

**Interfaces:**
- Consumes: `CLOUD_PATHS` (Task 6), look fields `clouds`, `phase`, `name` (Task 2).
- Produces: `LAYOUTS = { 1: { desktop, phone }, 2: { desktop, phone }, 3: { canvas } }`, each a list of `{ shape, x, y, w, shade, flip? }` or `{ shape, moon: { right, top }, w, shade, flip? }`, values copied from the spec's layout tables. `Clouds({ level })` renders nothing at level 0 (so Home is untouched).

- [ ] **Step 1: Write `cloudLayouts.js`** from the spec tables (shade numbers 0–6 → `--cloud-1…4`, `--cloud-front`, deep, low).

- [ ] **Step 2: Rewrite `Clouds.jsx` and `Clouds.css`:**
  - Desktop and phone lists both render; CSS shows one at a time at the 700 px breakpoint.
  - Placed clouds: `left: x%; top: y%; width: w%` of the band; flipped ones use `scale: -1 1`.
  - Moon clouds live in a box matching the Moon's (54 px at `top: 96px; right: 12%`; on phones 40 px at `bottom: calc(var(--ground) + 12px); right: 12%`), positioned by `right`/`top` px from that box; their width is a percentage of the band (container query units on `.clouds` with `container-type: size`).
  - Level 3: the four clouds sit in a canvas `width: max(100cqw, 100cqh * 1132 / 420); aspect-ratio: 1132 / 420`, centered, bottom-aligned.
  - Shades 5 and 6 (deep, low) are `--cloud-3` and `--cloud-2` outside twilight.
  - Twilight (`.sky-scene.dusk .clouds`): map the shade tokens to the `--twilight-cloud-*` tokens (including deep and low); at level 3, cloud-2 uses `--twilight-cloudy-back`, and a `::after` glow layer: `linear-gradient(transparent 45%, color-mix(in srgb, var(--sky-low) 55%, transparent))`.
  - Clouds are drawn over the Moon; keep the existing gentle drift animation off (static), per the spec.
  - Remove the old `CLOUD` path, `LAYOUTS` and `DAY_SHADES` (Home never shows clouds); keep the reduced-motion block only if something still animates.

- [ ] **Step 3: Verify in the browser** against the mockup, desktop width 1280 and phone 375 (`preview_resize`), normal and red light (`document.documentElement.dataset.light = 'red'`): `?sky=5, 6, 7, 8, 9, 10, 16, 18, 21, 22`. Check the Moon overlap in look 8 desktop (about 30%) and the gap in look 6 phone. Load Home and confirm no clouds and no change.

- [ ] **Step 4: Check the date contrast at real sizes** for looks 7, 8, 16, 21, 22 with the sample place and with a long place name (set one in the location dialog, e.g. "Truth or Consequences"): if any cloud other than the cloudy-twilight back clouds sits behind the date, move that cloud away from the words and tell the user.

- [ ] **Step 5: Run** `npm test && npm run lint`, then **commit** (when the user says to).

### Task 8: Rain and snow

**Files:**
- Create: `src/components/sky/Falling.jsx`, `src/components/sky/Falling.css`, `src/components/sky/useWordsBox.js`
- Modify: `src/components/sky/SkyScene.jsx`

**Interfaces:**
- Consumes: look `fall` (Task 2); `DROP` and `FLAKE` path strings (export them from `src/components/ui/icons.jsx`).
- Produces: `Falling({ kind: 'rain' | 'snow' })`; `useWordsBox(sceneRef)` which sets `--words-x`, `--words-y`, `--words-w`, `--words-h` (px, relative to the scene) on the scene element and keeps them current with a `ResizeObserver` and `document.fonts.ready`.

- [ ] **Step 1: Implement `Falling`** with the spec's counts, sizes, timings, colors and the fixed seed (the mockup's `seeded()` with seeds 7 for rain, 11 for snow). Snow flakes turn 60° every 11 s and sway ±6 px over 3 s.

- [ ] **Step 2: Implement `useWordsBox`** by measuring the text of the place name, date and sentence (the mockup's `useTextSpot` measured each line's text with a `Range`; half-widths + 40 px and half-heights + 34 px).

- [ ] **Step 3: Layer it in SkyScene:** order back to front is stars, Moon, clouds, hills, falling, words. The falling layer's mask combines the oval around the words (`transparent 45%` → `black 100%`) with the bottom fade (`black` until `100% − var(--ground) − 10px`, `transparent` at `100% − var(--ground) + 45px`).

- [ ] **Step 4: Verify in the browser:** `?sky=11, 12, 14, 21` with a wet preview, desktop and phone, normal and red; with Pause animations on and with `preview_resize` colorScheme unchanged but `prefers-reduced-motion` emulated if available. Use a long place name to check the words stay clear (Review Focus 4).

- [ ] **Step 5: Run** `npm test && npm run lint`, then **commit** (when the user says to).

### Task 9: Soft change between looks

**Files:**
- Modify: `src/components/sky/SkyScene.jsx`, `src/components/sky/SkyScene.css`

**Interfaces:**
- Consumes: the look object.
- Produces: no new exports. SkyScene keeps its props `{ look, size, decor, children }`.

- [ ] **Step 1: Implement the fade.** Key the sky layer (gradient, stars, Moon, clouds, falling) on `name`, `clouds`, `fall` and whether the Moon shows. When the key changes, keep the previous layer on top and fade it out over 2 s, then remove it. The hills and words never re-render or move. Under `prefers-reduced-motion` the old layer is removed at once. Home's key never changes, so Home is unaffected.

- [ ] **Step 2: Verify in the browser:** on `/starling/tonight?sky=15`, change the URL to `?sky=16` without a reload (e.g. a temporary dev link or `history.replaceState` plus a forced re-render) and watch the fade; repeat with reduced motion emulated (Review Focus 5).

- [ ] **Step 3: Run** `npm test && npm run lint`, then **commit** (when the user says to).

### Task 10: Final check against the mockup

**Files:** none new.

- [ ] **Step 1:** Open `/starling/mockups/sky-looks.html` and `/starling/tonight?sky=N` side by side for every look (1–12, 14–22) at 1280 px and 375 px, in normal and red light. List any difference.
- [ ] **Step 2:** Check Home at 1280 px and 375 px against a screenshot from before the work: no difference.
- [ ] **Step 3:** Check the real Tonight page (no `?sky=`) for the sample place right now and note which look it picked and why.
- [ ] **Step 4:** Run `npm test && npm run lint` — all pass, zero warnings.
- [ ] **Step 5:** Report the differences found (if any) to the user before calling the work done.
