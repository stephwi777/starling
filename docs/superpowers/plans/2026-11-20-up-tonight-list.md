# Up Tonight List Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Open the full Up tonight list from the card, as approved in mockup v3.

**Architecture:**
- `src/sky/upList.js` builds grouped, sorted rows from the tracked sky.
- `UpTonightPanel.jsx` draws them in the shared `Popover`.

**Tech Stack:** React 19, React Router, Vitest.

**Spec:** `docs/superpowers/specs/2026-11-20-up-tonight-list-design.md`

## Global Constraints

- Site code style; theme tokens only; `div`s inside panels.
- 44px targets; keyboard; screen readers; reduced motion and `:root.still`.
- The user commits.

## Review Focus

- **Opening before dark:** "Up at dark" wording and the reference time. Tested in Task 1.
- **Objects already set** are dropped, and setting objects sort last. Tested in Task 1.
- **High-latitude nights:** the split falls inside the dark hours. Tested in Task 1 (Oslo in May).
- **Tapping chips** never resets the chip row's scroll. Checked in the browser in Task 3.

---

### Task 1: `upList` and `nextShower`

**Files:**
- `src/sky/upList.js` (+test)
- `src/sky/meteors.js`: add `nextShower(now, timeZone) -> { name, peak: Date }` for showers with ZHR of 15 or more

**Interfaces:**
- `upList(sky, now, timeZone) -> { atDark: boolean, at: Date, rows: Row[] }`
- `Row = { key, name, type: 'planet'|'star'|'shape'|'deep'|'meteor', object, gear, group: 'now'|'later'|'dawn', note, setting }`
- `filterRows(rows, { gear, type, query }) -> Row[]`

- [ ] **Tests**, using the Kansas City sky from Nov 20, 2026:
  - at 9pm, Capella is in `now` with the note "4 fists up in the east-northeast now, highest at 2am"
  - Jupiter is in `dawn`
  - objects below the horizon whose best time has passed are absent
  - setting objects sort after the others in `now`
  - at 3pm, `atDark` is true and notes say "at dark"
  - Oslo on May 20: the split falls inside the dark hours
  - `filterRows` respects gear, type and query
  - `nextShower` on Nov 20, 2026 is the Geminids, peaking Dec 14
- [ ] Implement.

### Task 2: Glyphs and placement

- `src/components/sky-icons/GearGlyph.jsx`: Eye, Binoculars and Telescope, using the mockup's exact paths.
- `Popover.jsx`: look for `.tile, .card`.
- Move `TileLink` into `src/components/tonight/TileLink.jsx`. `UpTonightCard` uses it, and its count becomes "See all N ›".

### Task 3: Panel

- **Files:**
  - `src/components/uptonight/UpTonightPanel.jsx` and `.css`
  - the route `up` in `App.jsx`
  - `TITLES.up` and `links.up` in `Tonight.jsx`
- **Behavior:** matches the mockup, including:
  - chips update in place and `scrollIntoView` with `inline: 'nearest'`
  - edge fades and arrows driven by scroll
  - `Show more` in steps of 10, with focus moving to the first new row
  - groups open and close with a CSS grid-rows transition plus a spring keyframe on the inner list
- **Check:**
  - `npx vitest run` and `npm run build` pass
  - in the browser: desktop and phone, chips, "Show more", groups, reduced motion
