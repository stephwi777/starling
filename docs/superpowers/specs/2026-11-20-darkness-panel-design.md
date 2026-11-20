# Darkness tile and panel design

Date: 2026-11-20
Mockup approved: `.superpowers/brainstorm/60773-1795145333/content/darkness-v3.html`, version B (Sun and Moon)

## Why

The Darkness tile's curve looks wonky:
- it draws the Sun going *up* as it sinks
- it squashes the deepest part flat with a tanh curve
- it only covers sunset to sunrise

The user wants a neat, accurate curve on the tile, like Apple Weather's Sunrise tile, and the detailed version in a panel. Stargazers also need to know when the Moon washes out the dark, so the panel shows "truly dark" time: fully dark with the Moon down.

## Goals

- **Tile curve:** the Sun's true altitude from noon to noon, drawn at linear scale.
  - The horizon is a dashed line, and below the line means below the horizon.
  - Colors: yellow while the Sun is up, lavender during twilight, teal when it's truly dark, cream when it's fully dark but the Moon is up.
  - A white dot marks now.
- **Tile words:** "6:34pm" and "Fully dark until 5:33am." stay. The third line becomes a Moon line (my call):
  - "Moon sets at 2:31am; truly dark after."
  - "Moon rises at 3:10am; truly dark until then."
  - "No Moon during the dark hours." (or the full-Moon case: "The Moon is up all night.")
  - The now dot still shows where tonight is.
- **Panel:** opens from the Darkness tile with the shared `Popover`, exactly like the Moon and Clouds panels.
  - **Night strip:** the same 8-night strip as Clouds (night before tonight → six nights ahead).
  - **Verdict:** a big truly-dark total ("3 hr") with "truly dark, 2:31am–5:33am".
    - Other cases: "No truly dark hours / the 97% lit Moon is up all night", "No full dark / twilight all night", "No night / the Sun doesn't set".
  - **Chart:**
    - the Sun's path from noon to noon over sky bands that darken for day, civil, nautical and astronomical twilight, and full dark
    - a solid "Horizon" line and a dashed teal "Fully dark below" line at −18°
    - dashed guides at 6pm, midnight and 6am
  - **Moon lane** under the chart: a cream "Moon up · 77% lit" bar where the Moon is above the horizon.
  - **Key:** Truly dark, Moon up, Twilight, Day.
  - **Picking a time:** tap or drag on the chart. A yellow line marks the chosen time, and a line below reads like "9:30pm · Fully dark, Moon up · Sun 51° below the horizon".
  - **Rows:**
    - Sunset
    - Evening twilight (range, with "Civil … · Nautical …")
    - Fully dark (range, plus hours)
    - Moon (% lit, plus "up since … · sets …" or "rises … · sets …")
    - Truly dark (range(s), plus hours)
    - Morning twilight (range, with "Nautical … · Civil …")
    - Sunrise
  - **Note:** "Why does the Moon matter?"

## Non-goals

- Moon phase detail (that's the Moon panel).
- Light pollution and Bortle class. They belong to a future location feature.
- Year-long averages like Apple's "Sunrise and Sunset Averages" (that's the Calendar page).

## Anti-goals

- Any squashing or flipping that makes the curve less true.
- Changing the Moon or Clouds panels' look.

## Approaches

1. **Reuse the Clouds panel pieces (picked).**
   - Move `NightStrip` and its CSS into `src/components/panel/`, and `panelNights` into its own module, so Darkness and Clouds share them.
   - Add a new `src/sky/darkPanel.js` for curve samples, truly-dark windows and words.
   - Redraw the tile curve from the same samples.
2. **Build the Darkness panel separately.** It would copy the strip and night list a third time.
3. **Draw the chart with a charting library.** It adds a dependency for one curve, and the hand-drawn SVG already matches the other panels.

There's really one sensible way: the shell and strip already exist and are approved.

## Calculations (my calls)

- **Samples:** Sun and Moon altitude every 10 minutes from local noon to the next noon (145 samples), with refraction, like the rest of the site.
- **Event times:** exact, from astronomy-engine (`SearchRiseSet` for sunrise, sunset, moonrise and moonset; `SearchAltitude` at −6°, −12° and −18°), shown with `clock()`.
- **Truly dark:** the Sun is below −18° and the Moon is below the horizon. Window edges use the exact event times (astronomical dusk and dawn, moonrise and moonset). There can be two windows on one night: one before moonrise and one after moonset. The total adds them up.
- **Moon % lit:** measured at local midnight, the same as the Moon tile.
- **Chart scale:** linear and shared across the 8 nights, so switching nights doesn't rescale. It runs from 5° above the highest Sun to 5° below the lowest. The tile uses its own night's range.
- **Picking a time:**
  - steps are 10 minutes
  - ← and → move 10 minutes; with Shift, an hour
  - Page Up and Page Down change night
  - Home and End jump to noon at each end
  - it opens at now on tonight; other nights keep the same time of night
- **Accessibility:** the chart is role="slider", with aria-valuetext matching the line under it. The Moon lane and key are hidden from screen readers because the rows say the same thing.

## Left to the builder

File names inside `src/components/darkness/`, how samples are cached, and CSS class names, all within the site's code style.
