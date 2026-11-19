# Moon Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Moon tile on Tonight opens a Moon panel at `/tonight/moon`: a big Moon, a ruler of nights with 2-hour notches, plain rows of facts, and a three-month calendar, matching `mockups/moon-panel.html`.

**Architecture:** Two pure modules hold the Moon facts (`src/sky/moonFacts.js`) and the ruler and calendar data (`src/sky/moonNights.js`), both tested against the US Naval Observatory. A child route of `tonight` renders `MoonPanel` through an `<Outlet>`. `MoonPanel` is a modal `<dialog>` that owns the chosen notch, and uses `MoonRuler` and `MoonCalendar`. `buildNight` moves tonight's Moon moment to local midnight so the tile, Home and the panel agree.

**Tech Stack:** React 19, React Router v8 (declarative), astronomy-engine, Vitest, plain CSS.

**Spec:** `docs/superpowers/specs/2026-11-19-moon-panel-design.md` (read it with this plan). Mockup: `mockups/moon-panel.html` (open it for exact look and feel).

## Global Constraints

- Code style: uppercase section headers (`// RULER`, `/* RULER */`, `{/* ROWS */}`), several blank lines between sections, no other comments, only the classes that are needed. Explain nothing in code comments.
- Don't commit. The user reviews each part and commits it themselves.
- Colors only from theme tokens (`--high`, `--raised`, `--mist`, `--frost`, `--teal`, `--beak`, `--snow-shade`, `--moon`, `--moon-shadow`), so red-light mode works.
- Motion is instant when `prefers-reduced-motion: reduce` matches or `document.documentElement.classList.contains('still')`.
- Times use `clock(date, timeZone)` from `src/sky/words.js` ("2am", "midnight", "noon", "1:59pm").
- Sentence case everywhere. Exact copy: heading "Moon"; rows "Lit", "Moonrise", "Moonset", "Next full Moon", "Distance"; note title "Why does the Moon change shape?" with "The Sun always lights half of the Moon. As it circles Earth, we see more or less of that lit half."; arrow name "Back to tonight"; close name "Close".
- A night runs from local noon to the next local noon. Notches sit at even local hours. Tonight opens at local midnight.
- Targets of at least 44px; visible yellow focus outlines (`3px solid var(--beak)`, offset 2px).

## Review Focus

- **The night the clocks fall back (Oct 31 to Nov 1):** notches stay at real even local hours, and "same time of night" jumps land on the same clock time. Tested in Task 3.
- **Nights with no moonrise or no moonset** (Kansas City Nov 12, Nov 27): the row shows "—" and screen readers hear "None", not a time from the next day. Tested in Task 2; checked in Task 5.
- **Opening `/tonight/moon` directly or from a shared link:** Tonight renders behind the panel, and ✕ goes to `/tonight` without leaving the site. Checked in Task 4.
- **Fast key presses and wheel clicks:** they step from the goal notch, never from mid-glide, so they always land on notches. Checked in Task 5.
- **Southern Hemisphere places:** the big Moon and the calendar Moons are mirrored. Checked in Task 6.

---

### Task 1: Tonight's Moon at local midnight

**Files:**
- Modify: `src/sky/night.js` (export `localNoon`; `buildNight` measures the Moon at midnight and returns it; `upcomingNights` uses noon + 12h)
- Test: `src/sky/night.test.js`

**Interfaces:**
- Produces: `localNoon(year, month, day, timeZone) -> Date` (now exported); `buildNight(...)` also returns `midnight: Date` (noon + 12 hours), and `moonAngle` / `moonLit` are measured at `midnight`.

- [ ] **Step 1: Write the failing test** in `src/sky/night.test.js`

```js
test('tonight’s Moon is measured at local midnight', () => {
  const night = buildNight(SAMPLE_PLACE, 0, new Date('2026-11-19T21:00:00Z'))

  expect(night.midnight.toISOString()).toBe('2026-11-20T06:00:00.000Z')
  expect(Math.round(night.moonLit * 100)).toBe(77)
})
```

- [ ] **Step 2: Run it and see it fail**

Run: `npx vitest run src/sky/night.test.js`
Expected: FAIL (`night.midnight` is undefined).

