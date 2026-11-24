# Tonight's living sky

Agreed in conversation 2026-11-23. Every look below (1–22, no 13) was reviewed and approved by the user in the mockup `mockups/sky-looks.html` (+ `sky-looks.jsx`), on desktop, at phone size and in red light. That sheet is the visual source of truth; numbers like "look 8" refer to it.

## Intent

The sky band at the top of the Tonight page should show tonight's real conditions instead of the same clear night every time: clouds, a bright Moon, twilight, rain and snow. It's a picture, not a chart: no labels or planet dots, and the words below it (the sentence under the place name and the cards) carry the facts. It continues the "living sky" direction from 2026-11-18 (`visual-direction` notes) and the approved `mockups/living-sky.html`.

## Goals

- Tonight's sky band picks one of the 19 approved looks from real data and draws it exactly as approved.
- It looks right on desktop, on phones and in red light.
- It changes softly when the moment it shows changes while the page is open.

## Non-goals

- **Home's sky does not change at all.** Home keeps its fixed clear night (`nightLook`), its Moon glow and its layout. The user said explicitly: only Tonight's sky changes.
- No clouds drifting across the screen yet. The user wants to explore that later, after this static version.
- No haze, light pollution, aurora, meteors or Milky Way in the sky band (later phases).
- No daytime sky on Tonight. Tonight always shows tonight.

## Anti-goals

- Any visible change to Home (sky, Moon, stars, hills, sentence).
- Repeated identical cloud shapes, clouds crowding the words, or flat cloud bottoms floating in mid-sky.
- Snow that reads as stars, or rain that cuts off at a hard line.

## Constraints

- **Accessibility first:** the sky is decorative (`aria-hidden`); everything it shows is also said in words on the page. Motion stops for `prefers-reduced-motion` and pauses with the site's Pause animations switch (`.still` class). Words must stay readable over every look.
- **Red light:** every new color needs a red value in `theme.css` under `:root[data-light="red"]`, hand-tuned like the other sky colors. `theme.test.js` checks that sky looks resolve to theme colors in both modes.
- **Readable words:** the date (`--mist`) and sentence (`--frost`) keep at least 4.5:1 contrast against whatever sits behind them. The reviewer measured the date at 4.48:1 over twilight cloud-1 and 4.12:1 over twilight cloud-2. If at real band sizes (including long place names) a cloud sits behind the date, move that cloud away from the words rather than changing an approved color or adding a text shadow, and show the user the change. *(My call.)*
- **Code style:** the user's preferences (section headers, blank-line spacing, no other comments, minimal classes). The user reviews every line, so keep it plain.
- **Shared pieces:** build this by growing the shared sky pieces (`SkyScene`, `skyLook.js`, `Clouds.jsx`), not by copying them. Only the sky uses the cloud, moonlit, overcast and dusk colors and the look picker today (checked), so changing those is safe for Home as long as Home keeps asking for its clear night.
- `shortVerdict` in `best.js` is also used by Home (`useSummary.js`). Don't change its output.

## Approaches considered

1. **Grow the shared sky (picked by the user).** `skyLook.js` learns the new rules, a new small helper picks the moment and its conditions, `Clouds.jsx` gets the new cloud shapes and layouts, a new falling rain/snow piece, and the new colors go in `theme.css`. Home keeps asking for its clear night, so it doesn't change.
2. **A separate Tonight-only sky.** Leaves Home's code untouched, but copies most of the sky code, and the two would drift apart. Rejected for the repetition.

In both, the mockup's helper code (text measuring, sampled cloud outlines, container units) is rewritten cleanly, not copied.

## Which moment the sky shows

