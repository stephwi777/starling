# Moon Panel — Design

Date: 2026-11-19
Status: Ready for review (builder check done)
Mockup: `mockups/moon-panel.html` (final, interactive; real Kansas City data baked in for Oct–Dec 2026)
References: Apple Weather's Moon panel (user's screenshots: big Moon, day ruler with a fixed pointer, label/value rows, month calendar with a phase per day, a back arrow), `docs/superpowers/specs/2026-11-18-tonight-moon-tile-design.md`

## Why

The Moon tile on Tonight shows tonight's phase in one line. The user loves Apple Weather's Moon panel and wants Starling's to be just as delightful: open the tile, see a big Moon, and move through nights to watch the phase change, with the key facts for any night. It is also the first tile that opens into details, so it sets the pattern the Darkness, Clouds and Seeing tiles will follow later.

## Goals

- The Moon tile opens a Moon panel over the Tonight page.
- A big Moon drawing changes phase as you move through time.
- A ruler of nights lets you scrub through time; a month calendar lets you jump to any night.
- Plain rows give the facts for the chosen night: how much is lit, moonrise, moonset, next full Moon, distance.
- Numbers are accurate. They match the US Naval Observatory to the minute and percent, like the Moon tile.
- Fully usable by keyboard, screen reader, reduced motion, 200% zoom and on a phone outdoors.

## Non-goals (for now)

- Panels for the other three tiles. They will reuse this pattern later.
- A photo-real Moon, craters, libration, eclipses, Moon names.
- Fun-fact cards such as "near-supermoon". Possible later, shown only on special nights.
- Seasons beyond the month before and the month after tonight.

## Anti-goals

- Dizzying motion: long sliding jumps, spinning rulers, wobbly animation.
- Glass panels, outlines everywhere, ALL CAPS labels, clutter.
- Meaning carried by color alone. Tonight is shown in teal *and* said in words to screen readers.
- Numbers that disagree with the Moon tile or with almanacs.

## Constraints

- Starling's style: solid rounded shapes separated by fill color, the softened palette, Nunito for text, Fraunces (`'SOFT' 100`) for headings, sentence case. See `docs/superpowers/specs/2026-11-18-visual-redesign-design.md`.
- Code style from the project: uppercase section headers, blank lines between sections, no other comments, only the classes that are needed.
- Red-light mode works through the theme tokens; no hard-coded colors.
- Motion stops for `prefers-reduced-motion: reduce` and for the site's own animation toggle (`:root.still`).
- The site is on GitHub Pages under `/starling/`; `npm run deploy` copies `index.html` to `404.html`, so a direct link to `/starling/tonight/moon` loads the app.
- Everything comes from `astronomy-engine`, which the site already uses. No new data sources or downloads.

## Approaches

**How it opens**

| Approach | Trade-offs | Verdict |
|---|---|---|
| **Panel over Tonight, with its own link** (`/tonight/moon`), built on the browser's `<dialog>` like the location window | Keeps Tonight in view behind it; Back, Escape and ✕ close it; shareable; focus handling comes free; becomes a full-screen sheet on phones | **Chosen by the user** |
| Its own full page | More room, but loses Tonight and doesn't feel like opening a tile | Rejected |
| Expanding the tile in place | Pushes the page around; focus and Back get messy | Rejected |

**Look** (from the mockup rounds)

| Direction | Verdict |
|---|---|
| A · Clean stack: big Moon, ruler, plain rows, calendar, short note | **Chosen**, with an Apple-style ruler and calendar added |
| B · Moon in its own little sky | Not chosen |
| C · Calendar first, no ruler | Not chosen |

**Where the numbers come from**

| Approach | Verdict |
|---|---|
| **Calculate live with `astronomy-engine`** for the chosen moment and the visible calendar month | **Chosen** (builder's pick, stated to the user): fast, works for any place and date |
| Pre-calculate every night (as the mockup does) | Rejected: unnecessary in the app, goes stale |

## Decisions

### Opening and closing

**Revised 2026-11-19 after the user tried the first build:** the panel is a light popover, not a modal. There's no dark backdrop. The whole Moon tile is the button. The panel opens beside the tile (right if there's room, otherwise left) with a tiny arrow pointing at the tile's middle, and follows the tile if the page scrolls. ✕, Escape, clicking outside it, or clicking the tile again close it. Opening is a short fade-and-grow from the tile's side and closing is the reverse. There's no motion with reduced motion or the animation toggle off. The "Moon" title is centered. On phones, and whenever neither side of the tile has room (about 380px), it's still a full-screen sheet that slides up. The ruler is quieter: a small yellow pointer with no time pill, finer ticks 10px apart, and the time moves into the night line ("Thursday night, November 19 at midnight"). The notes below describe the first build where they differ.


