# Tonight Moon Tile Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The Moon tile on Tonight shows real percent lit, what the Moon does tonight, and the next full Moon for the visitor's place.

**Architecture:** Two small word helpers in a new `src/sky/moon.js` read the night data `useNight` already builds. The Tonight page calls `usePlace` and `useNight` for tonight and passes them to a `MoonTile` inside `TonightTiles.jsx`.

**Tech Stack:** React 19, astronomy-engine, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-18-tonight-moon-tile-design.md`

## Global Constraints

- Code style: uppercase section headers, several blank lines between sections, no other comments, only the classes that are needed.
- Times use the existing `clock(date, timeZone)` from `src/sky/words.js` ("12:40am", "10pm").
- Exact copy: "Sets at {time}", "Rises at {time}", "Up {time} to {time}", "Up all night", "Not up tonight", "Full tonight!", "Full {Mon D}", joined by " · ".
- Only the Moon tile changes; every other card stays a mockup sample.

## Review Focus

- The Moon sets and rises again in the same night: say "Sets at" the first set, not "Up … to …". Tested in Task 1.
- The full Moon falls in the morning after the night (before noon): "Full tonight!". Tested in Task 1.
- The night right after a full Moon: names next month's date, not the one that just passed. Tested in Task 1.
- Southern hemisphere: the drawing is mirrored. Checked in the browser in Task 2.
- Night changes at sunrise: the tile follows `useNight`'s night, same as Home. No new test.

---

### Task 1: Moon words

**Files:**
- Modify: `src/sky/night.js` (`buildNight` also returns `noon`, the local noon that starts this night)
- Create: `src/sky/moon.js`
- Test: `src/sky/moon.test.js`

**Interfaces:**
- Consumes: `night.times` (Date[] every 10 minutes), `night.noon` (Date), `moon.track` (`{ alt }[]` matching `night.times`), `moon.rise` / `moon.set` (index into `times` or `null`), `clock` from `words.js`, astronomy-engine `SearchMoonPhase(180, start, 40)`.
- Produces: `moonTiming(moon, night, timeZone) -> string` and `nextFull(night, timeZone) -> string`.

- [ ] **Step 1: Write the failing tests** in `src/sky/moon.test.js`. `moonTiming` uses a hand-made night (`times` every hour from 5pm Chicago) and hand-made tracks; `nextFull` uses `buildNight(SAMPLE_PLACE, index, new Date('2026-11-18T20:00:00Z'))`.

```js
test('up at sunset and sets during the night', () => expect(moonTiming(moon([5, 3, 1, -1, -3]), NIGHT, ZONE)).toBe('Sets at 8pm'))
test('rises during the night', () => expect(moonTiming(moon([-3, -1, 2, 4, 6]), NIGHT, ZONE)).toBe('Rises at 7pm'))
test('rises and sets during the night', () => expect(moonTiming(moon([-3, 2, 4, -1, -2]), NIGHT, ZONE)).toBe('Up 6pm to 8pm'))
test('sets and rises again says when it sets', () => expect(moonTiming(moon([3, -1, -2, 1, 2]), NIGHT, ZONE)).toBe('Sets at 6pm'))
test('up all night', () => expect(moonTiming(moon([5, 9, 12, 8, 3]), NIGHT, ZONE)).toBe('Up all night'))
test('not up tonight', () => expect(moonTiming(moon([-5, -9, -12, -8, -3]), NIGHT, ZONE)).toBe('Not up tonight'))
test('names the date of the next full Moon', () => expect(nextFull(nightAt(0), ZONE)).toBe('Full Nov 24'))
test('a full Moon the next morning counts as tonight', () => expect(nextFull(nightAt(5), ZONE)).toBe('Full tonight!'))
test('the night after a full Moon names the next one', () => expect(nextFull(nightAt(6), ZONE)).toBe('Full Dec 23'))
```

`moon(alts)` builds `{ track, rise, set }` with the same crossing rule as `tracks.js` (first index where the altitude goes from ≤ 0 to > 0, and from > 0 to ≤ 0). The full Moon is 2026-11-24 08:54 Chicago time, the next on 2026-12-23.

- [ ] **Step 2: Run `npx vitest run src/sky/moon.test.js`.** Expected: FAIL, module not found.

- [ ] **Step 3: Implement.** Add `noon` to the object `buildNight` returns. In `moon.js`, `moonTiming` decides from whether `track[0].alt > 0`: up → "Sets at" the set time or "Up all night"; down → "Not up tonight", "Rises at", or "Up … to …" when a set comes after the rise. `nextFull` searches from `night.noon`; "Full tonight!" when the result is before `noon + 24h`, otherwise `Full ` + the date as `{ month: 'short', day: 'numeric' }` in `timeZone`.

- [ ] **Step 4: Run `npm test`.** Expected: all tests pass.

---

### Task 2: The real Moon tile

**Files:**
- Modify: `src/components/ui/icons.jsx` (`PhaseMoon` takes `angle` instead of `lit`, plus `south`)
- Modify: `src/components/tonight/TonightTiles.jsx` (new `MoonTile`; `TonightTiles({ sky, place })`)
- Modify: `src/components/tonight/NightsCard.jsx` (pass `angle={phaseAngle(night.lit)}`)
- Modify: `src/pages/Tonight.jsx` (call `usePlace`, `useNow`, `useNight(place, 0, null, now)`; pass `sky` and `place`)
- Modify: `src/pages/Tonight.css` (no › on the Moon tile)

**Interfaces:**
- Consumes: `moonTiming`, `nextFull` from Task 1; `sky.night.moonLit`, `sky.night.moonAngle`, `sky.moon`; `place.timeZone`, `place.latitude`.
- Produces: `PhaseMoon({ angle, size, south })`.

- [ ] **Step 1: `PhaseMoon({ angle, size, south })`** mirrors the shape with `scale(-1 1)` when `south`, like `Moon.jsx`.
- [ ] **Step 2: `MoonTile`** shows the drawing, `{Math.round(moonLit * 100)}% lit`, and `{moonTiming(...)} · {nextFull(...)}`. Its heading has no ›: add class `still` to this tile and hide the `::after` for `.tile.still h2`.
- [ ] **Step 3: Run `npx oxlint src` and `npm test`.** Expected: no warnings, all pass.
- [ ] **Step 4: Browser check** at desktop and 375px: the tile reads today's real values for the sample place (on 2026-11-18 in Kansas City: about 60% lit, "Sets at …" around 1am, "Full Nov 24"); no console errors; setting a southern place (e.g., Sydney) mirrors the drawing.
