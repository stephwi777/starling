# Visual Redesign, Part 1 (Foundation and Home) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the new look site-wide (softened palette, rounded Nunito, soft Fraunces, outline-free shapes) and rebuild the home page around a living sky that shows real conditions.

**Architecture:** Pure, tested functions decide the sky's look (`skyLook`), read the sky right now (`skyNow`) and list coming events (`comingUp`). Small components draw the sky (`SkyScene`, `Moon`, `Clouds`, `Ground`) and the Finch-style building blocks (`Card`, `IconWell`, `PressButton`, icons). The home page composes them with the existing `useNight` hook and a forecast hook lifted out of the Tonight page.

**Tech Stack:** React 19, React Router 8, Vite 8, Vitest 5, astronomy-engine 2.1.19, Open-Meteo.

**Spec:** `docs/superpowers/specs/2026-11-18-visual-redesign-design.md`

## Global Constraints

- Code style: uppercase section headers only (`// SECTION`, `/* SECTION */`, `{/* SECTION */}`), several blank lines between sections, no other comments, only needed classes.
- Colors only through theme variables. New palette values exactly as the spec's table.
- No outlines on boxes; no glass; no ALL CAPS labels.
- Body font Nunito; headings, verdicts and the wordmark Fraunces with `font-variation-settings: 'SOFT' 100`.
- Radii: cards 30px, tiles 26px, icon wells 18px, pressable buttons 18px.
- Sky band only on the home page in this part (Tonight comes in part 2). No labels in the sky.
- Every sky condition is also said in words; animations stop under `.still` (the existing motion toggle) and `prefers-reduced-motion`.
- Text contrast at least 4.5:1 on every sky look (large headings at least 3:1).

## Review Focus

- A visitor in daytime: the home sky is the deep daytime blue with the Sun, and the daytime line points to tonight. Test in Task 4.
- No forecast (failed or loading): no clouds drawn, the Tonight card says the forecast is unavailable, nothing crashes. Tests in Tasks 2 and 4.
- Fewer than three events in the next 30 days: the Coming up card shows what there is. Test in Task 3.
- A place where the Moon is down all day and night: no Moon is drawn and nothing crashes. Test in Task 2.
- The Tonight page from Phase 3 still works after the palette change (its old panel tokens are kept as aliases). Checked in Task 1.

---

### Task 1: Palette, fonts and shape tokens

**Files:**
- Modify: `index.html` (font link), `src/styles/theme.css`

**Interfaces:**
- Produces: tokens `--raised`, `--radius-card: 30px`, `--radius-tile: 26px`, `--radius-well: 18px`, `--radius-button: 18px`; `--font-body: 'Nunito', system-ui, sans-serif`; headings get `font-variation-settings: 'SOFT' 100`.

- [ ] **Step 1:** In `index.html`, replace the font link with `https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght,SOFT@9..144,400..600,0..100&family=Nunito:wght@400;600;700;800;900&display=swap`.
- [ ] **Step 2:** In `theme.css`, set every color to the spec's "New" column, add `--raised: #1f2350`, add the radius tokens, switch `--font-body` to Nunito, and add `font-variation-settings: 'SOFT' 100` to the `h1, h2, h3` rule. Keep `--panel: var(--high)`, `--panel-raised: var(--raised)`, `--rule: var(--raised)`, `--track: var(--zenith)` so Phase 3's Tonight keeps working. In the red-light block add `--raised: #200705`.
- [ ] **Step 3:** `npm test` and `npm run build` pass. In the browser, Home, Tonight, About, Credits and Contact render with the new fonts and no broken colors.
- [ ] **Step 4:** Commit "Softens the palette and switches to rounded Nunito and soft Fraunces".

### Task 2: How the sky looks

**Files:**
- Create: `src/sky/skyLook.js`, `src/sky/skyLook.test.js`

**Interfaces:**
- Produces: `skyLook({ sunAlt, moonAlt, moonLit, moonAngle, cloudCover, isHome }) -> { phase: 'day'|'dusk'|'night', name: 'day'|'dusk'|'clear'|'moonlit'|'patchy'|'overcast', colors: { top, middle, low }, stars: number, clouds: 0|1|2|3, moon: { angle, lit, halo } | null, sun: boolean, snow: string }` and `PRESETS` (one input object per look name, for `?sky=`).
- Colors per look (top, middle, low): clear `#070920 #0f1230 #262158`, moonlit `#1a2152 #263070 #3d3f86`, patchy `#080a22 #121535 #29235c`, overcast `#1b1d3c #23264a #2e2c58`, dusk `#121543 #3a3480 #a0729e`, day `#2b3d86 #4459a3 #7d8fca`. Snow: moonlit `#c9bff0`, overcast `#9d94c4`, dusk `#c2b3e2`, day `#c6bcec`, otherwise `var(--snow)`.