- [ ] **Step 3: Implement.** Replace `const middle = new Date(start.getTime() + 4 * HOUR)` with `const midnight = new Date(noon.getTime() + 12 * HOUR)`. Use it for `moonAngle` and `moonLit`, and return `midnight`. In `upcomingNights`, use `noon + 12 * HOUR` for `moonAngle`. Export `localNoon`.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: all pass. The existing Nov 13 check (15–22% lit) still holds: it's 21.2% at midnight.

- [ ] **Step 5: Check the page.** Start the `dev` preview and open `/starling/tonight`. The Moon tile says "77% lit" for Nov 19 in Kansas City, and Home's Tonight card says the same.

---

### Task 2: Moon facts

**Files:**
- Create: `src/sky/moonFacts.js`
- Test: `src/sky/moonFacts.test.js`

**Interfaces:**
- Consumes: `localNoon` (Task 1), `observerFor` from `night.js`, `clock` from `words.js`, astronomy-engine.
- Produces:
  - `phaseName(angle: number) -> string`
  - `moonAt(date: Date) -> { angle: number, lit: number, km: number }` (`lit` is 0–1 from `Illumination('Moon').phase_fraction`; `km` from `GeoVector('Moon', date, true).Length() * 149597870.7`)
  - `riseAndSet(place, noon: Date) -> { rise: Date | null, set: Date | null }` (the first of each within 1 day after `noon`, via `SearchRiseSet`)
  - `fullMoonWords(noon: Date, timeZone: string) -> string`
  - `distanceWords(km: number, country: string) -> string`
  - `nightName(noon: Date, timeZone: string) -> string`

- [ ] **Step 1: Write the failing tests.** Use `const KC = { latitude: 39.1, longitude: -94.58, timeZone: 'America/Chicago', country: 'US' }`, `const noonOf = (m, d) => localNoon(2026, m, d, KC.timeZone)` and `clock(..., KC.timeZone)`.

```js
test('phase names follow the angle', () => {
  expect([3, 45, 90, 122, 180, 220, 270, 300, 355].map(phaseName)).toEqual([
    'New Moon', 'Waxing crescent', 'First quarter', 'Waxing gibbous', 'Full Moon',
    'Waning gibbous', 'Last quarter', 'Waning crescent', 'New Moon',
  ])
})

test('the Moon at midnight tonight', () => {
  const moon = moonAt(new Date('2026-11-20T06:00:00Z'))
  expect(Math.round(moon.lit * 100)).toBe(77)
  expect(moon.km).toBeCloseTo(382381, -1)
})

test('rise and set for a night match the Naval Observatory', () => {
  const nov19 = riseAndSet(KC, noonOf(11, 19))
  expect(clock(nov19.rise, KC.timeZone)).toBe('1:59pm')
  expect(clock(nov19.set, KC.timeZone)).toBe('2:32am')
  expect(clock(riseAndSet(KC, noonOf(12, 1)).rise, KC.timeZone)).toBe('1:03am')
})

test('a night without a moonrise or moonset', () => {
  expect(riseAndSet(KC, noonOf(11, 12)).rise).toBe(null)
  expect(riseAndSet(KC, noonOf(11, 27)).set).toBe(null)
})

test('next full Moon counts nights', () => {
  const words = d => fullMoonWords(noonOf(11, d), KC.timeZone)
  expect([15, 16, 19, 22, 23, 24].map(words)).toEqual(['Nov 24', '7 days', '5 days', 'Tomorrow', 'Tonight', 'Dec 23'])
})

test('distance in miles for the US and kilometers elsewhere', () => {
  expect(distanceWords(382381, 'US')).toBe('237,602 mi')
  expect(distanceWords(382381, 'FR')).toBe('382,381 km')
})

test('night names', () => {
  expect(nightName(noonOf(11, 19), KC.timeZone)).toBe('Thursday night, November 19')
})
```

- [ ] **Step 2: Run them and see them fail**

