# Favorite Events Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let visitors favorite a subject (every Geminids peak, every Full Moon) from an event's card and give every matching event a yellow edge on the Calendar and Home's Coming up card.

**Architecture:** Every event generator adds `subjects: [{ key, label }]` (main subject first). Favorites are a saved list of subject keys (`starling.favorites`). Pure helpers decide whether an event is a favorite. `shownEvents` lets favorites past the kind filter and sorts them first within a day. The Calendar page owns a `useFavorites` hook and passes `favorites` down. Components add a `fav` class and hidden text.

**Tech Stack:** React 19, Vite, plain CSS, Vitest, oxlint, astronomy-engine.

**Spec:** `docs/superpowers/specs/2026-11-23-favorite-events-design.md`

## Global Constraints

- Never commit. The user commits. Every "Commit" step below is replaced by: run `npx vitest run` and `npm run lint`, both clean.
- Code style: section headers like `// SUBJECTS`, three blank lines between sections, no other comments. CSS uses `/* SECTION */` headers the same way.
- The mark is an inset `--beak` stripe: 3px on big chips and phone labels, 4px on list rows and Coming up rows. No star anywhere on the calendar itself.
- The card's star button: 36px round, left of the ⋯ menu, `aria-pressed`, `aria-label` "Favorite {label}". Off: outlined star in `--mist`. On: filled star in `--beak`.
- The line under the card title: none favorited → "Tap the star to favorite {main label}." Some favorited → "In your favorites: {labels joined with ' and '}."
- Favorites always show even when their kind is unchecked. "Visible from here" and search still apply.
- Home's Coming up stays the next 3 events in date order. Favorites get no extra slot.
- Storage key `starling.favorites`, `{ version: 1, keys: [...] }`. Bad or missing data gives an empty list. Every read and write is wrapped in try/catch.
- Keys never contain a date or time. Comet keys use the comet id and are exempt from the "no four-digit number" check.

## Review Focus

1. localStorage throws (private mode): starring still works for the visit and nothing crashes. Test in Task 2.
2. A favorite that is not visible from here stays hidden while "Visible from here" is on, and a search that doesn't match it hides it. Test in Task 2.
3. Un-starring an event that only showed because it was a favorite, while its card is open, keeps it shown until the card closes. Test in Task 2 (`keep`).
4. Coming up never reorders across days or gains a slot because of favorites. Test in Task 2.
5. Two comets with the same name keep separate keys, and their labels use the renamed full name. Test in Task 1.

---

### Task 1: Subjects on every event

**Files:**
- Modify: `src/sky/calendar/moonEvents.js`, `eclipseEvents.js`, `planetEvents.js`, `starEvents.js`, `seasonEvents.js`, `showerEvents.js`, `cometEvents.js`
- Create: `src/sky/calendar/subjects.test.js`

**Interfaces:**
- Produces: every event has `subjects: Array<{ key: string, label: string }>`, length ≥ 1, main subject first. `label` finishes the sentence "Favorite …".

Keys and labels (use exactly these):

| Events | key | label |
|---|---|---|
| Full Moon | `full-moon` | `every Full Moon` |
| …extras on a Full Moon | `supermoon`, `micromoon`, `blue-moon` | `every supermoon`, `every micromoon`, `every Blue Moon` |
| New Moon | `new-moon` (+ `black-moon` extra) | `every New Moon` (`every Black Moon`) |
| First and last quarter (one subject, as in the spec) | `quarter-moon` | `every first and last quarter Moon` |
| Moon closest / farthest | `moon-closest` / `moon-farthest` | `every time the Moon is closest` / `every time the Moon is farthest` |
| Moon crosses the Sun's path | `moon-node` | `every time the Moon crosses the Sun’s path` |
| Lunar / solar eclipse | `lunar-eclipse` / `solar-eclipse` | `every lunar eclipse` / `every solar eclipse` |
| Transit | `transit:{body}` | `every {body} transit` |
| At its best (opposition and elongation) | `best:{body}` | `every time {body} is at its best` |
| Venus brightest / Mars closest | `venus-brightest` / `mars-closest` | `every time Venus is at its brightest` / `every time Mars is closest` |
| Planet pair | `pair:{A}+{B}`, names sorted | `every time {A} and {B} meet` (names in sorted order) |
| Moon near planet | `moon-planet:{body}` | `every time the Moon passes {body}` |
| Planet parade | `parade` | `every planet parade` |
| Station / conjunction / apsis | `station:{body}` / `sun-pass:{body}` / `sun-distance:{body}` | `every time {body} turns around` / `every time {body} lines up with the Sun` / `every time {body} is closest or farthest from the Sun` |
| Moon near star | `moon-star:{target.id}` | `every time the Moon passes {target.label}` |
| Planet near star | `planet-star:{planet}+{target.id}` | `every time {planet} passes {target.label}` |
| Milky Way begins / ends | `milky-way` | `every Milky Way season` |
| Season | `season:{season.key}` | `every {season.name}` |
| Earth closest / farthest | `earth-closest` / `earth-farthest` | `every time Earth is closest to the Sun` / `every time Earth is farthest from the Sun` |
| Meteor shower | `shower:{shower.name}` | `every {shower.name} peak` |
| Comet (all phases) | `comet:{comet.id}` | `Comet {name}` (the renamed full name when `rename` applies) |

