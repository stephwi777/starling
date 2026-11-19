# Tonight: Moon Tile

Part 2 of the visual redesign makes the mockup Tonight page real one component at a time. The Moon tile is first.

## Why

Someone heading outside should know at a glance how bright the Moon is, when it gets out of the way, and when the next full Moon is.

## Goals

- The tile shows real data for the visitor's place and tonight's night.
- Brightness is said plainly as the percent lit.
- Moonset (or whatever the Moon does tonight) and the next full Moon, each on its own line.

## Non-goals

- The tile does not open into details yet. That is designed once all four tiles are real, so they open the same way.
- The other tiles, the hours card, the nights list, Up tonight and the sky band stay as mockup samples for now.
- No phase name on the tile (the drawing shows the shape).
- No sentence explaining what the brightness means; the user prefers the plain percent.

## Approaches

1. **Reuse the night data the site already computes (chosen).** `useNight` already tracks the Moon from sunset to sunrise in 10-minute steps and knows how lit it is. New small helpers turn that into words.
2. Search the Moon's rise and set with astronomy-engine directly in the tile. Rejected: duplicates what `useNight` does and puts sky math in a component.

## The tile

Wider than 700px, text on the left and the Moon on the right:

```
Moon
53% lit                (phase drawing)
Sets at 12:40am
Full Nov 24
```

700px and narrower, stacked: heading, drawing, percent, then the two lines. The drawing is mirrored in the southern hemisphere.

**Timing line**, between sunset and sunrise:

- Up at sunset and sets during the night: "Sets at 12:40am"
- Down at sunset and rises during the night: "Rises at 10:15pm"
- Rises and sets during the night: "Up 7:10pm to 2:30am"
- Up the whole time: "Up all night"
- Down the whole time: "Not up tonight"

On its own line below, the next full Moon: "Full tonight!" when it falls within this night's day (noon to noon in the place's time zone), otherwise "Full Nov 24".

## Builder's calls

- Helpers live in a new `src/sky/moon.js` with tests, following the other `src/sky` files.
- The page starts calling `usePlace` and `useNight` for tonight so the tile can read them.
- The › arrow is removed from the Moon tile only, since it doesn't open.

## Accessibility

The drawing stays decorative; everything it shows is also in words. Text stays at the existing tile sizes and contrast.
