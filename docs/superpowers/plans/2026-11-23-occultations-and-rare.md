# Occultations and Rare Tag Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add lunar occultations seen from your place as a new event type, and a strict "Rare" tag on events that come around less than about once a year where you are.

**Architecture:**
- **A new module, `occultations.js`,** finds when the Moon's edge covers a target as seen from the observer, and builds the event.
- **The existing Moon-and-star and Moon-and-planet passes** call it, and an occultation replaces that pass's "near" event.
- **The Rare tag** is added where each event is built.

**Tech Stack:** React 19, Vite, Vitest, oxlint, astronomy-engine.

**Spec:** `docs/superpowers/specs/2026-11-23-occultations-and-rare-design.md`

## Global Constraints

- Commit only if the user asks. A "commit" step means running `npx vitest run` and `npm run lint` and seeing both clean.
- Code style: section headers like `// SETTINGS`, three blank lines between sections, and no other comments.
- **Kind:** `{ id: 'occultation', group: 'moon', name: 'Moon covers a star or planet', on: true }`.
- **Targets:**
  - The six stars in `starEvents.js` `TARGETS`.
  - The planets Mercury, Venus, Mars, Jupiter and Saturn.
  - The Pleiades add a 0.5° radius. Every other target adds 0.
- **Visibility:**
  - The Moon must be above the horizon at the middle of the occultation.
  - **Dark:** the Sun is below −6°.
  - **Daytime:** allowed only for Venus and Jupiter, tagged "Daytime".
  - Anything else isn't shown. Worldwide adds nothing.
- **Copy:**
  - **Chip:** "Moon covers {short}". The card name is "Moon covers {label}".
  - **Phone label:** {short}.
  - **Rows:** "Disappears", "Reappears", "Look", "Moon".
  - **Note:** "The Moon passes in front of {label}{, hint}, hiding it for N minutes."
  - **Daytime notes** add: "This happens in daylight, so you’ll need binoculars or a telescope."
- **Subject:** `occultation:{targetId}`, labelled "every time the Moon covers {label}".
- **Rare goes only on events where `here` is true:**
  - total or partial lunar eclipses
  - any solar eclipse
  - transits
  - Mars at its closest
  - planet pairs closer than 0.5°
  - occultations

  Blue Moons and Black Moons don't get "Rare".

## Review Focus

1. A pass that is an occultation must never also appear as "Moon near …". Test in Task 2.
2. A daytime occultation of a star or of Mars must never appear. Test in Task 2.
3. "Visible from here" off (Worldwide) must not add unseen occultations. Test in Task 2 (no event with `here: false` and kind `occultation`).
4. An eclipse seen only elsewhere must not say Rare. Test in Task 1.
5. Rare must not stack on a Blue Moon. Test in Task 1.

---

### Task 1: The Rare tag

**Files:**
- Modify: `src/sky/calendar/eclipseEvents.js`, `src/sky/calendar/planetEvents.js`, `src/sky/calendar/wording.test.js`

- [ ] **Step 1: Write the failing tests** in `wording.test.js`, using `all` (Kansas City, Nov 2026 to Dec 2028) and `monthEvents(KC, 2032, 11)` for the transit:
  - Every lunar eclipse that is `here` and not penumbral includes `'Rare'`. Every penumbral one, and every one that isn't `here`, does not.
  - Every solar eclipse includes `'Rare'` exactly when it is `here`.
  - `mars-closest` events that are `here` include `'Rare'`.
  - A `planet-pair` event with a note starting "Only 0.1°" through "Only 0.4°" includes `'Rare'`. One with "Only 1" or more does not.
  - No `full-moon` event includes `'Rare'` (Review Focus 5).
  - The 2032 transit is `here: false`, so it has no `'Rare'`.
