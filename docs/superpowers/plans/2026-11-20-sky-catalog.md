# Backyard Sky Catalog Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Generate a catalog of about 680 backyard objects from d3-celestial data plus hand-written lists, and use it in the app.

**Architecture:**
- `scripts/build-catalog.mjs` turns `data/raw/*.json` and the hand files into generated modules in `src/sky/catalog/`.
- `src/sky/fastSky.js` gives quick altitudes for fixed objects.
- `useNight` uses fast tracking for fixed objects.

**Tech Stack:** Node (ES modules), Vitest, astronomy-engine.

**Spec:** `docs/superpowers/specs/2026-11-20-sky-catalog-design.md`

## Global Constraints

- Site code style in generated files too: section headers, no other comments.
- Use RA in hours and Dec in degrees, J2000. d3-celestial longitudes (−180…180°) convert with `ra = ((lon + 360) % 360) / 15`.
- The user commits.

## Review Focus

- **Objects near the poles** (Polaris, the south polar sky): the fast formula matches astronomy-engine. Tested in Task 1.
- **Wrong Caldwell entries:** the script fails if a designation isn't found, or if its type disagrees with the hand list. Tested in Task 3.
- **Stars whose names repeat across catalogs:** ids are unique. Tested in Task 3.
- **Tonight page speed:** building the night with ~680 objects stays under 300 ms in tests. Tested in Task 4.

---

### Task 1: Fast altitude

**Files:** `src/sky/fastSky.js` and its test

**Interfaces:**
- `fixedTrack(object, night, observer) -> { track: [{ alt, az }], bestIndex, visible }`, with the same shape `trackObject` returns
- `precess(ra, dec, date) -> { ra, dec }`

- [ ] **Test:** for Sirius, Polaris, Acrux and M31, every 10-minute step of the Nov 19 Kansas City night is within 0.1° of `trackObject`'s altitude and azimuth.
- [ ] **Implement:** precess with the IAU 1976 rotation, then use Greenwich mean sidereal time with `Astronomy.SiderealTime`.

### Task 2: Hand lists

**Files:**
- `src/sky/catalog/caldwell.js` (109 entries)
- `src/sky/catalog/doubles.js` (~25 entries)
- `src/sky/catalog/asterismPicks.js` (~20 entries)

Each list holds only the facts the data lacks: designation, common name, and the kind expected.

### Task 3: Build script

**Files:**
- `scripts/build-catalog.mjs`, plus `npm run catalog` in `package.json`
- `scripts/build-catalog.test.js`, which tests the pure helpers it exports
- generates `src/sky/catalog/stars.js`, `constellations.js`, `asterisms.js` and `deepSky.js`

- [ ] **Tests:**
  - converting a longitude gives the right RA
  - B–V maps to a color word (blue-white, white, yellow, orange, red)
  - d3 type codes map to kinds and shapes
  - gear thresholds
  - a missing Caldwell designation throws
- [ ] **Run it.** Expect about 304 stars, 88 constellations, about 20 asterisms, and 219 deep-sky objects. The script prints the counts.

### Task 4: Hints and wiring

**Files:**
- `src/sky/catalog/hints.js`
- `useNight.js`, `upTonight.js`, `listing.js` and any code reading the old catalogs
- the Credits page

- [ ] Keep the old hints and add hand hints for the best-known objects.
- [ ] Track fixed objects with `fixedTrack`.
- [ ] Add d3-celestial to Credits.
- [ ] **Check:**
  - `npx vitest run` passes
  - the Tonight page still picks sensible objects
  - the card count reads about "4 of 600+"