- The Moon tile becomes pressable (a link to `/tonight/moon`) and gets its › chevron back. The other tiles stay as they are.
- The panel opens over Tonight. On wide screens it is a centered panel (about the mockup's width, scrolling inside if taller than the window) over a dimmed Tonight. On phones it fills the screen like a sheet.
- It opens at **midnight tonight** (the middle of tonight's night).
- ✕, Escape and Back close it. Closing returns to `/tonight` and puts focus back on the Moon tile. Opening `/tonight/moon` directly shows Tonight with the panel open; closing then goes to `/tonight` without leaving the site.
- The tab title is "Moon | Starling" while it's open.

### Layout, top to bottom (as in the mockup)

1. Heading "Moon" and a ✕ close button.
2. A big Moon drawing in the chosen phase (Starling's flat Moon with the visible `--moon-shadow` dark side and the soft halo ring). Mirrored in the Southern Hemisphere.
3. A title row: phase name (Fraunces), and under it the night, like "Thursday night, November 19". On either side of the title is a slot for a **teal circle arrow**:
   - Moved later than midnight tonight → arrow on the **left**, pointing left.
   - Moved earlier → arrow on the **right**, pointing right.
   - At midnight tonight → no arrow.
   - Clicking it jumps **instantly** to midnight tonight. Its accessible name is "Back to tonight".
4. The ruler (below).
5. Rows: Lit, Moonrise, Moonset, Next full Moon, Distance.
6. The calendar (below).
7. A short note card: "Why does the Moon change shape?" with the text from the mockup.

### Tonight is shown with color

- When the chosen night is tonight, the night line under the phase name is **teal**. Otherwise it is mist.
- Tonight's label on the ruler reads "Tonight" in teal.
- Tonight's number in the calendar is teal.
- No "· tonight" text. Screen readers still hear "tonight" (see Accessibility).

### Nights, not days

- A night runs from local noon to the next local noon, matching the Tonight page. 2am Friday belongs to Thursday night.
- The night line, the calendar selection and the rows all follow the night.

### The ruler

- A fixed yellow pointer in the middle: a rounded pill showing the time ("midnight", "2am", "noon"…) with a small rounded triangle under it. The ticks slide underneath.
- **Notches every 2 hours** at even local hours: 12pm, 2pm … 10am. The tall white tick is at **noon** (between nights). A slightly taller notch is at **midnight** (the middle of a night). Others are plain.
- About 168px per night (the mockup uses 7px per hour). Edges fade out.
- A label sits under the middle of each night: short weekday ("Wed"), "Tonight" in teal, or "Dec 1" style on the first of a month.
- Range: from the first night of the month before tonight's month to the last night of the month after.
- The pill always shows the notch you will land on, even mid-drag. It never shows odd hours.
- Clock changes: notches are placed at real local even hours, so the night the clocks fall back has one extra hour and nothing drifts.

### Moving through time

| Input | Result |
|---|---|
| Drag the ruler | Moves freely, then glides to the nearest notch on release |
| Mouse wheel over the ruler or the big Moon | Each click moves exactly one notch |
| Trackpad over the ruler or the big Moon | Movement adds up; every 40px moves one notch; never free-form |
| Wheel or trackpad anywhere else in the panel | Scrolls the panel normally |
| → / ← on the ruler | One night later / earlier, same time of night |
| Shift + → / ← | One notch |
| Home | Midnight tonight, instantly |
| Teal arrow | Midnight tonight, instantly |
| Calendar night | That night, instantly, **keeping the time of night you were on** (4am stays 4am) |
| Calendar ‹ › | Changes which month you're browsing only; doesn't move the ruler |

- Only the ruler and the big Moon take the wheel. This was the user's own idea (scrolling the Moon through its phases). Everywhere else scrolls the panel, so nobody gets stuck at 200% zoom or in a short window. The title, rows and calendar always leave somewhere to scroll from.
- Fast repeated presses or wheel clicks always step from where the ruler is *headed*, never from mid-animation, so they land exactly on notches.
- Short moves (one notch, one night) glide for about 140–250ms. Jumps are instant. With reduced motion or the animation toggle off, everything is instant.
- When the ruler moves into another month, the calendar follows to that month.

### Rows

| Row | Value |
|---|---|
| Lit | Percent of the disk lit at the chosen moment (`Illumination('Moon').phase_fraction`, rounded), the same calculation as the Moon tile |
| Moonrise | The first moonrise after local noon of the chosen night's date |
| Moonset | The first moonset after local noon of the chosen night's date |
| Next full Moon | Counted in **nights**, using the same rule as the Moon tile: the full Moon belongs to the night (noon to noon) it happens in. "Tonight" if it falls in the chosen night, "Tomorrow" for the next night, "N days" up to 7, otherwise the full Moon's date ("Dec 23"). The search starts at the chosen night's noon, so after a full Moon has passed it shows the next one |
| Distance | Earth–Moon distance at the chosen moment, with a thousands separator: miles for places in the US, kilometers elsewhere (builder's call, matching how weather units are chosen) |

- Rise and set use the exact almanac rule (top edge, refraction), as the Moon tile now does. For Nov 19 in Kansas City they read 1:59pm and 2:32am, matching the tile.
- Lit, phase name and the Moon drawing update continuously while scrubbing. Rise, set, full Moon and distance change per night (distance can follow the moment; either is fine).
- If there is no rise or set within the next day, show "—" with an accessible "None".

### One moment for "tonight" (builder's call, settled after review)

- The panel opens at midnight tonight, the middle of tonight's night, as the user defined it.
- So that nothing disagrees, the Moon tile, the Next 7 nights Moons and the sky band also take tonight's Moon at **local midnight of the night**. Today they use 4 hours after the hour of sunset (`moonAngle` and `moonLit` in `buildNight`).
- Tonight in Kansas City this changes the tile from 76% to 77%. The calendar's small Moons and their spoken "% lit" use the same midnight moment.

### Phase names

From the Moon's phase angle (builder's call, used in the mockup): New Moon below 7° or above 353°; Waxing crescent to 83°; First quarter 83–97°; Waxing gibbous to 173°; Full Moon 173–187°; Waning gibbous to 263°; Last quarter 263–277°; Waning crescent after.

### Calendar

- Header: a rounded ‹ button, "November 2026" centered, a rounded › button. Buttons are disabled at the ends of the three-month range.
- Weekday letters S M T W T F S under the header, with a soft divider line.
- Each night: the **number above** a small Moon in that night's phase (taken at that night's local midnight).
- Tonight's number is teal. The chosen night has a raised background with a yellow outline.
- Sunday-first weeks.

## Accessibility

- The panel is a modal `<dialog>` labelled by its "Moon" heading. Focus starts on the close button and returns to the Moon tile on close.
- The ruler is a focusable `role="slider"` with `aria-valuetext` like "Thursday night, November 19, midnight, Waxing gibbous, 77% lit". Arrow keys, Shift + arrows and Home work as above.
- Calendar nights are buttons named like "Thursday, November 19, 76% lit, tonight". The chosen one has `aria-current` or is otherwise announced as selected. The month heading is announced politely when it changes.
- Tonight's teal is never the only signal: the ruler's "Tonight" label is text, and screen-reader names include "tonight".
- Every button is at least 44px. Focus outlines are visible (yellow, like the mockup).
- Works at 200% zoom: the panel scrolls inside; rows and calendar stay readable.
- The Moon drawings are decorative (`aria-hidden`); the phase name and percent carry the meaning.
- Red-light mode: all colors come from theme tokens.

## Data and code shape

- A pure module of Moon facts with tests against USNO values. Event times may differ by up to 1 minute: astronomy-engine puts the full Moon at 14:54:04 UT where USNO lists 14:53. Rise and set already match to the minute. Known checks:
  - Full Moon 2026-11-24 14:53 UT.
  - Kansas City, night of Nov 19: rise 1:59pm, set 2:32am.
  - Night of Dec 1: moonrise 1:03am.
  - Percent lit at local noon: 72% (Nov 19), 81% (Nov 20), 100% (Nov 24).
  - Next full Moon on the night of Nov 23 reads "Tonight", matching the tile's "Full tonight!"; on the night of Nov 24 it reads "Dec 23".

  Functions cover the phase name, the Moon at a moment (angle, lit, distance), rise and set for a night, next-full-Moon words, the phases of a calendar month, and the ruler's notches for a date range.
- Reuse the night logic already in `src/sky/night.js` and `src/sky/moon.js` (local noon, observer, exact rise and set) rather than duplicating it.
- Screen pieces: the panel, the ruler and the calendar, in the project's existing component style. The big Moon reuses the existing Moon drawing (`MoonShape` with the `--moon-shadow` color).

## Left to the builder

- Component and file names, and how the route nests (for example a child route of `tonight` rendered through an `<Outlet>`).
- Exact sizes, spacing and easing within the mockup's look.
- How the sheet animates in on phones (gentle, and none with reduced motion or the toggle off).
- Whether distance follows the exact moment or the night.
- Test structure, beyond checking the USNO values above.
