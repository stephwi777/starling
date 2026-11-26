# Tools page design

Date: 2026-11-26. Status: approved by the user on 2026-11-26 (keep Jupiter's moons for now).



## Why

`/tools` is a placeholder, but the header, the footer and a Home door already link to it. Space station passes and the aurora tool will live there, and more tools will follow. The page is the hub: a visitor sees every sky tool and opens the one they want. Adding a tool later should only mean adding a tile.



## Goals

- One simple tile per tool: a picture on top, the tool's name, and one warm line about what it does. The whole tile opens the tool.
- Easy to grow: adding or finishing a tool means editing one entry in one list.
- Show every tool Starling plans, like in-the-sky.org's full lists: each planned tool has a "Coming soon" tile until it is built.
- Accessible first: readable at a glance on a phone outside, keyboard and screen reader friendly.



## Non-goals

- No live data on tiles (no "Next pass 6:42pm"). The user picked simple tiles like calsky's tools index.
- No sky band. That stays on Home and Tonight only.
- No dropdown menus or categories. The list is short; a flat grid is enough.



## Anti-goals

- Generic glass cards, outlines, shadows or a template look.
- Photos, which clash with the flat Finch-style art and can't follow red light.



## Approaches

1. **One list of tools turned into tiles (picked).** `Tools.jsx` holds a list; each entry has the name, line, link, scene and whether it is ready. The page maps the list into tiles. Finishing a tool flips one value.
2. **Each tile written out by hand.** Simpler with two tiles, but every tile repeats the same markup and the ready/coming-soon switch is spread across the page.

The user accepted approach 1.



## Decided with the user

- **Tiles:** calsky-style: picture on top, name, one line.
- **Pictures:** small flat scenes built from Starling's own approved art (hills, stars, aurora ribbons, Moon). A tool without its scene yet shows a plain block of color in the picture area.
- **Coming soon tiles:** planned tools appear with a plain color picture and a "Coming soon" label, and are not clickable.
- **Every planned tool gets a tile** (the user, 2026-11-26: "make sure all of them are in there as tiles"). At launch all 15 are coming soon. Space station passes becomes the first ready tool.



## The tools

Update 2026-11-26 after the build (user's request): tiles are grouped by similarity under headings, each group's tools ordered from most to least used, and groups ordered the same way. Ready tiles no longer jump to the front. Grid is 1 / 2 / 4 columns (660px and 1160px breakpoints). Tiles and group headings rise in on scroll like About and Contact, a whole row at once (the user found a left-to-right stagger strange); a ready tile presses like Tonight's cards; pressing a coming soon tile gives its "Coming soon" label a small pop instead.

1. **Find your way around the sky:** Star chart, Phone sky view, Photo star finder, Solar system view
2. **Catch something special:** Space station passes, Aurora, Sunset forecast, Moonbow chances
3. **Plan your night out:** Sky map, Live cloud satellite, Almanac, Printable charts
4. **Look closer:** Moon map, The Sun today, Jupiter's moons, Eyepiece view

**The Sun today** (added 2026-11-26, the user's pick to fill Look closer): today's pictures of the Sun from NASA's Solar Dynamics Observatory (free to use), showing sunspots and flares, with a clear warning never to look at the Sun without a proper solar filter. Ties into the Aurora tool: flares cause auroras a day or two later.

The table below keeps the original build order and sources.

| # | Tile | Line | Where the idea came from | Notes |
|---|------|------|--------------------------|-------|
| 1 | Space station passes | See when the station flies over you! | Earlier plan | Prep notes in `2026-11-23-space-station-passes-notes.md` |
| 2 | Aurora | Could you catch an aurora tonight? | Earlier plan (Phase 4) | NOAA SWPC Kp and OVATION |
| 3 | Star chart | Find your way around tonight's sky. | Earlier plan | Stellarium-style sky dome from our catalog |
| 4 | Almanac | Rise, set and twilight times for any date. | User | Tables from astronomy-engine |
| 5 | Printable charts | Star wheels and finder charts to print and take outside. | Earlier plan (planisphere and finder charts, merged by the user 2026-11-26) | One tool with a choice of chart; shares the star chart's drawing |
| 6 | Jupiter's moons | See where Jupiter's four big moons are tonight. | Claude, from in-the-sky | astronomy-engine has `JupiterMoons`; kept for now (user, 2026-11-26) |
| 7 | Moon map | Seas and craters you can spot with binoculars. | Claude, from in-the-sky | |
| 8 | Eyepiece view | See how an object will look in your telescope or camera. | Earlier plan (field-of-view simulator) | |
| 9 | Sky map | Dark places, light pollution and the aurora on one map. | User ("ultimate map") | This is the Map page; the tile opens `/map` |
| 10 | Live cloud satellite | Watch the clouds move in from space. | Claude, from astrospheric | NASA GIBS imagery; could also be a Map layer |
| 11 | Phone sky view | Hold up your phone and see what you're looking at. | User (AR) | Phone compass and tilt plus our catalog; shares the star chart's drawing |
| 12 | Photo star finder | Share a night photo and we'll name what's in it. | User | astrometry.net's free service; the photo is uploaded to their server, so the page must say so |
| 13 | Solar system view | See where the planets are around the Sun. | Claude, from in-the-sky | |
| 14 | Sunset forecast | Will tonight's sunset be a colorful one? | User (wildcard) | From cloud layers; rough |
| 15 | Moonbow chances | A rainbow by moonlight. Rare, but here's when to look. | User (wildcard) | Bright low Moon plus rain on the opposite side; rough |

Not tools: wind belongs on Tonight (Starling already downloads it), and notifications need a back-end.



## Proposed by Claude (the user can change these)

- **Cards:** solid rounded cards on the softened palette, separated by fill only (no borders or shadows), the same radius as Tonight's tiles. Ready tiles get Tonight's gentle press animation; coming soon tiles don't move.
- **Grid:** 3 across on wide screens, 2 on tablets, 1 on phones, inside the header's 1120px column like every other page.
- **Top of the page:** a Fraunces "Sky tools" title and one friendly sentence, for example "Handy tools for planning your night out!"
- **Coming soon look:** the picture block uses a quiet surface color, the label is real text in mist, and the tile is not a link, so keyboard users never tab onto a dead end. The tiles stay in a list so screen readers hear every tool, ready or not.
- **Scenes:** each scene is decorative (`aria-hidden`) because the name and line already say what the tool is. Scenes use theme tokens, so red light works for free, and they stay still with reduced motion.
- **Home door:** change "Moon phases, sky map and more" to "Space station, aurora and more", since Moon phases live on Tonight.
- **Order:** ready tiles first, then coming soon tiles in build order. If 16 identical "Coming soon" tiles feel repetitive once seen, the next step is a "Coming soon" heading over a second grid.
- **Files:** `src/pages/Tools.jsx` + `Tools.css` replace the Placeholder route; scenes live in `src/components/tools/`.



## Calendar gaps found along the way

Separate work, saved in `2026-11-26-calendar-ideas-notes.md`.

Compared with astrospheric.com, Starling already covers clouds, transparency, seeing, smoke/haze, dew, temperature, Moon and rise/set times. The gaps are covered by tools above (satellite clouds, sky map, aurora, passes), plus wind on Tonight and notifications later.



## Left to the builder

Exact tile sizes and picture height, the placeholder colors, the intro sentence wording (user edits copy), and the first scene, which is designed with the space station tool.