Run: `npx vitest run src/sky/moonFacts.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/sky/moonFacts.js`.**
  - **Phase names:** New Moon below 7° or above 353°; Waxing crescent below 83°; First quarter below 97°; Waxing gibbous below 173°; Full Moon below 187°; Waning gibbous below 263°; Last quarter below 277°; Waning crescent otherwise.
  - **`fullMoonWords`:**
    1. Search `SearchMoonPhase(180, noon, 40)`.
    2. Find the full Moon's night: its local date, or the day before if its local hour is before noon.
    3. Count whole days between that night's date and `noon`'s local date, using `Date.UTC` of the year, month and day so clock changes don't matter.
    4. Words: 0 → "Tonight", 1 → "Tomorrow", up to 7 → "N days", otherwise the full Moon's own local date as "Mon D".
  - **`distanceWords`:** miles are `km / 1.609344`. Round, use `toLocaleString('en-US')`, and add " mi" or " km".
  - **`nightName`:** `${weekday long} night, ${month long} ${day}` in the time zone.

- [ ] **Step 4: Run them and see them pass**

Run: `npx vitest run src/sky/moonFacts.test.js`
Expected: PASS.

---

### Task 3: Ruler and calendar data

**Files:**
- Create: `src/sky/moonNights.js`
- Test: `src/sky/moonNights.test.js`

**Interfaces:**
- Consumes: `localNoon`, `nightStart` (`night.js`), `moonAt` (Task 2).
- Produces:
  - `rulerNights(place, now: Date) -> Night[]`. `Night = { year, month, day, noon: Date, midnight: Date }`. Every night from the 1st of the month before tonight's month to the last day of the month after. Tonight is the night whose `noon` equals `nightStart(place, now)`.
  - `tonightIndex(nights, place, now) -> number`: the index of tonight in `nights`.
  - `notchesFor(nights, timeZone) -> Notch[]`. `Notch = { time: Date, night: number, kind: 'noon' | 'midnight' | 'plain' }`. Every real instant at an even local hour, from `nights[0].noon` up to but not including the noon after the last night. `night` is the index of the night it belongs to.
  - `nearestNotch(notches, time: Date) -> number`: the index of the closest notch.
  - `sameTimeIndex(notches, nights, fromIndex: number, nightIndex: number) -> number`: the notch in night `nightIndex` with the same local clock time as `notches[fromIndex]`, or the nearest one if that time doesn't exist that night.
  - `monthMoons(nights, year, month) -> Array<{ index: number, day: number, angle: number, lit: number }>`: the nights of one month, measured at each night's `midnight`.
  - `rulerLabel(night: Night, isTonight: boolean, timeZone) -> string`: "Tonight", "Dec 1" on the 1st of a month, otherwise the short weekday ("Wed").

- [ ] **Step 1: Write the failing tests** (Kansas City as in Task 2, `now = new Date('2026-11-19T21:00:00Z')`):

```js
test('three months of nights around tonight', () => {
  const nights = rulerNights(KC, NOW)
  expect(nights).toHaveLength(92)
  expect([nights[0].month, nights[0].day, nights.at(-1).month, nights.at(-1).day]).toEqual([10, 1, 12, 31])
  expect(nights[tonightIndex(nights, KC, NOW)].day).toBe(19)
})

test('a night has twelve 2-hour notches from noon, with midnight in the middle', () => {
  const nights = rulerNights(KC, NOW)
  const notches = notchesFor(nights, KC.timeZone).filter(n => n.night === tonightIndex(nights, KC, NOW))
  expect(notches.map(n => clock(n.time, KC.timeZone))).toEqual(['noon', '2pm', '4pm', '6pm', '8pm', '10pm', 'midnight', '2am', '4am', '6am', '8am', '10am'])
  expect(notches.map(n => n.kind).filter(k => k !== 'plain')).toEqual(['noon', 'midnight'])
})

test('the night the clocks fall back keeps even local hours', () => {
  const nights = rulerNights(KC, NOW)
  const oct31 = nights.findIndex(n => n.month === 10 && n.day === 31)
  const notches = notchesFor(nights, KC.timeZone).filter(n => n.night === oct31)
  const midnight = notches.find(n => n.kind === 'midnight')
  const twoAm = notches.find(n => clock(n.time, KC.timeZone) === '2am')
  expect(notches).toHaveLength(12)
  expect(twoAm.time - midnight.time).toBe(3 * 60 * 60 * 1000)
})

test('changing nights keeps the time of night', () => {
  const nights = rulerNights(KC, NOW)
  const notches = notchesFor(nights, KC.timeZone)
  const at = time => notches.findIndex(n => n.time.toISOString() === time)
  const nov24 = nights.findIndex(n => n.month === 11 && n.day === 24)
  const oct31 = nights.findIndex(n => n.month === 10 && n.day === 31)
  expect(notches[sameTimeIndex(notches, nights, at('2026-11-20T10:00:00.000Z'), nov24)].time.toISOString()).toBe('2026-11-25T10:00:00.000Z')
  expect(notches[sameTimeIndex(notches, nights, at('2026-11-25T02:00:00.000Z'), oct31)].time.toISOString()).toBe('2026-11-01T01:00:00.000Z')
})

test('a month of Moons for the calendar', () => {
  const moons = monthMoons(rulerNights(KC, NOW), 2026, 11)
  expect(moons).toHaveLength(30)
  expect(Math.round(moons[18].lit * 100)).toBe(77)
})

test('ruler labels', () => {
  const nights = rulerNights(KC, NOW)
  const find = (m, d) => nights.find(n => n.month === m && n.day === d)
  expect(rulerLabel(find(11, 19), true, KC.timeZone)).toBe('Tonight')
  expect(rulerLabel(find(11, 18), false, KC.timeZone)).toBe('Wed')
  expect(rulerLabel(find(12, 1), false, KC.timeZone)).toBe('Dec 1')
})
```