- [ ] **Step 1: Failing tests:**
  - `sunAlt: 10, isHome: true` → `phase 'day'`, `name 'day'`, `sun true`, `stars 0`; the same with `isHome: false` → `phase 'dusk'` (Tonight never shows day).
  - `sunAlt: -5` → `'dusk'`; `sunAlt: -30` → `'night'`.
  - Clouds: `cloudCover` 10 → 0, 30 → 1, 60 → 2, 90 → 3 and `name 'overcast'`, `stars 0`; `null` → 0.
  - Night, clear, `moonLit 0.9`, `moonAlt 30` → `name 'moonlit'`, `moon.halo true`, `stars` below 0.4; `moonLit 0.1` → `name 'clear'`, `stars 1`, `moon.halo false`.
  - `moonAlt -10` → `moon null`.
  - Every `PRESETS[name]` passed to `skyLook` returns that `name`.
- [ ] **Step 2:** Run `npx vitest run src/sky/skyLook.test.js`; fails (module missing).
- [ ] **Step 3:** Implement. Name priority: day, dusk, overcast (clouds 3), patchy (clouds 2), moonlit (Moon up and over 60% lit), clear. Stars: 1 at night, times `1 - moonLit * 0.7` when the Moon is up, 0.3 at dusk, times 0.6 for clouds level 2, 0 for level 3 and day.
- [ ] **Step 4:** Run; passes. `npm test` green.
- [ ] **Step 5:** Commit "Adds the living sky look".

### Task 3: Coming up events

**Files:**
- Create: `src/sky/comingUp.js`, `src/sky/comingUp.test.js`

**Interfaces:**
- Consumes: `SHOWERS` from `src/sky/catalog/showers.js`; astronomy-engine `SearchMoonQuarter`, `NextMoonQuarter`.
- Produces: `comingUp(now: Date, { days = 30, count = 3 } = {}) -> Array<{ date: Date, kind: 'new-moon'|'first-quarter'|'full-moon'|'last-quarter'|'shower', name: string, note: string }>`, sorted by date.
- Copy: new moon "New moon" / "The darkest skies of the month"; first quarter "First quarter Moon" / "Half lit, high in the evening"; full moon "Full moon" / "Rises around sunset"; last quarter "Last quarter Moon" / "Half lit, rises after midnight"; shower "{name} peak" / "Up to {zhr} meteors an hour".

- [ ] **Step 1: Failing tests** (`now = 2026-11-13T20:00:00Z`):
  - Returns 3 items, sorted by date, all within 30 days.
  - Includes "Leonids peak" (Nov 17) and "Full moon" with a date on 2026-11-24 (UTC).
  - `count: 10` returns no event after 2026-12-13 (so the Geminids peak, Dec 14, is excluded).
  - `days: 1` from `2026-11-26T00:00:00Z` returns an empty array without crashing.
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Implement. Shower peaks use the peak month-day at 06:00 UTC in the current or next year.
- [ ] **Step 4:** Run; passes.
- [ ] **Step 5:** Commit "Adds coming-up events from Moon phases and shower peaks".

### Task 4: The sky right now

**Files:**
- Create: `src/sky/skyNow.js`, `src/sky/skyNow.test.js`, `src/sky/useForecast.js`
- Modify: `src/pages/Tonight.jsx` (use `useForecast` instead of its own fetch effect)

