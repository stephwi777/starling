# Calendar ideas for later

Status: parked notes, not an approved design. Saved 2026-11-26 so we can pick from them when we come back to add more to the Calendar.

The user's rule for the Calendar: lean into full lists, even events you can't see from here. The checklist (with lesser-known kinds starting off) and the Visible from here / Worldwide switch already let each visitor hide what they don't want.



## New event kinds

Mostly spotted in in-the-sky.org's year view (the user's screenshots, 2026-11-26).

| Idea | Example | What it takes | Notes |
|------|---------|---------------|-------|
| **Minor meteor showers** | phi Cassiopeiids, alpha Centaurids, gamma Normids, gamma Ursae Minorids | Add IMO's full working list of showers to `src/sky/catalog/showers.js` (radiant, solar longitude of peak, ZHR, speed) | **Asked for by the user.** We have 13 showers today. Needs the user's OK to use IMO's list as the data source. The faintest could start off in the checklist. |
| **More lunar occultations** | Moon covers Elnath (Beta Tauri), Nunki (Sigma Sagittarii) | Check every bright star near the Moon's path, not just the six targets we have now | **Asked for by the user.** Today: planets ("Moon covers a planet", on) and the Pleiades, Beehive, Aldebaran, Regulus, Spica, Antares ("Moon covers a bright star", off by default). astronomy-engine only allows 8 user-defined stars (`DefineStar` Star1–Star8), so this needs our own Moon-to-star check using `fastSky.js`. Consider switching star occultations on by default. |
| **Asteroid and dwarf planet oppositions** | Asteroid 7 Iris at opposition, 136472 Makemake at opposition | Orbits from the Minor Planet Center (our comet code already reads MPC orbit lines in `cometOrbit.js`) | Vesta and Ceres can reach binocular range; most are telescope only. |
| **Asteroid and dwarf planet conjunctions** | Conjunction of Ceres and Eris, Venus and Ceres, Pluto at solar conjunction | Same orbits as above | Mostly telescope-only; good candidates to start off. |
| **Deep-sky objects well placed** | "The Beehive cluster is well placed", "The Sombrero Galaxy is well placed" | The date each catalog object is highest at midnight (opposite the Sun), from `src/sky/catalog/deepSky.js` | 219 objects would flood the calendar; probably its own kind, off by default, maybe only the famous ones. |
| **Every planet's closest approach to Earth** | Jupiter at perigee | Distance minima like `mars-closest` | Today only Mars has this. |
| **Close pairs with Uranus and Neptune** | Conjunction of Saturn and Neptune, Mars and Neptune | Extend `pairEvents` beyond the bright planets | Binocular/telescope events; could share "Close pairs of planets" or be its own kind. |
| **Comet perihelion and closest to Earth** | Comet C/2024 E1 (Wierzchos) passes perihelion / perigee | Already have the orbits in `cometEvents.js` | Today comets get "best" phases only. |
| **Mercury half-lit (dichotomy)** | Mercury at dichotomy | Phase angle 90° | Telescope interest only; off by default. |
| **Highest in the evening or morning sky** | Mercury at highest altitude in evening sky | Altitude at the end of civil twilight, maximum over the apparition | Arguably the best night to look for Mercury, more useful than greatest elongation. |
| **Moon at perihelion / aphelion** | The Moon at aphelion | Moon's distance from the Sun | Probably skip: means little to stargazers. |
| **Variable stars** (Claude's suggestion) | Algol at its dimmest, Mira at its brightest | Published elements (Algol period 2.867 days) | Algol dimming is a classic naked-eye sight. |
| **Asteroid flybys** | A near-Earth asteroid passes close | NASA JPL close-approach data (online feed) | Listed as a known gap since the first Calendar build. |
| **Aurora outlooks** | — | NOAA SWPC 27-day outlook | Short-term; the user moved aurora to its own tool. Maybe only a link from the Calendar. |



## Improvements to what's there

From the Calendar's known-gaps list (memory, 2026-11-20 onward).

- Shower peaks use our catalog's single date; IMO publishes yearly peak times.
- Planet parades split at month boundaries.
- Region names for eclipses are rough boxes.
- Supermoon threshold is 361,900 km at full Moon; check against a published definition.



## Bigger ideas

- **Weather on the Calendar:** the user wants the Calendar to show weather eventually (for the next ~7 nights, using the forecast Tonight already has).
- **Subscribe instead of download:** a calendar feed that updates itself. Needs a hosted file per place and settings, so it waits for a back-end.
- **Notifications:** "remind me" alerts need a back-end. The .ics reminders cover part of this today.



## Settled, don't re-propose

- No day view (decided 2026-11-23): times are already explicit.
- No "where to look" arrow or sketch in event cards (2026-11-23).
- No Moon phase in every day square (2026-11-20).
- Space station passes and aurora are tools on the Tools page, not Calendar events (2026-11-23).