- [ ] **Step 1: Write the failing tests** in `subjects.test.js`, using `monthEvents` for Kansas City (`KC` as in `monthEvents.test.js`) with no kind filter.

```js
const year = y => Array.from({ length: 12 }, (_, i) => monthEvents(KC, y, i + 1)).flat()
const all2027 = year(2027)

test('every event has a subject', () => {
  expect(all2027.every(event => event.subjects?.length > 0 && event.subjects.every(s => s.key && s.label))).toBe(true)
})

test('subject keys never include a date', () => {
  expect(all2027.flatMap(event => event.subjects).filter(s => !s.key.startsWith('comet:') && /\d{4}/.test(s.key))).toEqual([])
})

test('the same subject keeps its key from year to year', () => {
  const keys = events => new Set(events.flatMap(event => event.subjects.map(s => s.key)))
  const next = keys(year(2028))

  for (const key of ['shower:Geminids', 'full-moon', 'season:dec_solstice', 'best:Jupiter']) {
    expect(keys(all2027).has(key), key).toBe(true)
    expect(next.has(key), key).toBe(true)
  }
})

test('a supermoon Full Moon is both, Full Moon first', () => {
  const superFull = all2027.find(event => event.kinds.includes('supermoon'))

  expect(superFull.subjects.map(s => s.key).slice(0, 2)).toEqual(['full-moon', 'supermoon'])
})

test('planet pairs use sorted names', () => {
  const pair = all2027.find(event => event.kinds.includes('planet-pair'))
  const [a, b] = pair.subjects[0].key.slice(5).split('+')

  expect([a, b]).toEqual([a, b].sort())
})
```

Also add to `cometEvents.test.js`: two sample comets sharing a name get different `comet:` keys, and each label equals `Comet {name} ({designation})`.

- [ ] **Step 2: Run** `npx vitest run src/sky/calendar/subjects.test.js src/sky/calendar/cometEvents.test.js`. Expected: FAIL (`subjects` undefined).

- [ ] **Step 3: Add `subjects`** in each generator's event literal (or its `base` call), following the table. In `cometEvents.js`, `rename` also replaces the label's plain name with the full one.

- [ ] **Step 4: Run** the same command, then `npx vitest run`. Expected: PASS, all suites green.

- [ ] **Step 5: Check** with `npx vitest run` and `npm run lint` (no commit).

---

### Task 2: Saving favorites and letting them through

**Files:**
- Create: `src/sky/calendar/favoriteStorage.js`, `src/sky/calendar/favoriteStorage.test.js`, `src/sky/calendar/favorites.js`, `src/sky/calendar/favorites.test.js`
- Modify: `src/sky/calendar/monthEvents.js` (`shownEvents`, `upcoming`), `src/sky/calendar/monthEvents.test.js`