**Interfaces:**
- Consumes: `observerFor`, `positionAt`, `fetchWeather`, `skyWord`, `clock`.
- Produces:
  - `skyNow(place, now, forecast) -> { sunAlt, moonAlt, moonLit, moonAngle, cloudCover }` (`cloudCover` from the forecast hour matching `now` in the place's time zone, else `null`).
  - `daytimeLine(sunset: Date, word: 'Clear'|'Patchy'|'Cloudy'|null, timeZone) -> string`: "The Sun sets at 5:04pm." followed by "Tonight looks clear!", "Tonight looks patchy.", "Tonight looks cloudy." or "Check back after dark!".
  - `useForecast(place) -> { raw, status: 'loading'|'ready'|'failed' }` (the AbortController logic moved from `Tonight.jsx`).

- [ ] **Step 1: Failing tests:**
  - Kansas City at `2026-11-13T18:00:00Z` (noon CST): `sunAlt > 20`.
  - At `2026-11-14T08:00:00Z` (2am): `sunAlt < -18`.
  - With a fake forecast whose `'2026-11-13T12:00'` cloud cover is 77, `cloudCover` is 77; with `null` forecast it is `null`.
  - `daytimeLine(new Date('2026-11-13T23:04:00Z'), 'Clear', 'America/Chicago')` is `'The Sun sets at 5:04pm. Tonight looks clear!'`; with `null` it ends "Check back after dark!".
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Implement `skyNow` and `daytimeLine`; move the forecast effect from `Tonight.jsx` into `useForecast` unchanged in behavior.
- [ ] **Step 4:** `npm test` green; Tonight still loads weather in the browser.
- [ ] **Step 5:** Commit "Adds the sky right now and a shared forecast hook".

### Task 5: Stars that follow the sky

**Files:**
- Modify: `src/components/starField.js`, `src/components/starField.test.js`, `src/components/Stars.jsx`

**Interfaces:**
- Produces: `visibleStars(stars, field, boxes, amount = 1)`; `<Stars amount={number} />`.

- [ ] **Step 1: Failing tests:** `amount 0.5` on the 1425px field gives 70 stars; `amount 0` gives 0.
- [ ] **Step 2:** Run; fails.
- [ ] **Step 3:** Multiply the count by `amount`; pass it through from `Stars`.
- [ ] **Step 4:** Run; passes.
- [ ] **Step 5:** Commit "Lets the star count follow the sky".

### Task 6: Sky components

**Files:**
- Create: `src/components/sky/SkyScene.jsx`, `SkyScene.css`, `Moon.jsx`, `Clouds.jsx`, `Clouds.css`, `Ground.jsx`

**Interfaces:**
- Consumes: a `look` from Task 2, `<Stars amount>` from Task 5.
- Produces: `<SkyScene look size="tall"|"band">{children}</SkyScene>` (the children are the text over the sky); `<Moon angle lit halo size />`; `<Clouds level />`; `<Ground size />`.
- Drawing comes from `mockups/directions.html` (ground: three hill layers, pine clusters, starling on the tall size) and `mockups/living-sky.html` (clouds, halo, sun, pale daytime Moon). Everything is `aria-hidden`.
- `?sky=clear|moonlit|patchy|overcast|dusk|day` replaces the live look with `PRESETS[name]` in development only (`import.meta.env.DEV`).

- [ ] **Step 1:** Build the components. Clouds drift with a CSS animation that `.still` and reduced motion turn off.
- [ ] **Step 2:** On a temporary route or the home page, check all six `?sky=` looks at desktop and 375px: stars stay off text, clouds hide stars behind them, no sideways scroll.
- [ ] **Step 3:** Commit "Adds the sky scene, Moon, clouds and ground".

### Task 7: Building blocks, header and footer

**Files:**
- Create: `src/components/ui/Card.jsx`, `IconWell.jsx`, `PressButton.jsx`, `icons.jsx`, `ui.css`
- Modify: `src/components/Header.jsx`, `Header.css`, `Footer.css`, `src/App.jsx` (route `tools` → `<Placeholder title="Sky tools" />`)

**Interfaces:**
- Produces: `<Card as="section" labelledBy>{children}</Card>`; `<IconWell>{icon}</IconWell>`; `<PressButton to? onClick? quiet?>{label}</PressButton>` (a `Link` when `to` is given); icons `MoonIcon`, `MeteorIcon`, `CalendarIcon`, `PineIcon`, `ConstellationIcon`, `TelescopeIcon`, `FullMoonIcon`.
- Header nav: Tonight, Calendar, Map, Learn, Tools. The place pill keeps its two states; the "Set location" pill becomes a `PressButton`-style pill.

- [ ] **Step 1:** Build the blocks with the spec's radii and press shadow (`0 5px 0` of a darker shade; down 4px when pressed; no movement under `.still`).
- [ ] **Step 2:** Update header and footer to the new fonts and tokens; add Tools.
- [ ] **Step 3:** Browser: header and footer on every page, keyboard focus visible, 44px targets.
- [ ] **Step 4:** Commit "Adds Finch-style building blocks and refreshes the header and footer".

### Task 8: The new home page

**Files:**
- Modify: `src/pages/Home.jsx`; create `src/pages/Home.css`, `src/components/home/TonightCard.jsx`, `ComingUpCard.jsx`, `Doors.jsx`
- Delete: `src/components/Hero.jsx`/`.css`, `TonightPreview.jsx`/`.css`, `CalendarPreview.jsx`/`.css`, `MapPreview.jsx`/`.css`, `LearnPreview.jsx`/`.css` (keep `Aurora`, `Meteors`, `Twinkle`, `DoorLink`)

**Interfaces:**
- Consumes: `skyLook`, `skyNow`, `daytimeLine`, `useForecast`, `useNight(place, 0, raw, now)`, `comingUp`, `SkyScene`, building blocks.

- [ ] **Step 1:** Home: tall `SkyScene` with `skyLook({ ...skyNow(place, now, raw), isHome: true })`; "Meet tonight's sky", the line "See what's up there tonight, right where you're standing. Just look up!", the daytime line when `phase === 'day'`, and "See tonight's sky" (`PressButton to="/tonight"`).
- [ ] **Step 2:** `TonightCard`: heading "Tonight in {short place name}", the verdict, three facts (Moon % lit, Fully dark time or "Not tonight", outside temperature or "—"), "Open Tonight".
- [ ] **Step 3:** `ComingUpCard`: `comingUp(now)` rows with icon wells, bronze dates ("Nov 24"), a "Calendar" link; when empty, "Nothing big in the next month. Clear skies are still worth a look!".
- [ ] **Step 4:** `Doors`: Find dark skies (`/map`), Find Cassiopeia (`/learn`), Sky tools (`/tools`).
- [ ] **Step 5:** Delete the old home components; `npm run lint`, `npm test`, `npm run build` pass.
- [ ] **Step 6:** Browser at desktop and 375px for all six `?sky=` looks: text contrast checked with the inspector (record each ratio), stars off text, no sideways scroll, keyboard path through hero button, cards and doors.
- [ ] **Step 7:** Commit "Rebuilds the home page around the living sky".
