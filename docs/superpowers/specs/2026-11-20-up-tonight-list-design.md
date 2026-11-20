# Up tonight list design

Date: 2026-11-20
Mockup approved: `.superpowers/brainstorm/70819-1795208114/content/up-tonight-v3.html` (from `scratchpad/up.template.html`)

## Why

The Up tonight card shows 4 picks and says "4 of 499", but nothing opens. The user chose the list's purpose: **pick what to see tonight**, answering "what should I look at, and when?" Browsing the whole catalog belongs to the future Learn page.

## Goals

- **Opening:** the whole Up tonight card opens a list in the shared `Popover`. On wide screens it sits beside the card, and on phones it's the full-screen sheet. Its route is `/tonight/up` and the page title is "Up tonight | Starling".
- **Top line:** a count for the chosen gear, like "341 things to see with binoculars".
- **Gear switch:** Eyes, Binoculars, Telescope. Each one includes everything the simpler gear can see. Glyphs:
  - Eyes: the original eye, slightly taller.
  - Binoculars: the solid silhouette from the user's reference, with the lens gap filled.
  - Telescope: unchanged.
- **Type chips:**
  - All, Moon & planets, Stars, Constellations, Deep sky, Meteors.
  - The row scrolls sideways. Its edges fade, and round arrows appear when there's more to scroll.
  - Tapping a chip never moves the row back to the start. It only slides that chip into view.
- **Search:** "Find a star, planet or nebula" matches names.
- **Groups** follow the night:
  - **Up now:** at least 10° up at the reference time. Objects still up but past their best read "Low in the west, setting soon" and sort last. Objects that have already set are left out.
  - **Later tonight:** best before 2am local.
  - **Before dawn:** best from 2am until dawn.
  - Up now starts open; the others start folded. Group headings are buttons with a chevron. Opening springs the rows in with a slight overshoot, and closing folds smoothly. With reduced motion turned on, groups open and close instantly.
- **Rows:**
  - The approved `SkyIcon`, the name, where to look, and a gear glyph.
  - Up now notes: "4 fists up in the east-northeast now, highest at 2am".
  - Later notes: "5 fists up in the south at 2am".
  - Meteor notes: "About 60 an hour at 4am".
  - All meteor showers share one icon.
- **Sorting:** easiest first, using the existing `sortEasiest` (gear, then brightness, then height).
- **Show more:** each group shows 6, and "Show 10 more · N left" adds 10 at a time. "Show fewer" folds back to 6.
- **Empty messages:**
  - search: "Nothing called "X" is up tonight."
  - meteors: "No strong meteor showers tonight. The [next shower] peaks on [date]."
  - otherwise: "Nothing like that is up tonight. Try more gear."
- **Note:** "How do I measure 'fists'?"

## Non-goals

- Object detail pages. Rows don't open anything yet.
- Objects below the horizon all night, and browsing the full catalog.

## Approaches

1. **One pure function builds the list, and a panel draws it (picked).**
   - `upList(sky, now, timeZone)` lives in `src/sky/upList.js` and returns the groups with notes.
   - `UpTonightPanel.jsx` renders it, reusing `Popover`, `SkyIcon` and the panel styles.
2. **Extend `upTonight()`, which the card uses.** Its job is choosing 4 varied picks, and mixing in the grouping would tangle two purposes.
3. **Revive the old unused `ObjectList`.** It's built around the pre-redesign table layout and would need rewriting anyway.

## Details (my calls)

- **Reference time:** after dark, it's "now". Before the sky is dark enough (Sun above −12°), the list uses the moment it gets dark and the first group reads "Up at dark · 6:31pm" instead of "Up now · 9pm".
- **"2am" split:** 2am local on the night's date. For nights shorter than that (high latitudes in summer), the split is the middle of the dark hours.
- **Starting gear:** binoculars. This doesn't change the site-wide gear setting.
- **Popover placement:** placement currently looks for `.tile`; it will also accept `.card`. The card gets a full-card `TileLink`, like the tiles. The "4 of 499" text becomes "See all 499 ›".
- **Gear glyphs:** a new `GearGlyph` component in `src/components/sky-icons/`.
- **Accessibility:**
  - Chips are buttons with `aria-pressed`, and the gear switch is a radio group.
  - Group headings carry `aria-expanded`.
  - "Show more" moves focus to the first newly added row.
  - The arrow buttons are hidden from screen readers, since the chips are reachable by keyboard.

## Testing

- **`upList`:**
  - groups by the reference time
  - drops objects that have set
  - puts setting objects last in Up now
  - the 2am split
  - the before-dark wording
  - meteor rows
  - gear and type filtering
  - search matching
- **Browser:**
  - the card opens the list beside it, and as a sheet on phones
  - chips keep their scroll
  - "Show more" steps by 10
  - groups spring
  - the reduced-motion and red-light modes