**Interfaces:**
- Consumes: `event.subjects` from Task 1.
- Produces:
  - `loadFavorites(storage?) -> string[]`, `saveFavorites(keys: string[], storage?) -> void` (`favoriteStorage.js`, same `storage ?? globalThis.localStorage` pattern as `calendarStorage.js`).
  - `isFavorite(event, favorites: string[]) -> boolean` and `favoredSubjects(event, favorites) -> Array<{ key, label }>` (`favorites.js`).
  - `shownEvents(events, { kinds, world, query, favorites = [], keep = null })`. An event passes the kind check if a kind matches, it is a favorite, or `event.id === keep`. World and search apply to everything. The result is ordered by `day`, favorites first within a day, otherwise keeping the input order.
  - `upcoming(place, now, { kinds, favorites = [], count = 3, days = 30 })` passes `favorites` into `shownEvents` and still takes the first `count` in date order.

- [ ] **Step 1: Write the failing tests.**

`favoriteStorage.test.js` (reuse the `memory()` helper style from `calendarStorage.test.js`):
- a first visit gives `[]`
- `saveFavorites(['shower:Geminids'])` then `loadFavorites` gives `['shower:Geminids']`
- junk text, a wrong version, or a non-array `keys` gives `[]`
- a storage whose `getItem` and `setItem` throw gives `[]` and doesn't throw

`favorites.test.js`:
- `isFavorite({ subjects: [{ key: 'full-moon' }, { key: 'supermoon' }] }, ['supermoon'])` is `true`
- the same event with `['new-moon']` is `false`
- `favoredSubjects` returns only the favorited subjects, in the event's order

`monthEvents.test.js` additions (February 2027 for KC, as in the existing tests):
- a favorited event whose kind is off is shown: pick `february.find(e => e.kinds.includes('station'))`; `shownEvents(february, { kinds: DEFAULT_KINDS, world: false, query: '', favorites: [station.subjects[0].key] })` contains it
- a favorite that is not `here` stays hidden while `world` is false (use any `here: false` event from a month that has one, with all kinds off and its key favorited)
- a search that doesn't match hides a favorite
- `keep: station.id` with no favorites shows the station event
- favorites come first within a day: in a day with two shown events, favoriting the second puts it first, and other days keep their order
- `upcoming` with favorites returns at most 3 events, all in date order

- [ ] **Step 2: Run** `npx vitest run src/sky/calendar`. Expected: the new tests FAIL.

- [ ] **Step 3: Implement** the three files' functions and the two `monthEvents.js` changes as specified. Sort `shownEvents` output with a stable sort keyed on `day`, then favorite before not.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

- [ ] **Step 5: Check** with `npx vitest run` and `npm run lint` (no commit).

---

### Task 3: The star on the event card