- [ ] **Step 2: Run them and see them fail**

Run: `npx vitest run src/sky/moonNights.test.js`
Expected: FAIL (module not found).

- [ ] **Step 3: Implement `src/sky/moonNights.js`.**
  - **Notches:** walk hour by hour in real time from the first noon. Keep instants whose local hour (via `Intl`, `hourCycle: 'h23'`) is even.
  - **Kinds:** `kind` is `'noon'` at each night's `noon` and `'midnight'` at local hour 0.

- [ ] **Step 4: Run all tests**

Run: `npx vitest run`
Expected: all pass.

---

### Task 4: Opening and closing the panel

**Files:**
- Modify: `src/App.jsx` (child route: `<Route path="tonight" element={<Tonight />}><Route path="moon" element={<MoonPanel />} /></Route>`)
- Modify: `src/pages/Tonight.jsx` (render `<Outlet context={{ place, now, moonLink }} />`; `moonLink = useRef(null)` passed to `TonightTiles`; `<title>` is "Moon | Starling" when `useMatch('/tonight/moon')` matches, else "Tonight | Starling")
- Modify: `src/components/tonight/TonightTiles.jsx` (`MoonTile` drops `still`; its heading text becomes `<Link ref={moonLink} to="moon" state={{ fromTonight: true }}>Moon</Link>`)
- Modify: `src/components/ScrollToTop.jsx` (scroll to top only when the first path segment changes, so `/tonight` ↔ `/tonight/moon` keeps the page where it is)
- Modify: `src/pages/Tonight.css`:
  - The Moon tile is `position: relative`.
  - Its link stretches over the whole tile (`::after` with `inset: 0`).
  - `.tile:has(a:focus-visible)` gets the yellow outline.
  - The › chevron shows again.
- Create: `src/components/moon/MoonPanel.jsx`, `src/components/moon/MoonPanel.css`

**Interfaces:**
- Consumes: `useOutletContext() -> { place, now, moonLink }`.
- Produces: `MoonPanel` (default export) renders `<dialog className="moon-panel" aria-labelledby="moon-title">` with the heading `<h2 id="moon-title">Moon</h2>`, a close button, and an empty body that Task 5 fills.

- [ ] **Step 1: Implement opening.** On mount, `showModal()`. Focus lands on the close button.

- [ ] **Step 2: Implement closing.**
  - ✕ calls `close()`. So does Escape: handle the dialog's `cancel` event, `preventDefault()`, then call `close()`.
  - `close()` calls `navigate(-1)` when `location.state?.fromTonight` is set, otherwise `navigate('/tonight', { replace: true })`.
  - On unmount, `moonLink.current?.focus()`.

