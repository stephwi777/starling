# Rain, snow and temperature on Tonight

Approved 2026-11-20 from mockups/outside-sheet.html.

## Why

People need to know what it is like outside before they go out: whether rain or snow will spoil the night, and how cold it will be. The Tonight layout (four tiles, hourly card, 7 nights, Up tonight) must not gain a new box.

## Approaches

- A new "Outside" tile or card: rejected, it breaks the 4 / 2×2 tile grid.
- Temperature in the sky band or only in the summary sentence: shown, not chosen.
- **Chosen:** fold it into what exists. Temperatures go in the hourly row, rain and snow show in the cloud bars and the hourly row.

## Design

- **Rain or snow per hour:** an hour is wet when the chance of precipitation is 50% or more. It is snow when the forecast has snowfall that hour or the temperature is at or below freezing; otherwise rain. Snowfall is one new forecast field.
- **Hourly row:** one line under each icon. Key moments (Sunset, Fully dark, Moonrise/set, Twilight, Sunrise) keep their word; every other hour shows its temperature (e.g. 38°). The sky word stays for screen readers ("Clear, 38°"). Wet hours use a Rain or Snow icon (cloud with two drops or flakes). Without a forecast, hours keep their word.
- **Summary sentence:** after the cloud sentence, "Rain likely 12am–2am." replaces the Moon/meteor sentence on wet nights.
- **Clouds tile:** a pale blue drop (or a small flake) floats above each wet bar; the tile's second line becomes the same rain sentence.
- **Clouds panel:** on wet hours the bar's cloud lifts a little and two small drops (or flakes) fall beneath it, matching the hourly row's icon. A wet hour gets the cloud even below 60% cover.
- Words always accompany the pictures; nothing relies on the drop alone.

## Left to the builder

Exact sizes and spacing of the drop and flake, matched to the mockup.