**Files:**
- Create: `src/components/calendar/useFavorites.js`, `src/components/calendar/EventCard.test.jsx`
- Modify: `src/components/calendar/EventCard.jsx`, `src/pages/Calendar.jsx`, `src/components/panel/Popover.css` (or the card's existing stylesheet)

**Interfaces:**
- Consumes: `loadFavorites`, `saveFavorites`, `favoredSubjects` (Task 2), `event.subjects` (Task 1).
- Produces:
  - `useFavorites() -> { favorites: string[], toggle(key: string): void }`. State starts from `loadFavorites()` and saves on change, like `useCalendarSettings`.
  - `EventCard` gains props `favorites: string[]` and `onFavorite(key: string)`.
  - `Calendar.jsx` builds `filters = { kinds, world, query, favorites, keep: pickedId }`. The same `filters` goes to `shownEvents` and `YearList`.

- [ ] **Step 1: Write the failing tests** in `EventCard.test.jsx` with `renderToStaticMarkup` (wrap in a `MemoryRouter` if anything needs a router). Use a hand-made event: `{ id: 'x', kinds: ['full-moon','supermoon'], group: 'moon', icon: 'full-moon', day: '2026-12-23', time: '7:29pm', here: true, tags: [], note: 'n', rows: [], name: 'Full Cold Moon', subjects: [{ key: 'full-moon', label: 'every Full Moon' }, { key: 'supermoon', label: 'every supermoon' }] }`.
  - With `favorites={[]}`: the markup has `aria-pressed="false"`, `aria-label="Favorite every Full Moon"`, and "Tap the star to favorite every Full Moon."
  - With `['full-moon']`: `aria-pressed="true"` and "In your favorites: every Full Moon."
  - With `['supermoon']`: `aria-pressed="false"` and "In your favorites: every supermoon."
  - With `['full-moon','supermoon']`: "In your favorites: every Full Moon and every supermoon."

- [ ] **Step 2: Run** `npx vitest run src/components/calendar/EventCard.test.jsx`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - The star button goes in `.event-card-tools`, before `<CardMenu>`. It uses the 16-unit star path from the mockup (`mockups/calendar-favorites.jsx`, `STAR`) and calls `onFavorite(event.subjects[0].key)`.
  - The line goes under `.event-card-head` as `<p className="event-card-favorite">`.
  - For each extra subject (index ≥ 1), add a ⋯ menu item: "Favorite {label}", or "Remove {label} from favorites" when it's on.
  - Wire `useFavorites` in `Calendar.jsx` and pass `favorites` and `onFavorite={toggle}` to `EventCard`.
  - Style `.event-card-star`: 36px round, `--raised` background, `--mist` outline star, `--beak` fill when `[aria-pressed="true"]`. Add a focus ring matching the other card tools.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

- [ ] **Step 5: Check** with `npx vitest run` and `npm run lint` (no commit).

---

### Task 4: The yellow edge everywhere

**Files:**
- Modify: `src/components/calendar/MonthGrid.jsx`, `EventRow.jsx`, `YearList.jsx`, `src/pages/Calendar.jsx` (`DayList`, `MonthGrid` props), `src/components/home/ComingUpCard.jsx`, `src/pages/Calendar.css`, `src/pages/Home.css` (or wherever `.coming-row` is styled)
- Create: `src/components/calendar/EventRow.test.jsx`, `src/components/calendar/MonthGrid.test.jsx`

**Interfaces:**
- Consumes: `isFavorite` (Task 2), `favorites` from `useFavorites` (Task 3), `loadFavorites` (Task 2).
- Produces:
  - `EventRow` gains a `favorite: boolean` prop.
  - `MonthGrid` gains a `favorites: string[]` prop.
  - `YearList` reads `filters.favorites`.
  - `ComingUpCard` passes `favorites: loadFavorites()` to `upcoming`, and each favorited row gets class `fav` and the same hidden "Favorite, " text.

- [ ] **Step 1: Write the failing tests.**
  - `EventRow.test.jsx`: with `favorite` true, the button has class `fav` and contains a visually hidden "Favorite" (for example `<span class="visually-hidden">Favorite, </span>` before the name). With it false, neither appears.
  - `MonthGrid.test.jsx`: render `narrow` for a month with a favorited event (hand-made events are fine). That day's button `aria-label` ends with ", 1 favorite", and the matching `.day-bars i` has class `fav`. In the wide grid, the chip has class `fav` and the hidden "Favorite" text.

- [ ] **Step 2: Run** `npx vitest run src/components/calendar`. Expected: FAIL.

- [ ] **Step 3: Implement.**
  - Add the classes and hidden text.
  - The day label adds `, {n} favorite` or `, {n} favorites` when n > 0.
  - CSS (one `/* FAVORITES */` section in `Calendar.css`):
    - `.chip.fav` and `.day-bars i.fav`: `box-shadow: inset 3px 0 0 var(--beak)`, plus 2px more left padding.
    - `.event-row.fav`: `inset 4px 0 0 var(--beak)`.
    - Away (dashed) chips keep their dashed outline and add the stripe.
  - `.coming-row.fav` gets the 4px stripe in Home's stylesheet.
  - Pass `favorites` to `MonthGrid` and `DayList`, and `favorite={isFavorite(event, favorites)}` to each `EventRow`.

- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

- [ ] **Step 5: Check in the browser** (preview server, `/starling/calendar`). Then run `npx vitest run` and `npm run lint` (no commit).
  - Star the Geminids on the December 2026 card. The stripe appears on the Geminids chip and in the year list, and on December 2027's Geminids.
  - Uncheck Major showers: the Geminids stay.
  - Un-star with the card open: the Geminids stay until the card closes.
  - Reload: the favorite is remembered.
  - Phone width (375px): the Geminids label has the stripe and sorts first in its day.
  - Home: Coming up rows show the stripe when a favorite is among the next 3.