- [ ] **Step 3: Style the panel** after the mockup and `PlaceDialog.css`.
  - **Wide screens:** `width: min(420px, 100vw - 32px)`, `max-height: calc(100dvh - 32px)`, `overflow-y: auto`, `border-radius: var(--radius-card)`, `background: var(--high)`, and the same dimmed `::backdrop` as the location window.
  - **At `max-width: 700px`:** the panel fills the screen (`width: 100vw`, `height: 100dvh`, `max-height: none`, radius 0) and slides up from the bottom over 0.3s. There's no slide when motion is off.

- [ ] **Step 4: Check in the browser** (preview `dev`).
  - Clicking the Moon tile opens the panel at `/starling/tonight/moon`, and Tonight stays where it was scrolled.
  - ✕, Escape and Back each close it, and focus returns to the Moon tile.
  - Loading `/starling/tonight/moon` directly shows Tonight behind the panel, and ✕ lands on `/starling/tonight`.
  - The tab title changes between "Moon | Starling" and "Tonight | Starling".
  - At phone width it fills the screen.
  - Run `npx vitest run`; everything still passes.

---

### Task 5: Big Moon, title row, ruler and rows

**Files:**
- Create: `src/components/moon/MoonRuler.jsx`
- Modify: `src/components/moon/MoonPanel.jsx`, `src/components/moon/MoonPanel.css`

