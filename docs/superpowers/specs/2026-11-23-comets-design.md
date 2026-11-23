# Comets on the Calendar

Agreed with the user on 2026-11-23. First of three new pieces: comets (this doc), then space station passes, then an aurora tool. Each is designed and built separately.

## Why

Comets are astronomical events: something special worth going out for, at the time they're best. The Calendar's purpose is "never miss something special", so a comet bright enough to see should show up there with enough warning to plan for it. People especially care about comets they can see with their own eyes, and about whether a comet is visible from where they live.

## Goals

- Show every comet predicted to be bright enough for binoculars (magnitude 8 or brighter) while it is visible from the visitor's location.
- Tag the brighter ones (predicted magnitude 6 or brighter at their best) **Naked eye**, so they stand out.
- Telescope users can also see fainter comets (magnitude 8 to 11) through a separate **Telescope comets** kind, off by default (the user's addition after the review).
- Bright comets are rare and usually discovered only months ahead. As of 2026-11-23 no comet is predicted to reach magnitude 8 in the next year, so an empty Comets group is the normal state, and the page must say so plainly rather than look broken (the user chose to build it anyway).
- Up to three events per comet (option B, chosen by the user):
  1. **Arrives:** the first night it's bright enough and visible from here.
  2. **At its best:** the night it's predicted to be brightest while visible from here.
  3. **Last good look:** the last such night.
  These work like the Milky Way season's begins/ends events.
- Always say the brightness is a **prediction**. Comet forecasts are often off by a magnitude or two.
- Data stays current on its own: a comet discovered next month appears without a redeploy.

## Non-goals

- Space station passes and auroras (separate designs).
- Comet observing reports, light curves, tail direction, finder charts, or a comet list page.
- Comets fainter than magnitude 11.
- Showing comets on Tonight's Up tonight list (could come later).

## Anti-goals (failure even if it works)

- The calendar fills with faint, forgettable comets.
- Predictions presented as certain.
- The calendar waits on comet data: the rest of the calendar must show immediately; comets appear when ready.
- A broken or slow data source breaks the page.

## Approaches considered (data source)

The source is the Minor Planet Center's list of comet orbits, `https://www.minorplanetcenter.net/iau/MPCORB/CometEls.txt` (about 165 KB, about 970 comets, updated daily, sends `Access-Control-Allow-Origin: *`).

1. **Fetched live in the browser, cached 24 hours.** Always current; comets appear a moment after the rest of the calendar; if the source is down, comets are missing for the day with a short note. **Chosen** by the user.
2. Snapshot built into the site by a script and shipped with each deploy. Instant and offline, but only as fresh as the last deploy, so surprise comets would be missed.
3. Both: snapshot plus live refresh. Most robust, but two paths to build and maintain.

## How it works

### Data

- Fetch the text file once per browser per 24 hours; store the raw text and fetch time in `localStorage` under `starling.comets` (wrapped in try/catch; fall back to memory only). If a fetch fails and a cached copy exists, use the cached copy even if it's older than 24 hours.
- Parse the fixed-width lines (MPC "one-line" comet format): perihelion date (TT), perihelion distance q (AU), eccentricity e, argument of perihelion, longitude of ascending node, inclination (all J2000 ecliptic), absolute magnitude H, and slope G, plus the designation and name.
- Predicted total magnitude: `m = H + 5·log10(Δ) + 2.5·G·log10(r)`, with r the Sun distance and Δ the Earth distance in AU. The builder should confirm this matches MPC's documented use of the G column (G = 4.0 means the usual "10 log r" law) and spot-check one comet against a published ephemeris.

### Position

- Two-body (Keplerian) motion from the elements for elliptic, near-parabolic and hyperbolic orbits (e from about 0 to above 1). Heliocentric J2000 ecliptic → equatorial, then subtract Earth's heliocentric position (astronomy-engine `HelioVector('Earth', …)`) for a geocentric vector; Δ is its length.
- Altitude and azimuth for the visitor's location via astronomy-engine (convert the J2000 vector to equatorial of date, then `Horizon`).
- Accuracy target: within about 0.5° of a published ephemeris over the coming year. That's ample for "where to look" and for visibility. Planetary perturbations are ignored; the daily-updated elements keep this close enough.

### Visible from here, per night

A night counts as **visible** when, for at least 30 minutes:
- the comet is at least 10° above the horizon,
- and either its predicted magnitude is 8 or brighter with the Sun below −12° (nautical darkness), or, for telescope comets, its predicted magnitude is 11 or brighter with the Sun below −18° (full darkness, since faint comets need it).

A comet's kind comes from its brightest predicted magnitude while visible from here: 8 or brighter is **Comets** (eyes and binoculars); between 8 and 11 is **Telescope comets**.

### Events per comet

Work out each comet's visible stretch once per place, over a fixed span: from the start of the current month to 12 months ahead (the builder's review showed that scanning month by month would give a comet a separate "best" in every month). Past months show no comets, and nothing beyond 12 months ahead, because the orbit data only holds its accuracy for about a year and can't include comets not yet discovered.
- **Arrives**: first visible night after a non-visible stretch. Skip it if the comet is already visible at the start of the span (it isn't "arriving").
- **At its best**: the visible night with the brightest predicted magnitude.
- **Last good look**: last visible night before it stops being visible. Skip it if still visible at the end of the span.
- If the comet is visible for only one night, show only **At its best**.
- Placement follows the existing rules: evening visibility goes on that evening's date; pre-dawn visibility goes on the morning's date.

### Worldwide

A comet bright enough (magnitude 8 or brighter, or 11 for telescope comets) but never visible from here gets one **At its best** event marked not visible here (`here: false`), with a short note on where it can be seen, e.g. "Best seen from the Southern Hemisphere", worked out from its declination at its brightest.

### Calendar integration

- New checklist group **Comets** with two kinds: **Eyes and binoculars** (on by default) and **Telescope comets** (off by default). It needs a group color; the builder picks one from the existing theme tokens that is distinct from the other five groups (a cool green-blue fits comets), so it gets its own `data-group="comet"` color.
- Event fields follow the existing shape (`id`, `kinds`, `group`, `date`, `day`, `time`, `here`, `where`, `icon`, `short`, `tiny`, `name`, `tags`, `note`, `rows`). Tags: `Naked eye` when its best predicted magnitude is 6 or brighter; `Telescope` for telescope comets.
- Names: use the comet's familiar name, e.g. "C/2025 A6 (Lemmon)" → "Comet Lemmon"; "12P/Pons-Brooks" → "Comet Pons-Brooks". If a name repeats between two comets, add the designation. Event names: "Comet Lemmon arrives", "Comet Lemmon at its best", "Last look at Comet Lemmon". Phone `tiny`: the familiar name, e.g. "Lemmon".
- Card rows: Best seen (time window), Look (where, e.g. "Low in the west"), Brightness (predicted magnitude in words using the existing `brightness()` helper, plus "predicted"), In (constellation), Moon (percent lit).
- Note text always includes that brightness is a prediction, e.g. "Predicted to reach magnitude 6.5: a fuzzy patch in binoculars, maybe faintly by eye from a dark place. Comet forecasts are often off, so it could be brighter or fainter."
- A new comet icon for the event card, chips and the month-by-month list.
- Comet events must show in every place calendar events show today: the month grid (wide and phone), the event card, the month-by-month list, search, the .ics downloads, deep links, and Home's Coming up.
- Loading: the calendar renders at once from the existing synchronous engine; comet events join when the data is ready, without a layout jump in the month grid beyond chips appearing. Recomputing must stay cached per place and month like other events.
- **Empty and error states,** shown as a short line under the Comets group in the checklist:
  - no comet qualifies in the next 12 months: "No bright comets expected right now. New ones show up here on their own."
  - data couldn't load and there's no cached copy: "Comet predictions couldn't load right now."
  Nothing else on the page changes; no error banners.
- **Sample comet for development:** in development builds only, a URL flag (e.g. `?comets=sample`) swaps in a small built-in sample list (one naked-eye comet, one binocular comet, one telescope comet, one southern-only comet) so the design can be checked while the real list is empty. Never shipped to visitors.

### Testing

- Parser tests with a few real lines from the file (periodic, non-periodic, hyperbolic).
- Position tests against a published ephemeris for a well-documented comet (e.g. C/2023 A3 Tsuchinshan–ATLAS around October 2024), within the accuracy target.
- Event tests with a fixed set of elements and a fixed place: arrives / best / last-look dates, the Naked eye tag, worldwide fallback, and one-night visibility.
- Fetch and cache tests with a fake fetch and fake storage: fresh cache used, stale cache refreshed, failure falls back to cache, failure with no cache gives no comets.

## Left to the builder

- The exact comet group color and comet icon drawing (follow the site's existing icon style and tokens).
- How the comet list reaches the engine (a small store the Calendar and Home read, a hook, or passing comets into `monthEvents`), as long as caching, search, .ics and Coming up all include comets.
- Scan step sizes and refinement, within the accuracy target.
- Wording details for notes and the "where to see it" text, in the site's plain style.
