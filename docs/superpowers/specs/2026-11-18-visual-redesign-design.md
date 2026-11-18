# Visual Redesign — Design

Date: 2026-11-18
Status: Draft for review
Mockups: `mockups/palettes.html` (option 4), `mockups/directions.html` (direction C, rounded Nunito, soft Fraunces), `mockups/living-sky.html`
References: `imo.net`, Stellarium Web, Apple Weather, Finch (notes in memory, screenshots shared in chat)

## Goal

Make Starling look and feel like the user's vision: **organized and made with care, curious and playful like Finch, calm in color, and clearly competent at its job.** Above all it must read as a website for watching the night sky, even in daytime.

Success looks like:

- The home page and Tonight page open with *your* sky meeting *your* ground, showing tonight's real conditions as a picture.
- Below the horizon, everything is calm, contained and useful: real information, not descriptions of Starling.
- The new home page is liked even more than the original. Beautiful pieces we built are kept in better roles; only filler goes.
- Every visual is also said in words, contrast stays at or above 4.5:1 for text, motion respects the existing animation toggle and reduced-motion setting.

## Decisions

| Area | Decision |
|---|---|
| Palette | Today's hues about 15% less saturated (option 4). Values below. |
| Shapes | Solid rounded boxes, separated by fill color only. **No outlines.** No glass. |
| Body font | **Nunito** (rounded), replacing Nunito Sans. |
| Heading font | **Fraunces** with `font-variation-settings: 'SOFT' 100` for headings, verdicts and the wordmark. |
| Sky band | **Only the home page and Tonight.** Every other page focuses on its own content (new palette and fonts only). |
| Home sky | Tall, the most decorative part of the site: a regular clear night sky (stars, twinkles, rare meteors, the Moon in tonight's phase with its soft glow), layered hills, pines, a tiny starling. **Always night; it does not change with conditions** (changed 2026-11-18 after review of the build). |
| Tonight sky | A shorter band showing **tonight** at the chosen time, never daytime. |
| Sky conditions now | Time of night (twilight colors), clouds (flat, Finch-style, drifting slowly), moonlight (sky lifts, faint stars fade). |
| Sky conditions later | Haze and light pollution (with a user toggle so city users still see a full sky), the Milky Way for very dark places, auroras when visible (Phase 4, reusing `Aurora`), meteors during active showers (reusing `Meteors`). |
| Labels in the sky | None. No planet dots or names. The sky is a picture; information lives in the cards below. |
| Daytime | Not shown on any page for now. Only Tonight's band changes with conditions, and it always shows tonight. |
| Finch touches | Illustrated icons in soft rounded wells, pressable buttons with a darker bottom edge, grouped lists with chevrons. |
| Apple Weather touches | Tiles with a big value, one plain line, one small picture, opening into details; a one-sentence summary above the hours; key moments inside the hourly row; range bars for upcoming nights. Sentence-case labels, not ALL CAPS. |
| Level badges | Only where difficulty really matters (for example deep-sky objects), never on everything. |
| Row dividers | Soft solid lines in `--raised`, as in the approved directions mockup. |
| Removed ideas | The "tonight strip" at the top of every page, and wavy section dividers. |

### Palette (`src/styles/theme.css`)

| Token | Old | New |
|---|---|---|
| `--zenith` | #0b0d2b | #0d0f28 |
| `--high` | #131744 | #171a40 |
| `--raised` | (new) | #1f2350 |
| `--horizon` | #221c58 | #241f53 |
| `--far-hills` | #2e2570 | #31296a |
| `--snow` | #b8a9ea | #b9ade4 |
| `--snow-shade` | #9f8edc | #a093d4 |
| `--ink` | #1a1645 | #1a1645 |
| `--frost` | #eef0ff | #eef0fb |
| `--mist` | #b3b5e0 | #b4b6dc |
| `--teal` | #4cc3b0 | #55bcab |
| `--bronze` | #dba862 | #d6a866 |
| `--beak` | #f5cf4f | #f1cd57 |
| `--moon` | #f6ead0 | #f6ead0 |
| `--moon-dark` | #2e2a66 | #302c60 |

Red light keeps its own token set; `--raised` gets a red value too. The Tonight-only panel tokens from Phase 3 (`--panel`, `--panel-raised`, `--rule`, `--track`) are replaced by `--high` and `--raised`.

### Shape and type scale

- Radii: cards 30px, tiles 26px, icon wells 18px, pressable buttons 18px, small pills 999px.
- Pressable button: solid fill, `box-shadow: 0 5px 0 <darker shade>`, pressing moves it down 4px.
- Icon well: 52px square, `--raised` fill, illustrated icon about 30px.
- Fonts load from Google Fonts: `Fraunces:opsz,wght,SOFT@9..144,400..600,0..100` and `Nunito:wght@400;600;700;800;900`.

## The living sky

A pure function decides how the sky looks, so it can be tested and reused by both pages:

`skyLook({ sunAlt, moonAlt, moonLit, cloudCover, isHome })` returns:

- `phase`: `'day' | 'dusk' | 'night'` (`day` when the Sun is above 0°, `dusk` between 0° and −12°, `night` below −12°). `day` is only possible when `isHome`; Tonight never asks for a daytime time.
- `colors`: top, middle and horizon colors for the sky gradient (the six approved looks: clear, moonlit, patchy, overcast, dusk, day).
- `stars`: a 0–1 amount (1 on a clear dark night, lower in moonlight and twilight, 0 when overcast or daytime).
- `clouds`: 0 none, 1 a few, 2 patchy, 3 overcast (from cloud cover under 15, under 40, under 75, otherwise).
- `moon`: shown when above the horizon, with a halo when over 60% lit.
- `sun`: shown in daytime.
- `snow`: the ground tint (brighter under a bright Moon, dimmer when overcast).

Without a forecast, `cloudCover` is `null` and the sky shows no clouds.

## Shared pieces

| Piece | Job |
|---|---|
| `src/sky/skyLook.js` | The function above. |
| `src/components/sky/SkyScene.jsx` | Draws the sky for a `look`: gradient, stars (using the existing star-field logic that keeps stars off text), Moon or Sun, clouds, and the ground. Props: `look`, `size` (`'tall'` or `'band'`), `children` (the text that sits in the sky). |
| `src/components/sky/Ground.jsx` | Layered hills, snowfield, pines, and on the tall size a tiny starling on the tallest pine. |
| `src/components/sky/Moon.jsx` | The Moon in its real phase, with the soft halo from the original hero. |
| `src/components/sky/Clouds.jsx` | Flat clouds for levels 1–3; slow drift that stops with the animation toggle or reduced motion. |
| `src/components/ui/Card.jsx`, `IconWell.jsx`, `PressButton.jsx` | The Finch-style building blocks. |
| `src/components/ui/icons.jsx` | Illustrated icons: Moon, meteor, calendar, pine, constellation, telescope, planets and deep-sky kinds. |

## Home page

Top to bottom:

1. **Header** over the sky (logo, Tonight, Calendar, Map, Learn, Tools, place pill). Tools goes to a placeholder for now.
2. **Tall sky scene** showing the sky right now: "Meet tonight's sky", one line ("See what's up there tonight, right where you're standing. Just look up!"), and the pressable "See tonight's sky" button. In daytime, a second line points to tonight.
3. **Tonight in {place}** card: the real verdict, three facts (Moon % lit, fully dark time, outside temperature), and an "Open Tonight" button. Uses the existing `useNight` and weather.
4. **Coming up** card: the next three events within 30 days, each with an icon well, name, one plain line and the date in bronze, linking to the Calendar. Events come from real data: meteor shower peaks (`src/sky/catalog/showers.js`) and Moon phases (astronomy-engine `SearchMoonQuarter`).
5. **Three doors**: Find dark skies (Map), this month's constellation (Learn, with Cassiopeia's W as its icon), Sky tools (Tools).
6. **Footer** in the new fonts.

