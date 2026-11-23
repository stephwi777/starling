# Space station passes: prep notes

Status: parked for later. These are notes for when we design this tool, not an approved design. Brainstorming picks up from "Still open" below.



## Decided

- **Where it lives:** its own tool page under Tools (`/tools`, currently a placeholder). Same reasoning as the aurora tool: passes are short-term, so they don't belong on the 12-month Calendar.
- **Tonight's role:** Tonight's "Up tonight" mentions a bright pass when there is one tonight, linking to the tool. Tonight stays about the whole sky.
- **Who it's for:** "the nerds who are curious", the people who want to step outside and watch the station go over.
- **Not on the Calendar.** A calendar that's full this week and empty after looks broken.



## Proposed, not yet confirmed

- **Which objects:** the two crewed stations, the ISS and China's Tiangong. Both are bright and easy to spot.
- **Left out:** Starlink "trains" are too unpredictable to forecast well. Hubble is possible later.
- **Page content:** a list of the next 7–10 days of visible passes. Each pass shows its start time, where it appears and disappears (compass words), how high it gets (fists, per the accessibility rules), how long it lasts and how bright it is.
- **Sky path drawing:** probably one per pass.



## Constraints

- **Predictions only reach a few days ahead,** a week at best. The orbit changes with air drag and engine burns, so the orbit data has to be refreshed about daily.
- **What counts as visible:** the station is sunlit while the observer's sky is dark (Sun below about −6°), and it climbs at least about 10° up. In practice that's within a couple of hours of dusk or dawn, and a pass lasts 2–6 minutes.
- **Some weeks have none.** With a dark-sky requirement, some stretches have no visible passes at all, so the page needs an empty state that explains why ("The station passes over only in daylight this week…").
- **Accessibility first:** use plain words, give every drawing a text version, don't rely on color alone, make touch targets at least 44px, and support keyboard and screen readers.



## Data and math (to verify when we start)

- **Orbit data:** CelesTrak's public data API, one object per request:
  - `https://celestrak.org/NORAD/elements/gp.php?CATNR=25544&FORMAT=json` (ISS)
  - `CATNR=48274` (Tiangong's Tianhe core module; check this number)
- **CelesTrak's rules:** don't download the same data more often than it updates, or they block the address. Read their current usage policy before building.
- **CORS is unverified.** On 2026-11-23 a test fetch from this machine timed out (possibly the sandbox). If browsers can't fetch it directly, the fallback is a scheduled job that saves the data into the site, or a different source.
- **Pass math:** the standard SGP4 orbit model, via the `satellite.js` library (MIT license). It would be the first new runtime library since astronomy-engine.
- **Whether the station is lit:** work out whether it's in Earth's shadow from the Sun's position, using astronomy-engine.
- **Brightness:** estimate it from the station's standard brightness, its distance, and the Sun–station–observer angle. Check the standard value and the formula against Heavens-Above before trusting them.
- **Checking results:** compare a week of computed passes for Kansas City with Heavens-Above or NASA's Spot the Station.



## Reuse from comets

The comet feature already has the fetch, cache and store pattern this needs:

- `src/sky/calendar/cometStore.js` handles the fetch, keeps a localStorage cache with a freshness window, and falls back to the old copy when a fetch fails. The empty-response check counts as a failure.
- `src/sky/calendar/useComets.js` starts the load once and shares it through `useSyncExternalStore`.
- The tests in `cometStore.test.js` inject `fetcher` and `storage`, so nothing hits the network.

Station data should get a shorter freshness window than comets' 24 hours, about 12 hours (to confirm against CelesTrak's update schedule).



## Still open

1. **The Tools page:** it's a placeholder, and the aurora tool will live there too, so it needs its own landing layout. Decide whether we design that first or alongside this tool.
2. **Objects:** confirm the ISS and Tiangong, and whether to add Hubble.
3. **Pass list layout,** and whether to show a sky path drawing for each pass.
4. **Faint passes:** whether to list them, or only bright ones (a brightness cutoff).
5. **Wording in Up tonight** when a pass is coming.
6. **Alerts:** "remind me" notifications need a back-end, so they're out of scope for now.