**Interfaces:**
- Consumes: Tasks 2 and 3; `PhaseMoon` from `src/components/ui/icons.jsx` (`<PhaseMoon angle size south />`).
- Produces:
  - `MoonRuler({ notches, nights, tonightNight, index, glide, timeZone, valueText, onMove })` (default export). `onMove(index: number, glide: boolean)`.
  - `useNotchWheel(onStep: (direction: 1 | -1) => void) -> (event) => void` (named export, also used on the big Moon).
  - `MoonPanel` computes `nights = rulerNights(place, now)`, `tonight = tonightIndex(nights, place, now)`, `notches = notchesFor(nights, place.timeZone)` (memoized on place and tonight's noon) and `home = nearestNotch(notches, nights[tonight].midnight)`. Its state is `{ index, glide }`, starting at `{ index: home, glide: false }`.

- [ ] **Step 1: Build the panel body** from the chosen notch:
  - **Big Moon:** `<PhaseMoon angle={moonAt(time).angle} size={170} south={place.latitude < 0} />`.
  - **Title row:** a 44px · 1fr · 44px grid. The middle holds `phaseName(angle)` (Fraunces, 1.6rem) and `nightName(night.noon)`, which gets class `tonight` (teal) when the night is tonight. The two slots hold teal circle-arrow buttons named "Back to tonight":
    - The left one shows when `index > home`.
    - The right one shows when `index < home`.
    - Hide them with `visibility: hidden` so the layout never shifts.
    - Clicking either one calls `onMove(home, false)`.
  - **Rows:** a `<dl>`.
    - Lit: `Math.round(lit * 100)%`.
    - Moonrise and Moonset: `clock(...)` from `riseAndSet(place, night.noon)`. When the time is `null`, show `<span aria-hidden="true">—</span><span className="visually-hidden">None</span>`.
    - Next full Moon: `fullMoonWords(night.noon, …)`.
    - Distance: `distanceWords(km, place.country)`.
  - **Note card:** with the exact copy from Global Constraints.

- [ ] **Step 2: Build `MoonRuler`** with the mockup's look:
  - 90px tall, with edges faded by a mask.
  - Notches every 14px (7px per hour). Ticks have rounded ends: noon is 30px tall, 3px wide, frost at 0.9; midnight is 22px, snow-shade at 0.7; plain is 16px, snow-shade at 0.45.
  - Labels under each night's midnight come from `rulerLabel`, teal and weight 900 for tonight.
  - A fixed yellow pill in the middle shows `clock(notches[nearest].time)`, with a small rounded triangle under it.
  - Position the strip with `left: 50%` and `translateX(-position * 14px)`, never with a measured width.
  - The ruler is `role="slider"`, `tabIndex={0}`, `aria-label="Choose a night and time"`, with `aria-valuemin={0}`, `aria-valuemax={notches.length - 1}`, `aria-valuenow={index}`, and `aria-valuetext={valueText}`. `valueText` reads like "Thursday night, November 19, midnight, Waxing gibbous, 77% lit".

- [ ] **Step 3: Wire the inputs** (see the spec's table). Every step is computed from the `index` prop, the goal, never from the gliding position.

| Input | Call |
|---|---|
| Drag | Move freely, then `onMove(nearest, true)` on release |
| Wheel or trackpad over the ruler or the big Moon | `useNotchWheel`: one step per event when `deltaMode !== 0` or `|delta| >= 40`, otherwise add up deltas and step every 40, then `onMove(index ± 1, true)`. `preventDefault` only there |
| → / ← | `onMove(sameTimeIndex(notches, nights, index, night ± 1), true)` |
| Shift + → / ← | `onMove(index ± 1, true)` |
| Home | `onMove(home, false)` |

- Glides last 140ms for one notch and 250ms for one night, easing out. When `glide` is false, or motion is off, the move is instant.
- During a drag, the pill and the panel's facts follow `nearestNotch` of the live position, so the pill never shows an odd hour.

- [ ] **Step 4: Check in the browser.**
  - The panel opens on "midnight" and "Thursday night, November 19" in teal, showing 77%, 1:59pm, 2:32am, "5 days" and "237,602 mi".
  - Five fast → presses land on midnight on Nov 24, and the left arrow appears.
  - Three wheel clicks move 6 hours.
  - The pill only ever shows even hours while dragging.
  - The arrow returns instantly.
  - The night of Nov 12 shows "—" for Moonrise.
  - Run `npx vitest run`.

---

### Task 6: Calendar

**Files:**
- Create: `src/components/moon/MoonCalendar.jsx`
- Modify: `src/components/moon/MoonPanel.jsx`, `src/components/moon/MoonPanel.css`

**Interfaces:**
- Consumes: `monthMoons`, `sameTimeIndex` (Task 3), `PhaseMoon`.
- Produces: `MoonCalendar({ nights, year, month, first, last, selectedNight, tonightNight, south, timeZone, onMonth, onPick })` (default export). `onMonth(-1 | 1)`. `onPick(nightIndex)`.

- [ ] **Step 1: Build `MoonCalendar`** with the mockup's look.
  - **Header:** a 44px ‹ button, "November 2026" centered (with `aria-live="polite"`), and a 44px › button. The chevrons are drawn as SVG paths. Each button is disabled at the end of the range.
  - **Weekday letters:** "S M T W T F S" with a soft `--raised` divider line under them.
  - **Days:** a Sunday-first grid. Each night is a button with the number above `<PhaseMoon size={24} …>`.
  - **Tonight:** tonight's number is teal.
  - **Chosen night:** it gets a `--raised` background, a 2px `--beak` outline, and `aria-current="date"`.
  - **Button names:** like "Thursday, November 19, 77% lit, tonight".

- [ ] **Step 2: Wire it into `MoonPanel`.**
  - The panel keeps `{ year, month }` for the month being browsed, and switches it whenever the chosen night moves into another month.
  - `onPick(n)` → `onMove(sameTimeIndex(notches, nights, index, n), false)`: instant, and it keeps the time of night.
  - The ‹ › buttons only change which month is browsed.

- [ ] **Step 3: Check in the browser.**
  - Tapping Nov 24 jumps instantly with no slide.
  - Scrolling to 4am and then tapping Nov 24 lands on 4am.
  - Scrolling to 8pm and then tapping Oct 31 lands on 8pm.
  - The calendar follows the ruler into December.
  - With a Southern Hemisphere place (for example Sydney), the big Moon and the calendar Moons are mirrored.

---

### Task 7: Final checks

**Files:** none new.

- [ ] **Step 1: Run all tests.** Run: `npx vitest run`. Expected: all pass.
- [ ] **Step 2: Accessibility pass in the browser.**
  - Tab order: close → arrows (when shown) → ruler → calendar buttons.
  - Screen-reader names come from the ruler's `aria-valuetext` and the calendar labels.
  - At 200% zoom the panel scrolls inside it, and the wheel over the rows scrolls the panel.
  - With reduced motion, and with the site's animation toggle off, nothing glides or slides.
  - In red-light mode every color follows the theme.
- [ ] **Step 3: Compare with `mockups/moon-panel.html`** side by side at desktop and phone width, and fix any visible differences in spacing or sizes.
