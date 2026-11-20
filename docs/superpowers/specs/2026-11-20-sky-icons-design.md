# Sky icons design

Date: 2026-11-20
Icon sheet approved: `.superpowers/brainstorm/70819-1795208114/content/icons-v8.html` (built from `scratchpad/icons.template.html` and `icon-data.mjs`)

## Why

The user wanted every object in the new catalog to have an icon made with care before the Up tonight list is built. The sheet went through four review rounds and is approved. This doc covers moving those icons into the app.

## Goals

- One `SkyIcon` component that draws any catalog object exactly as the approved sheet shows:
  - each planet with its own look, and the Moon in its real phase
  - stars as a tinted sparkle sized by brightness
  - doubles in their real colors and spacing, with the Double Double and Trapezium drawn specially
  - constellation and pattern figures
  - galaxies by type and tilt, with edge-on slivers
  - open clusters (seeded scatter or real stars), globulars and star clouds
  - nebulas by type, plus the special shapes:
    - Orion, Lagoon, Trifid, Eagle
    - North America, Rosette, Carina, Tarantula
    - Crab, Coalsack, Crescent, Bubble
    - Ring, Dumbbell, Owl, Helix, Cat's Eye, Saturn, Eskimo, Bug, Skull
  - meteor showers
- Every color is a theme token, so red-light mode keeps working.
- The icons are used in the Up tonight card now, and in the Up tonight list later.
- The home page's "Find …" constellation door uses the same figures. The old hand-drawn `constellationShapes.js` goes away.

## Non-goals

- New icon designs. The approved sheet is the spec.
- The Up tonight list itself (next design round).

## Approaches

1. **Precompute the figures in the catalog build, and draw everything in one React component (picked).**
   - `npm run catalog` already reads the star data, so it also works out each constellation's icon figure (flattened, trimmed of redundant stars, with dot sizes) and the real-star layouts for the Pleiades, Hyades and Southern Pleiades.
   - The app only draws, with no math at runtime.
2. **Work out the figures in the browser.** Every visitor would download the raw star lines and repeat the math on each visit.
3. **Export static SVG files.** Red-light mode couldn't recolor them, and 640 files is a lot to keep up to date.

## Details (my calls)

- **Files:**
  - `src/components/sky-icons/SkyIcon.jsx` picks the right family.
  - One file per family: `planets.jsx`, `stars.jsx`, `figures.jsx`, `galaxies.jsx`, `clusters.jsx`, `nebulas.jsx` and `showers.jsx`, with small shared helpers in `shapes.js`.
  - Special nebula shapes live in a map keyed by catalog id.
- **Catalog data:**
  - Constellations and asterisms gain `figure: { lines, stars }` in the −10…10 icon space.
  - Open clusters with real stars gain `members`.
  - Orion's figure comes from a hand file, `src/sky/catalog/figureFixes.js`, since the data's lines hide the belt.
  - The bright-star protection, closed-loop fix and Hyades V stars move from the mockup script into `scripts/build-catalog.mjs`, with tests.
- **New theme tokens,** each with a red-light value:
  - `--star-icy`, `--star-cream`, `--star-orange`, `--star-red` and `--leaf`
  - planet shades `--jupiter-belt`, `--jupiter-zone`, `--mars-dark`, `--neptune-dark` and `--venus-band`

  Existing tokens are reused where they match: `--meteor-rose` for glowing gas, `--meteor-gold`, `--meteor-lilac`, `--uranus` and `--neptune`.
- **SVG ids:** clip paths (planets, the edge-on dust lane) get unique ids from React's `useId`.
- **Seeded scatter:** open clusters keep the seeded random layout, using the same seed (the catalog id) as the sheet, so each cluster always looks the same.
- **Accessibility:** icons are decorative (`aria-hidden`). The object's name is always next to them.
- **Size:** the figure data adds about 30–40 KB to the catalog before gzip. The catalog can move to a lazily loaded chunk later if needed.

## Testing

- **Build helpers:**
  - trimming keeps bright stars
  - closed loops survive
  - the Hyades V has its 5 stars in order
  - every constellation and asterism gets a figure with at least 2 stars
- **`SkyIcon`:**
  - renders a family-specific shape for one object of each kind
  - renders without errors for every catalog object, in a loop test
- **Browser:** the Up tonight card and the home door look the same as on the sheet, in both normal and red-light mode.