- [ ] **Step 2: Run** `npx vitest run src/sky/calendar/wording.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement.** Append `'Rare'` to `tags` in `lunarEvent`, `solarEvent`, `transitEvents`, `marsEvents` and `pairEvents` under the rules above.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS. Fix any older test that checks exact `tags` arrays by adding `'Rare'` where the rule says so.

### Task 2: Finding and listing occultations

**Files:**
- Create: `src/sky/calendar/occultations.js`, `src/sky/calendar/occultations.test.js`
- Modify: `src/sky/calendar/kinds.js`, `src/sky/calendar/starEvents.js`, `src/sky/calendar/planetEvents.js`

**Interfaces:**
- Produces:
  - `findCover(body, around: Date, observer, extra = 0) -> { from: Date, to: Date, middle: Date } | null`. `body` is an astronomy-engine body or planet name. The function steps once a minute through ±3h around `around`, comparing the topocentric separation of the Moon and `body` (`Astronomy.Equator(…, observer, true, true)`) with the Moon's apparent radius plus `extra` (both in degrees).
  - `coverSight(cover, observer, daytimeOk: boolean) -> 'dark' | 'day' | null`.
  - `occultationEvent({ id, short, label, hint, cover, sight, place, observer }) -> event`. It sets `kinds: ['occultation']`, `group: 'moon'` and `icon: 'occultation'`, with `window: { from, to }` and `here: true`. Its `tags` are `['Rare']`, plus `'Daytime'` when `sight === 'day'`. It also sets `day`, `time` (clock of `from`), `rows`, `note` and `subjects` per Global Constraints.

- [ ] **Step 1: Write the failing tests** in `occultations.test.js`, using `monthEvents` with no kind filter:
  - **Kansas City, September 2027:** has an `occultation` event whose name is "Moon covers the Pleiades", on day `2027-09-21` or `2027-09-20`, tagged `'Rare'` and not `'Daytime'`. The same month has no `moon-star` event for the Pleiades within a day of it (Review Focus 1).
  - **Sydney, March and June 2027:** each has a "Moon covers Antares" event.
  - **Kansas City, June 2027:** no `occultation` event. The June 17 Antares one happens in daylight (Review Focus 2).
  - **Sydney, November 2026:** a "Moon covers Jupiter" event is tagged `'Daytime'`.
  - **All months:** every `occultation` event in `all` has `here: true` (Review Focus 3), and its rows' labels start with `['Disappears', 'Reappears']`.
  - **Subjects:** every `occultation` event has a subject key starting with `occultation:`.
- [ ] **Step 2: Run** `npx vitest run src/sky/calendar/occultations.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement.**
  - **`occultations.js`:** add the three functions.
  - **`kinds.js`:** add the kind after `moon-star`.
  - **`moonStarEvents`:** for each pass, run `findCover(target.body, date, observer, target.id === 'M45' ? 0.5 : 0)`. If there's a cover and `coverSight(…, false)` comes back, return `occultationEvent` instead of the near event. The hint is `HINTS[target.id]`.
  - **`moonPlanetEvents`:** the same, with `daytimeOk` true for Venus and Jupiter only, and no hint.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS. The review sheet (`mockups/event-sheet.html`) shows the new entries.

### Task 3: The occultation icon

**Files:**
- Modify: `mockups/icon-options.jsx` (mock), then `src/components/ui/icons.jsx`, `src/components/calendar/EventIcon.jsx`, `mockups/icon-sheet.jsx`

- [ ] **Step 1: Mock two or three versions** in `mockups/icon-options.jsx`: a crescent Moon (the site's crescent and `--moon`) with a small star spark half behind its edge, in a few placements and sizes. Show them large and at real size, and ask the user to pick.
- [ ] **Step 2: Build the picked version** as `OccultationIcon` in `icons.jsx`, map `'occultation'` in `EventIcon.jsx`'s `ICONS`, and add it to the icon sheet.
- [ ] **Step 3: Run** `npx vitest run` and `npm run lint`. Then check the review sheet in the browser for both Kansas City and Sydney.