- **From sunset to sunrise:** right now, including the dusk glow after sunset and the dawn glow before sunrise.
- **Any other time** (after sunrise, before sunset): the start of full darkness tonight (`night.astroDusk`).
- **No full darkness tonight** (far north in summer): between sunset and sunrise, right now; at any other time, the darkest moment of the night (lowest Sun). On these nights the sky **always uses the evening twilight (dusk) colors**, even when the Sun dips below −12° and even after midnight. That matches the approved look 19. *(My call, from the reviewer's question: around 50–55°N in June the Sun reaches −13° to −17°, which the −12° rule alone would call night.)*
- **No sunset at all** (midnight sun): the darkest moment, dusk colors. **No sunrise at all** (polar night): right now, night look. *(My call.)*
- The moment is re-checked as `now` ticks (`useNow`, every 10 minutes). When the look changes, the sky fades to the new look over about 2 seconds; instantly with reduced motion.

The look for that moment uses:

- **Sun altitude** at the moment → night, dusk/dawn twilight (Sun above −12°).
- **Cloud cover** at the moment's hour (the forecast hour that contains it).
- **Rain chance and rain/snow kind** at that hour: wet when the rain chance is 50% or more, rain or snow by the existing `fallOf` rule in `weather.js` (the same rule as the hourly row).
- **The Moon:** shown only when it is above the horizon at the moment, drawn in its real phase at that moment (not at midnight). Lit fraction > 60% counts as a bright Moon.
- **No forecast** (loading or failed): clear night with the real Moon; no guessed clouds.

## The looks

Names match `skyLook` names. "Level" is the cloud level from cover: under 15% none, 15–39% a few (1), 40–74% patchy (2), 75%+ cloudy (3).

| # | Look | When | What it shows |
|---|---|---|---|
| 1 | Clear | night, cover < 15%, Moon down or ≤ 60% lit | clear sky, all stars |
| 2–3 | Clear with crescent / half Moon | same, Moon up | Moon without its glow, all stars |
| 4 | Moonlit | night, clear, Moon up and > 60% lit | moonlit sky (only slightly brighter), Moon with glow, stars at `1 − lit × 0.25` |
| 5–6 | A few clouds | level 1 | two clouds (below) |
| 7–8 | Patchy | level 2 (wins over moonlit) | four clouds desktop, cluster on phones (below); stars × 0.6 |
| 9–10 | Cloudy | level 3 | huge clouds over a starless two-color gradient; **Moon hidden** |
| 11, 12, 14 | Rain / snow | wet hour (any cover) | cloudy look + falling rain or snow; Moon hidden |
| 15 | Evening twilight | Sun above −12°, evening | existing dusk look |
| 16 | Evening twilight with clouds | dusk + level 1 or 2 | dusk with twilight cloud colors |
| 17 | Morning twilight | Sun above −12°, morning | new **dawn** colors, a touch warmer than dusk |
| 18 | Morning twilight with clouds | dawn + level 1 or 2 | dawn with twilight cloud colors |
| 19 | Never fully dark | no astro dusk | the twilight look at the darkest moment |
| 20 | No forecast | forecast loading/failed | clear night with the real Moon |
| 21 | Evening twilight, cloudy | dusk + level 3, or dusk + wet hour | the cloudy huge clouds in twilight shades over the dusk colors, a soft glow under them near the hills; Moon hidden; rain/snow falls over it when wet |
| 22 | Morning twilight, cloudy | dawn + level 3, or dawn + wet hour | the same with the dawn colors |

Twilight (dusk or dawn) with cloud level 3 or a wet hour shows cloudy twilight (21 or 22), not the cloudy night look: under heavy cloud the horizon still glows a little. Stars are 0 and the Moon is hidden, as on cloudy nights. "Morning" means the moment is after local midnight of the night (except on never-fully-dark nights, below).

Look 13 was a rejected snow idea; there is no look 13.

## Colors

All in `theme.css`. Values in **bold** are new or changed; others exist already.

| Token | Normal | Red light |
|---|---|---|
| `--moonlit-top` | **#0c1030** | **#120403** |
| `--moonlit-middle` | **#171c48** | **#1e0705** |
| `--moonlit-low` | **#312d6c** | **#350d08** |
| `--snow-moonlit` | **#bdb2e8** | **#e2513a** |
| `--overcast-top` | **#141631** | **#120403** |
| `--overcast-low` | **#3b3670** | **#340d08** |
| `--cloud-1` | **#24234f** | **#2a0a06** |
| `--cloud-2` | **#2c2a5c** | **#330c08** |
| `--cloud-3` | **#34316a** | **#3c0f0a** |
| `--cloud-4` | **#3c3874** | **#45110b** |
| `--cloud-front` (new) | **#44407e** | **#4e140d** |
| `--dawn-top` (new) | **#15173f** | **#1c0604** |
| `--dawn-middle` (new) | **#45397f** | **#3e100a** |
| `--dawn-low` (new) | **#bb8592** | **#661a10** |
| `--snow-dawn` (new) | **#cbb5dc** | **#cf4d37** |

- **Cloudy gradient:** two colors only, `--overcast-top` to `--overcast-low`; the middle stop is the even mix of the two (`color-mix`). `--overcast-middle` is no longer used by the sky.
- **Twilight clouds** (dusk and dawn looks) use their own shades so they stay visible against the glowing sky: light up high, dark near the horizon.

| Twilight cloud shade | Normal | Red light |
|---|---|---|
| cloud-1 | #4a4088 | #4a120c |
| cloud-2 | #50458f | #52150e |
| cloud-3 | #29235b | #260906 |
| cloud-4 | #2d2762 | #2a0a07 |
| deep (phone only) | #1b1745 | #1c0604 |
| low (phone only) | = twilight cloud-2 | #2a0a07 |

  Outside twilight, "deep" = cloud-3 and "low" = cloud-2.

- **Cloudy twilight (21, 22)** uses the twilight cloud shades above, except twilight cloud-2 is **#463c82** in normal light, because the date line always sits over a back cloud there and #50458f gave only 4.12:1 (#463c82 gives 4.78:1). Red light keeps #52150e (4.55:1).
- **Twilight glow under the clouds (21, 22):** over the clouds and behind the hills, a vertical gradient from transparent at 45% of the band height to the sky's low color (`--dusk-low` or `--dawn-low`) at 55% strength at the bottom.

## Clouds

### Shapes

Five shapes, each a list of bumps `[cx, cy, r]` in a 200 × 72 box, flat bottom at y = 70:

```
wide:  [38,54,16] [66,42,24] [104,34,30] [142,44,22] [170,56,14]
tall:  [44,52,18] [84,32,30] [122,46,22] [152,58,12]
long:  [33,60,10] [52,52,16] [84,46,20] [118,50,18] [146,54,16] [164,60,10]
hump:  [51,55,15] [80,52,18] [120,38,26] [152,54,16]
small: [54,56,14] [86,44,22] [116,56,14]
```

Each cloud is drawn as **one solid outline**: the top edge follows the highest bump at each x; everything below it is filled down to the flat bottom; the first and last bumps curve down into the bottom (their bottoms touch y = 70). This is what removed the holes, pockets and seams the user found when clouds were stacked circles. Clouds may be flipped left-right. How the outline is computed (precomputed path data, sampled or exact arcs) is the builder's call, but the silhouette must match the mockup.

### Layouts

Positions are percentages of the sky band (`x` = left, `y` = top, `w` = width; height follows the 200 × 72 shape). Shade numbers: 0–3 = cloud-1…4, 4 = front, 5 = deep, 6 = low.

**"Moon cloud"** = a cloud positioned relative to the Moon, not the band, so it keeps the same relation to the Moon at every width. Its offsets are in px from the Moon's box: `right` = distance from the Moon box's right edge to the cloud's right edge (positive = further left), `top` = from the Moon box's top. The Moon box is 54 px at `top: 96px; right: 12%` on desktop, and 40 px at `bottom: ground + 12px; right: 12%` on phones (SkyScene's existing Moon position). The Moon cloud is still drawn when the Moon is down.

**Desktop (above 700 px):**

| Level | Cloud | Shape | Position | Width | Shade |
|---|---|---|---|---|---|
| 1 | Moon cloud | wide | right 10, top 16 | 22% | 1 |
| 1 | left | hump, flipped | x 10, y 47 | 17% | 2 |
| 2 | top left | hump | x 5, y 3 | 36% | 0 |
| 2 | Moon cloud | wide | right −64, top −16 | 34% | 1 |
| 2 | low left | long, flipped | x −1, y 31 | 35% | 2 |
| 2 | low right | small | x 78, y 42 | 25% | 3 |
| 3 | back left | tall | x −12, y 11 | 64% | 1 |
| 3 | back right | wide, flipped | x 42, y 6 | 70% | 1 |
| 3 | front left | long, flipped | x −6, y 25 | 66% | 2 |
| 3 | front right | hump | x 52, y 24 | 58% | 2 |

(Moon-cloud `top` values here are relative to the Moon box top; in the mockup they were written as absolute 112 and 80 px.) In look 8 the patchy Moon cloud covers about 30% of the Moon; the user kept that.

**Phones (700 px and below):**

| Level | Cloud | Shape | Position | Width | Shade |
|---|---|---|---|---|---|
| 1 | Moon cloud | wide | right 46, top 2 | 40% | 6 |
| 1 | top left | hump, flipped | x 4, y 20 | 36% | 5 |
| 2 | cluster back | wide | x 34, y 2 | 70% | 0 |
| 2 | cluster right | hump | x 54, y 15 | 50% | 1 |
| 2 | cluster left | small | x 22, y 20 | 30% | 1 |
| 2 | low left | long, flipped | x −16, y 62 | 58% | 2 |
| 3 | same as desktop, see below | | | | |

On phones level 2 has **no Moon cloud** (the user picked "top-right cluster" from five options). The level 1 Moon cloud sits just left of the Moon with a gap, because the half Moon's dark side blended into it.

**Cloudy (level 3, including cloudy twilight 21–22) at any width:** the four huge clouds are laid out on a 1132 × 420 canvas (the desktop band's shape). The canvas is scaled to cover the band: its height matches the band height, its width is `max(band width, band height × 1132 / 420)`, centered, aligned to the bottom, and cropped at the sides. This keeps every huge cloud's flat bottom tucked behind another cloud or the hills at every width.

### Layering

From back to front: sky gradient, stars, Moon, clouds (clouds overlap the Moon), hills, falling rain/snow (in front of the hills, faded out at the bottom as described below), words.

## Rain and snow

- Shown only when the moment's hour is wet; always with the cloudy look; the Moon is hidden.
- **Rain:** 52 drops in the rain icon's drop shape (`DROP` path from `icons.jsx`), `--star-blue` at 80% opacity, 5–9 px wide, each falling top to bottom in 1.2–1.8 s, spread evenly across the width, with random start offsets so it never looks like it starts at once.
- **Snow:** 42 six-armed flakes in the snow icon's flake shape (`FLAKE` path), `--frost` stroke 1.2, 10–14 px, falling in 9–14 s, swaying ±6 px over 3 s and turning slowly (60° every 11 s; six arms make it loop with no jump). Round flakes were rejected because they read as stars.
- **In front of the clouds and hills, behind the words.** They fade out softly around the words (an oval around the place name, date and sentence) and fade out at the bottom: fully visible down to about 10 px above the top of the hills, gone by about 45 px below it. They never hide behind the hills or stop at a hard line.
- **Reduced motion / Pause animations:** nothing moves; the drops and flakes stay where they are as a still scatter.
- Positions and timings come from a fixed seed, so the scatter is the same every visit. How the "around the words" fade finds the words (measuring them, or a fixed oval per layout) is the builder's call, as long as long place names and two-line sentences stay clear.

## What's left to the builder

- Where the moment-picking helper lives and what it's called (a pure function in `src/sky/` with tests, like the other sky files, fits the project).
- How `skyLook` grows: new inputs (wet/fall kind, morning) and outputs (dawn name or a twilight flag, level, Moon hidden). Home's `nightLook` output must stay identical; add a test that locks it.
- How phone vs desktop layouts switch (CSS at the 700 px breakpoint, matching SkyScene's existing Moon move, is the natural fit).
- The fade between looks (crossfading two layers, or fading color tokens and clouds).
- A dev-only `?sky=` preview on Tonight that can show each look (1–20 minus 13), like the mockup sheet, for checking without waiting for weather.
- Updating `theme.test.js` for the new tokens and keeping its contrast checks green.
- Removing the rain-snow and sky-looks mockups is **not** part of this; they stay as references.

## The sentence under the place name

Decided by the user: on Tonight, the sentence mentions rain and snow, so the picture and the words agree. **Home's sentence does not change**: `shortVerdict` stays as it is and Tonight gets its own sentence helper on top of it.

- **No wet hours tonight:** the sentence is exactly `shortVerdict` as today.
- **Wet hours** use the same detection and words as the hours card's `fallSentence` (`hours.js`): "Rain", "Snow" or "Rain and snow", wet = rain chance 50% or more over the night's whole hours.
  - Wet all night: "Rain likely all night."
  - Wet first, then a clear dark stretch after it: "Rain likely until 2am, then clear and dark until 5:40am."
  - A clear dark stretch first, then wet: "Clear and dark until 11pm, then rain likely."
  - Anything else (on and off, or no clear dark stretch): the `fallSentence` wording, e.g. "Rain likely 9pm–2am." or "Snow on and off 9pm–2am."
- Times use the same clock words as the rest of the page ("midnight", "2am"). No jokes like "Stay in and stay warm!".
- The exact edge cases (one wet hour, a wet hour at dusk only, the clear stretch being twilight-only) are the builder's call within these patterns, with tests in the style of `hours.test.js`.
- The hours card's sentence stays as it is.
