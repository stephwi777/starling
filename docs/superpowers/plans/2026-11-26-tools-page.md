# Tools Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the `/tools` placeholder with a grid of simple tiles, one per planned tool, all "Coming soon" at launch, built so finishing a tool means editing one entry.

**Architecture:** One plain data list (`toolList.js`) holds every tool. A `ToolTile` component draws one tile, either a ready link or a quiet "Coming soon" tile. `Tools.jsx` orders the list (ready first) and maps it into a grid. No scenes ship now; each tool's scene arrives with the tool.

**Tech Stack:** React 19, React Router (declarative), Vite, Vitest with `renderToStaticMarkup`, oxlint.

**Spec:** `docs/superpowers/specs/2026-11-26-tools-page-design.md`. Visual reference: `mockups/tools-page.html` + `mockups/tools-page.jsx` (copy its sizes and CSS values).

## Global Constraints

- Code style: uppercase section headers (`// TOOLS`, `/* GRID */`, `{/* TILES */}`), several blank lines between sections, no other comments, only the classes that are truly needed.
- Never name a class `chevron` (ui.css `.chevron` masks the element). Don't wrap content in `<section>` (App.css gives every section gutter padding); use `div`, `ul`, `li`.
- Colors only from theme tokens (`var(--…)`), so red light works. No hex values in `Tools.css`.
- Cards: fill only, no borders or shadows; radius `var(--radius-card)`; tile background `var(--high)`, picture block `var(--raised)`.
- Page shell like Calendar: `padding: calc(var(--header-height, 92px) + 28px) var(--gutter) 100px`, content in `.inner` (1120px column).
- Grid: `repeat(auto-fill, minmax(min(100%, 300px), 1fr))`, gap 20px → 3 across at 1120px, 2 on tablets, 1 on phones.
- Picture area `aspect-ratio: 16 / 10`; `2 / 1` at `max-width: 600px`.
- Exact copy: tab title `Sky tools | Starling`; h1 `Sky tools`; intro `Handy tools for planning your night out!`; label `Coming soon`; Home door note `Space station, aurora and more`.
- Press animation only inside `@media (prefers-reduced-motion: no-preference)` and `:root:not(.still)`: `scale: 0.985` on `:active`, release `0.35s cubic-bezier(0.3, 1.3, 0.6, 1)`.
- Focus ring on ready tiles: `outline: 3px solid var(--beak); outline-offset: 3px` on the tile when its link is `:focus-visible`.
- Run `npm test` and `npm run lint` (oxlint) before finishing. Commit only when the user says to.

## Review Focus

1. **Screen reader heading navigation** (jumping by heading): after a tool's name they should hear its line and then "Coming soon". The text block comes before the picture block in the DOM; CSS puts the picture on top. Test in Task 2.
2. **Keyboard:** coming soon tiles are never a tab stop; a ready tile is exactly one tab stop whose whole area is clickable. Test in Task 2.
3. **Red light:** a hard-coded color in `Tools.css` would stay un-red. Test in Task 3.
4. **Reduced motion / Pause animations:** the press scale must not run. Test in Task 3.
5. **Phones and 200% zoom:** at 320px wide the grid must not scroll sideways (the `min(100%, 300px)` guard). Checked in the browser in Task 3.

---

### Task 1: The tool list

**Files:**
- Create: `src/components/tools/toolList.js`
- Test: `src/components/tools/toolList.test.js`

**Interfaces:**
- Produces: `TOOLS: Array<{ id: string, title: string, line: string, to: string, ready: boolean, Scene: Component | null }>` and `toolOrder(tools) → tools` (ready first, otherwise list order kept).

- [ ] **Step 1: Write the failing tests**

```js
test('every planned tool is listed once, in build order', () => {
  expect(TOOLS.map(tool => tool.id)).toEqual(['passes', 'aurora', 'chart', 'almanac', 'printables', 'jupiter', 'moon-map', 'eyepiece', 'map', 'satellite', 'phone', 'photo', 'solar-system', 'sunset', 'moonbow'])
})

test('nothing is ready at launch', () => {
  expect(TOOLS.filter(tool => tool.ready)).toEqual([])
})

test('the sky map opens the Map page and every other tool its own page', () => {
  expect(TOOLS.find(tool => tool.id === 'map').to).toBe('/map')
  expect(TOOLS.filter(tool => tool.id !== 'map').every(tool => tool.to === `/tools/${tool.id}`)).toBe(true)
})

test('ready tools come first and the rest keep their order', () => {
  const list = [{ id: 'a', ready: false }, { id: 'b', ready: true }, { id: 'c', ready: false }, { id: 'd', ready: true }]
  expect(toolOrder(list).map(tool => tool.id)).toEqual(['b', 'd', 'a', 'c'])
})
```

- [ ] **Step 2: Run `npx vitest run src/components/tools/toolList.test.js`** — expect FAIL (module not found).

- [ ] **Step 3: Write `toolList.js`.** Titles and lines exactly as the spec's tools table (rows 1–15; straight apostrophes in the spec become `’` in copy, matching the site). Every entry `ready: false, Scene: null`. `toolOrder` returns a new array: `[...ready, ...notReady]` via two filters.

- [ ] **Step 4: Run the test again** — expect PASS.

---

### Task 2: One tile

**Files:**
- Create: `src/components/tools/ToolTile.jsx`
- Test: `src/components/tools/ToolTile.test.jsx`

**Interfaces:**
- Consumes: a tool object from Task 1.
- Produces: `ToolTile({ tool })` → `<li className="tool">` containing `<div className="tool-text">` (h2 + p) then `<div className="tool-art">`.

