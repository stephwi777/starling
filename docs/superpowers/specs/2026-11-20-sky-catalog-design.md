# Backyard sky catalog design

Date: 2026-11-20

## Why

Up tonight can only pick from about 68 hand-written objects. Before building its full list, the user wants every object a backyard stargazer could find in one catalog, each with an icon made with care. This doc covers the catalog. The icons get their own design round on an icon sheet afterward, since they depend on the details the catalog provides: star color, galaxy shape, cluster type.

## Goals

- About 680 objects, everything findable with eyes, binoculars or a small telescope:

| Group | Count | Source |
|---|---|---|
| Named stars, magnitude 4.0 or brighter | 304 | Hipparcos via d3-celestial `stars.6.json` and `starnames.json` |
| Constellations | 88 | IAU names, label spots and stick figures via d3-celestial |
| Asterisms (well-known patterns) | about 20, hand-picked | d3-celestial `asterisms.json` |
| Messier objects | 110 | SEDS via d3-celestial `messier.json` |
| Caldwell objects | 109 | the Caldwell list, typed by hand by designation and matched to d3-celestial `dsos.14.json` |
| Famous double stars | about 25 | hand list, matched to star data |
| Sun, Moon and planets | 9 | astronomy-engine (as today) |
| Meteor showers | 12 | existing `showers.js` |

- **Every object gets:** an id, a name, a kind, position (RA in hours and Dec in degrees, J2000), brightness, its constellation, the gear needed, and a hint.
- **Hints:**
  - **The best-known ~150 objects:** a hand-written, hand-checked one-line hint, in the voice of today's ("A tiny misty dipper of six stars.").
  - **Every other object:** a plain generated line, like "An orange star in Taurus." or "A spiral galaxy in Ursa Major."
- **Icon details:**
  - stars carry their color (from the B–V color index)
  - galaxies carry their shape (spiral, barred spiral, elliptical, irregular, lenticular)
  - nebulas carry their type (glowing, reflection, planetary, supernova remnant)
  - clusters carry open or globular

## Non-goals

- The telescope-depth set (NGC/IC, every star to magnitude 6.5). That comes later from the same script.
- Constellation boundaries, the Milky Way outline, and star charts.
- The icons themselves (next design round) and the Up tonight list (after that).

## Approaches

1. **Build script (picked by the user).** `scripts/build-catalog.mjs` reads `data/raw/` (git-ignored), keeps the backyard set, merges the hand-written files, and writes compact catalog modules into `src/sky/catalog/`. It runs with `npm run catalog`. The site ships only the result, about 60–80 KB. It can be rerun to fix or grow the catalog.
2. **Ship the raw files and filter in the browser.** About 2 MB per visit.
3. **Type everything by hand.** Slow and error-prone.

## Files

- **Hand-written:**
  - `src/sky/catalog/hints.js`: id → hint
  - `src/sky/catalog/caldwell.js`: Caldwell number → designation and common name
  - `src/sky/catalog/doubles.js`: the famous doubles, with separation and colors
  - `src/sky/catalog/asterismPicks.js`: which asterisms to keep, with friendlier names
- **Generated:** `stars.js`, `constellations.js`, `asterisms.js` and `deepSky.js`, each one exported array under the site's section-header style.
- `planets.js` and `showers.js` stay as they are.
- **Credits page:** a line for d3-celestial (BSD license) and the original sources.

## Gear (my call)

- **Eyes:** magnitude 4.5 or brighter. Exceptions for large, faint-but-obvious objects are set in the hand files, like the Andromeda Galaxy at 3.4.
- **Binoculars:** magnitude 7.5 or brighter.
- **Telescope:** anything fainter.

## Speed (my call)

Up tonight tracks every object across the night. 680 objects × 85 time steps with astronomy-engine's full calculation would be too slow. Fixed objects (stars, deep sky, constellations) get a fast altitude formula: precess the position to the date once, then use local sidereal time for each step. Planets and the Moon keep astronomy-engine. A test checks the fast formula against astronomy-engine to within 0.1°.

## One more download needed

The Caldwell list goes fainter than `dsos.6.json`, so the script also needs `dsos.14.json` from d3-celestial: 3.0 MB, BSD, git-ignored like the others.

## Left to the builder

The script's internals, the exact generated-line wording within the voice above, and which ~20 asterisms to keep (listed in the plan for review).
