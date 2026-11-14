# Phase 3: Tonight's Sky — Design

Date: 2026-11-13 (rewritten after the first mockup was rejected)
Status: Approved direction, building
Mockup: `mockups/tonight-almanac.html` (the "Dark contained" surface)
Rejected: `mockups/tonight-v2.html` (copied the home page's style; generic rounded bar chart)

## Goal

Tonight is the heart of Starling: an interactive night almanac. Someone steps outside, opens it on their phone, and quickly knows:

1. Is tonight worth it?
2. When should I look?
3. What can I see, and where is it?

It should feel fun and exciting to explore, while staying readable, contained and accessible. It lists everything in the sky, not a short pick, and says plainly what isn't visible tonight and why.

Success looks like:

- The first screen answers all three questions in plain words.
- Dragging through the night changes the whole page: what's up, where, and how high.
- Every visual has a text equivalent. Nothing relies on color alone.
- It works with a keyboard, a screen reader, 200% zoom, a dim phone screen, and gloves (44px touch targets where possible).
- The sky math works offline. Each online source can fail on its own without breaking the page.
- Hobbyists never see numbers they didn't ask for; Advanced shows them.

## Decisions

| Question | Decision |
|---|---|
| Style | An information page, not a landing page: contained boxes, data rows, small section titles. It shares Starling's palette and fonts, not the home page's layout. |
| Surface | "Dark contained": dark panels on the night background. Thin borders for now (the user is unsure about them, see Open questions). |
| Detail | A Hobbyist / Advanced switch. Advanced adds columns and numbers inline. |
| Equipment | An "I'm using: Anything / Eyes / Binoculars" filter on the object list. "Anything" includes telescope objects. |
| Time | A night ribbon with a slider. Everything on the page follows the slider's time. It starts at the current time on tonight, or at the start of the best window on other nights. |
| Nights | Tonight plus the next 6 nights. Further ahead belongs to the Calendar (Phase 5). |
| What's listed | Everything: Sun and twilight, Moon, all planets and Pluto, space stations, meteor showers, comets, bright stars, constellations, deep sky. Each category ends with what isn't visible and why. Empty categories say so and link to the Calendar. |
| Heights | Fists above the horizon (about 10° each). Advanced adds degrees. |
| Directions | Compass words. Advanced adds azimuth. |
| Verdict | One sentence in Fraunces at reading size (not a big heading). |
| Red light | A site-wide Normal / Red light screen setting, chosen on Tonight and remembered. |
| Data | astronomy-engine in the browser, Open-Meteo for weather, CelesTrak for the ISS, our own catalog files. |
| Back-end | A small Cloudflare Worker for 7Timer seeing and transparency, with an estimate as fallback. |
| Time zone | Always the place's time zone. |

## Page layout

Top to bottom (see the mockup):

1. **Intro:** "Tonight, Friday, November 13 · Kansas City, Missouri" (with a "Set your location" text button while the place is the sample), the verdict sentence, and the Detail and Screen switches.
2. **Nights:** seven buttons in one boxed row, each with a Moon phase icon, the day, and one sky word (Clear, Patchy, Cloudy). The chosen night is in the address as `?night=2026-11-14`.
3. **At a glance:** one boxed strip of six facts: Moon, Fully dark, Clouds, Seeing, Transparency, Outside. Two columns on phones, three on tablets, six on desktop.
4. **Sky at (time):** the night ribbon, pinned to the top while scrolling. The sky band changes color with twilight; hourly cloud cells line its bottom; a cream line shows when the Moon is up; yellow edges mark the best window. A native range input sits on top (keyboard and screen reader friendly, with a spoken time like "9:15pm, fully dark"). Buttons: −1h, Now, Best, +1h.
5. **Looking up:** a round sky map for the slider's time (stars, constellation lines, planets, the Moon, deep-sky rings). Picking an object circles it in yellow and shows where to look in words. It sits beside the list on desktop and above it on smaller screens.
6. **The list:** a toolbar (Find an object, Show: Up now / Tonight / Everything, I'm using), then one section per category. Each row shows an icon, the name and a one-line tip, what it's doing at the slider's time, an hourly strip for the whole night with a time marker, and gear icons. Advanced adds altitude, azimuth, magnitude, rise and set times, catalog number and size.

## Behavior rules

- **Tonight:** a night runs from sunset to sunrise. Before sunrise, "tonight" is the night in progress; after sunrise it is the coming evening.
- **Time steps:** the night is sampled every 10 minutes, from sunset rounded down to the hour to sunrise rounded up.
- **Visible tonight:** an object counts as visible when it is above 8° (15° for telescope objects) while the Sun is below −8°.
- **Reasons for not visible:** "below the horizon all night", "too close to the Sun" (planets within 20° of the Sun), or "only up in twilight".
- **Best window:** the longest stretch where the Sun is below −18° and cloud cover is under 40%, at least 30 minutes long. With no weather, darkness alone decides.
- **Verdict:** cloudy all night → "Cloudy all night. A good night to plan instead."; patchy with no window → "Clouds come and go all night. Watch for clear breaks."; otherwise "Clear and dark from 6:37pm to 12:50am." plus "but the Moon is bright" when over 60% lit, and "Saturn is the brightest planet up." for the brightest naked-eye planet over 15° mid-window. Without weather: "Dark from 6:37pm to 5:28am. Check the sky for clouds."
- **Heights:** under 10° "on the horizon", under 25° "low", under 55° "halfway up", under 75° "high", otherwise "nearly overhead".
- **Strip cells:** one per hour, shaded by the object's highest point that hour (under 20°, under 50°, higher), hatched when the sky isn't fully dark.
- **Sorting:** easiest first: equipment level, then brightness, then height.
- **Times:** "9:15pm" style; "9pm" on the hour.
- **Units:** °F and mph for US places, °C and km/h elsewhere.

## Architecture

| File | Job |
|---|---|
| `src/sky/words.js` | Clock times, hour labels, compass words, heights, fists. |
| `src/sky/night.js` | `buildNight(place, index, now)`: night start and end, 10-minute times, the Sun's altitude at each, twilight times, Moon phase. |
| `src/sky/tracks.js` | `trackObject(object, night)`: altitude and azimuth at each time, visible or not and why, rise, set, best time, hourly cells. |
| `src/sky/best.js` | `bestWindow(night, clouds)` and `verdict(...)`. |
| `src/sky/catalog/*.js` | Planets, bright stars, constellation figures, deep-sky objects, meteor showers. |
| `src/sky/weather.js` | Open-Meteo fetch and conversion to per-night hourly clouds, temperature, wind, and estimated seeing and transparency. |
| `src/sky/useNight.js` | Combines a place, a night and weather into everything the page shows. |
| `src/settings/` | Mode, gear and light settings, saved as `starling.settings`, with a provider that sets `data-light` on `<html>`. |
| `src/pages/Tonight.jsx` + `.css` | The page. |
| `src/components/tonight/` | One component per part of the page. |

New dependencies: `astronomy-engine` now, `satellite.js` with the ISS milestone.

## Build order

1. **Sky math and the page:** catalogs, night, tracks, words, settings, and the whole page with darkness-only verdict (no weather yet).
2. **Weather:** Open-Meteo clouds, temperature, wind, estimated seeing and transparency, best window, cloud words on the night strip.
3. **ISS and satellites:** CelesTrak and `satellite.js`.
4. **Full catalogs:** all naked-eye stars, all 88 constellations, all Messier and Caldwell objects (needs a data source; see Open questions).
5. **The Worker:** real 7Timer seeing and transparency.
6. **Red light** across the whole site.

## Testing

Vitest, test first, for `words`, `night` (Kansas City sunset and sunrise against the US Naval Observatory within 2 minutes), `tracks` (visible, below horizon, too close to the Sun), `best` (window and every verdict), `weather` (with a fake `fetch`), and settings storage. In the browser: desktop and 375px, keyboard only, the slider with arrow keys, Advanced mode, and red light.

## Open questions (decide while iterating)

- Light borders around boxes: keep, soften, or replace with different panel colors.
- Different panel colors to separate parts of the page.
- Whether the page gets too long: sections with jump links, or separate deeper pages (for example a full deep-sky page).

## Out of scope

Interactive full star chart, printable charts, field-of-view simulator, light pollution map (Phase 6), aurora (Phase 4), the Calendar (Phase 5), alerts.