Markup rules:
- Ready: the h2 holds `<Link to={tool.to}>{tool.title}</Link>`; art holds `<tool.Scene />` if there is one, otherwise stays empty (plain color block).
- Coming soon: the h2 is plain text; art holds `<span>Coming soon</span>`; no link anywhere.
- Scenes are decorative: each Scene component sets `aria-hidden="true"` on its svg (none exist yet).

- [ ] **Step 1: Write the failing tests** (render inside `MemoryRouter` with `renderToStaticMarkup`)

```jsx
const soon = { id: 'chart', title: 'Star chart', line: 'Find your way around tonight’s sky.', to: '/tools/chart', ready: false, Scene: null }
const ready = { ...soon, ready: true }

test('a coming soon tile names the tool, then says coming soon, with no link', () => {
  const html = draw(soon)
  expect(html).not.toContain('<a ')
  expect(html.indexOf('Star chart')).toBeLessThan(html.indexOf('Coming soon'))
})

test('a ready tile is one link to its tool and drops the label', () => {
  const html = draw(ready)
  expect(html.match(/<a /g)).toHaveLength(1)
  expect(html).toContain('href="/tools/chart"')
  expect(html).not.toContain('Coming soon')
})

test('a ready tool without a scene keeps a plain picture block', () => {
  expect(draw(ready)).toContain('<div class="tool-art"></div>')
})
```

- [ ] **Step 2: Run `npx vitest run src/components/tools/ToolTile.test.jsx`** — expect FAIL.

- [ ] **Step 3: Write `ToolTile.jsx`** to the markup rules above.

- [ ] **Step 4: Run the test again** — expect PASS.

---

### Task 3: The page, its styles, and the links to it

**Files:**
- Create: `src/pages/Tools.jsx`, `src/pages/Tools.css`
- Modify: `src/App.jsx` (lazy `Tools` import beside the other pages; `tools` route uses `<Tools />` instead of `<Placeholder title="Sky tools" />`)
- Modify: `src/components/home/Doors.jsx:52` (note → `Space station, aurora and more`)
- Test: `src/pages/Tools.test.jsx`

**Interfaces:**
- Consumes: `TOOLS`, `toolOrder` (Task 1), `ToolTile` (Task 2).
- Produces: default export `Tools()`.

Page markup: `<main className="tools-page">`, `<title>Sky tools | Starling</title>`, `<div className="inner">` with h1, intro p, and `<ul className="tool-grid">` of `toolOrder(TOOLS).map(tool => <ToolTile key={tool.id} tool={tool} />)`.

CSS (values from `mockups/tools-page.html`): page shell; h1 `color: var(--moon)`, `font-size: clamp(2.2rem, 4.4vw, 3.2rem)`, `font-variation-settings: 'SOFT' 100`; intro `margin: 8px 0 28px`, `color: var(--mist)`, `1.15rem`; `.tool` is a flex column with `overflow: hidden`; `.tool-art { order: -1 }` puts the picture on top while the DOM keeps text first; text padding `18px 24px 24px`; h2 `1.35rem` SOFT 100; line `margin-top: 6px`, mist, weight 700; link `::after` covers the whole tile; hover tint `color-mix(in srgb, var(--high) 85%, var(--raised))` only on tiles with a link; focus ring and press animation per Global Constraints.

- [ ] **Step 1: Write the failing tests**

```jsx
test('the page lists all 15 tools under its title', () => {
  const html = renderToStaticMarkup(<MemoryRouter><Tools /></MemoryRouter>)
  expect(html).toContain('<h1>Sky tools</h1>')
  expect(html.match(/<li class="tool"/g)).toHaveLength(15)
})

test('at launch the grid has no links to tab onto', () => {
  const html = renderToStaticMarkup(<MemoryRouter><Tools /></MemoryRouter>)
  expect(html).not.toContain('<a ')
})

test('tools styles use theme colors only, so red light works', () => {
  expect(css).not.toMatch(/#[0-9a-f]{3,8}\b/i)
})

test('the press only moves when motion is allowed', () => {
  const pressing = css.split('\n').filter(line => line.includes('scale: 0.985'))
  expect(pressing).toHaveLength(1)
  expect(css.indexOf('prefers-reduced-motion: no-preference')).toBeLessThan(css.indexOf('scale: 0.985'))
  expect(css).toMatch(/:root:not\(\.still\) \.tool:has\(a\):active/)
})
```

(`css` is `readFileSync(new URL('./Tools.css', import.meta.url), 'utf8')`, like `Header.test.js`.)

- [ ] **Step 2: Run `npx vitest run src/pages/Tools.test.jsx`** — expect FAIL.

- [ ] **Step 3: Write `Tools.jsx` and `Tools.css`; update `App.jsx` and `Doors.jsx`.**

- [ ] **Step 4: Run `npm test` and `npm run lint`** — expect all tests PASS and no lint errors in the new files.

- [ ] **Step 5: Check in the browser** (dev server, `/starling/tools`): 3 across at 1280px, 2 at 768px, 1 at 375px; no sideways scroll at 320px; header "Tools" link underlined; Home's door reads "Space station, aurora and more"; red light switch turns the tiles red; Tab skips every tile. Take screenshots at wide and phone width for the user.

- [ ] **Step 6: Ask the user whether to commit** `src/components/tools/`, `src/pages/Tools.*`, `src/App.jsx`, `src/components/home/Doors.jsx`, the spec, this plan, the calendar ideas notes and the Tools mockup.