### Kept from the original, in new roles

- The glowing Moon: drawn in the sky in its real phase, keeping its halo.
- The aurora ribbons (`Aurora`): kept for the "aurora visible" condition in Phase 4. Not shown until then.
- The colorful meteors (`Meteors`): kept for the "active meteor shower" condition. Not shown until then.
- Twinkling stars and sparkles: inside the sky, gently.
- The snowfield, hills and pine: they become the ground.
- Cassiopeia's W: the icon for the constellation door, and later the Learn page.
- Teal and bronze accents: in icons and highlights.

### Removed

`TonightPreview` ("Know when to look"), `CalendarPreview` (and its unlabeled countdown bars), `MapPreview`, `LearnPreview`, the "How Starling helps" link, the wavy section edges, and the old `Hero`. Their descriptions of Starling can move to the About page later if wanted.

## Tonight page (part 2, its own plan)

Same sky component as a band showing tonight at the chosen time, then: a summary card with one sentence and the hour-by-hour row (key moments like Fully dark and Moonset highlighted), four tiles (Moon, Darkness, Clouds, Seeing) that open into details, the next 7 nights with range bars, and "Up tonight" as a grouped list with "See all". The detailed almanac from Phase 3 (time slider, sky map, full object lists) moves behind "See all" so the main page stays calm.

## Other pages (part 3, its own plan)

About, Credits, Contact, the "lost in space" page and the location window get the new palette, fonts, shapes and buttons, but no sky band.

## Accessibility

- Skies are decorative (`aria-hidden`); every condition is also in the verdict or the cards.
- Text on any sky color, including the daytime blue, meets 4.5:1 (large headings at least 3:1); checked for each of the six looks.
- Clouds, twinkles and button presses respect the existing animation toggle and `prefers-reduced-motion`.
- Pressable buttons and doors are real links or buttons with visible focus, at least 44px tall.

## Build order

1. **Foundation and home page** (this spec's first plan): tokens and fonts, `skyLook`, the sky components, the UI building blocks, header and footer restyle, the new home page, removal of the old home sections.
2. **Tonight** in the new layout (second plan).
3. **Other pages** (third plan).

## Testing

- `skyLook`: each phase boundary, cloud levels, star amount under a bright Moon, no clouds without a forecast, never `day` when `isHome` is false.
- Coming-up events: the next Moon phases and shower peaks in date order, limited to 30 days and three items.
- In the browser: the home page at desktop and 375px, all six sky looks (forced through a development-only query parameter, `?sky=clear|moonlit|patchy|overcast|dusk|day`), keyboard focus, the animation toggle, and contrast for each look.

## Out of scope

Automatic location detection, haze and light pollution, the Milky Way, live auroras and meteors, the Tools page itself, and the Calendar, Map and Learn pages.
