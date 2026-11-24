# Calendar Additions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add reminders to exported calendar files, an "Only my favorites" view, a month picker on the month title, and a search "Next" button that finds the next match.

**Architecture:** Each addition is mostly a small pure function with tests plus a thin UI change:
- `calendarFile` gains a `remind` option.
- Calendar settings gain `favoritesOnly`, which `shownEvents` honors.
- A new `MonthPicker` component opens from the title.
- A month-by-month search generator is driven step by step by a `useNextMatch` hook.

**Tech Stack:** React 19, Vite, plain CSS, Vitest, oxlint, astronomy-engine.

**Spec:** `docs/superpowers/specs/2026-11-23-calendar-additions-design.md`

## Global Constraints

- Don't commit unless the user asks. Every "Commit" step is replaced by running `npx vitest run` and `npm run lint` and seeing both come back clean.
- Code style: section headers like `// SETTINGS`, three blank lines between sections, no other comments. CSS uses `/* SECTION */` headers the same way.
- Reminders:
  - Timed events: `TRIGGER:-PT1H`, an alert 1 hour before the start.
  - All-day events: `TRIGGER:-PT6H`, which is 6pm the evening before, since the event starts at midnight.
  - Each alert is a `VALARM` with `ACTION:DISPLAY` and the event name as its `DESCRIPTION`.
- Copy, exactly as the spec gives it:
  - "Only my favorites"
  - "Star events to build your favorites."
  - "No matches this month."
  - "N matches this month."
  - "Next: {name} · {short date} →"
  - "Next after this month: …"
  - "Looking further ahead…"
  - "No matches in the next three years."
- Month picker range: from last year through ten years ahead.
- Search "Next" starts at the later of two months: the one after the month on screen, and the current month. It gives up after 36 months.
- "Only my favorites" does nothing while there are no favorites, but the setting stays saved. Home's Coming up ignores it.
- Motion follows the existing pattern: transitions only inside `@media (prefers-reduced-motion: no-preference)` with `:root:not(.still)`.

## Review Focus

1. **Typing quickly:** a search that changes while it's still looking ahead must cancel the old look-ahead, and no stale "Next" may appear. Test in Task 4 (generator restart), checked by hand in Task 5.
2. **Un-starring the last favorite with "Only my favorites" on:** the calendar must show everything again, never an empty grid. Test in Task 2.
3. **Picker at the range edges:** the year arrows stop, and picking a month outside the range is impossible. Test in Task 3.
4. **"Next" pressed from last year (picker):** it never lands in the past. Test in Task 4.
5. **"Add all" with no favorites:** the file has no alerts at all. Test in Task 1.

---

### Task 1: Reminders in calendar files

**Files:**
- Modify: `src/sky/calendar/ics.js`, `src/sky/calendar/ics.test.js`, `src/components/calendar/YearList.jsx`

**Interfaces:**
- Produces: `calendarFile(events, { place, linkFor, now, remind = () => true })`. When `remind(event)` is true, the event's lines include a `VALARM` block before `END:VEVENT`.

- [ ] **Step 1: Write the failing tests in `ics.test.js`**, using the file's existing timed and all-day fixtures:
  - A timed event contains `BEGIN:VALARM`, `TRIGGER:-PT1H`, `ACTION:DISPLAY` and `END:VALARM`.
  - An all-day event contains `TRIGGER:-PT6H`.
  - With `remind: () => false`, the file has no `VALARM`.
  - With `remind: event => event.id === <timed id>`, only that event has an alert.
- [ ] **Step 2: Run** `npx vitest run src/sky/calendar/ics.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the `remind` option in `eventLines` and `calendarFile`. In `YearList.addAll`, pass `remind: event => isFavorite(event, filters.favorites ?? [])`. EventCard's single-event export keeps the default, so it always gets an alert.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

### Task 2: Only my favorites

**Files:**
- Modify: `src/sky/calendar/calendarStorage.js` (+ test), `src/sky/calendar/monthEvents.js` (+ `monthEvents.test.js`), `src/components/calendar/useCalendarSettings.js`, `src/components/calendar/KindList.jsx`, `src/pages/Calendar.jsx`, `src/pages/Calendar.css`

**Interfaces:**
- Produces:
  - Calendar settings `{ kinds, world, favoritesOnly }`, where `favoritesOnly` defaults to `false` and an invalid saved value loads as `false`. `useCalendarSettings()` adds `setFavoritesOnly(on: boolean)`.
  - `shownEvents(events, { …, favorites = [], keep = null, favoritesOnly = false })`. When `favoritesOnly && favorites.length > 0`, only favorited events (and `keep`) pass. World and search still apply.
  - `KindList` gets new props `favoritesOnly`, `favoriteCount`, `setFavoritesOnly`.

- [ ] **Step 1: Write the failing tests.**
  - `calendarStorage.test.js`: `favoritesOnly: true` round-trips. A save without it, or with a non-boolean value, loads `false`.
  - `monthEvents.test.js`, using February 2027:
    - With `favoritesOnly: true` and one favorite key, only events with that key are shown.
    - With `favoritesOnly: true` and `favorites: []`, the result equals the normal result. This is Review Focus 2.
- [ ] **Step 2: Run** `npx vitest run src/sky/calendar`. Expected: the new tests FAIL.
- [ ] **Step 3: Implement** the storage, the filter and the hook setter. Then build the UI:
  - **The row:** at the top of `KindList`, above "Show on calendar". It's a `kind-option` checkbox with `--c: var(--beak)`, labelled "Only my favorites", with a `<small>` count reading "1 favorite" or "N favorites".
  - **No favorites:** the input is `disabled`, and the note reads "Star events to build your favorites."
  - **While it's on:** the event-type list below gets class `muted` (opacity 0.45).
  - **Calendar.jsx:** passes `favoritesOnly: settings.favoritesOnly` in `filters`, and `favoriteCount={favorites.length}` to `KindList`.
  - **Home's Coming up:** unchanged.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

### Task 3: Jump to a month

**Files:**
- Create: `src/components/calendar/MonthPicker.jsx`, `src/components/calendar/monthPicker.js`, `src/components/calendar/monthPicker.test.js`
- Modify: `src/components/calendar/MonthGrid.jsx`, `src/pages/Calendar.jsx`, `src/pages/Calendar.css`

**Interfaces:**
- Produces:
  - `pickerRange(currentYear) -> { from: currentYear - 1, to: currentYear + 10 }`.
  - `clampYear(year, range) -> number`.
  - `MonthPicker({ year, month, current: { year, month }, onPick(year, month), onClose })`.
  - `MonthGrid` gets a new prop `onJump(year, month)`. The `h2` keeps `id="month-title"` and contains a `button.month-title-button` with `aria-haspopup="dialog"` and `aria-expanded`.
  - `Calendar.jsx` `jump(year, month)`: sets `shown`, clears `kept`, and sets `selected` to the 1st of that month.

- [ ] **Step 1: Write the failing tests** in `monthPicker.test.js`:
  - `pickerRange(2026)` is `{ from: 2025, to: 2036 }`.
  - `clampYear(2040, pickerRange(2026))` is `2036`.
  - `clampYear(2020, …)` is `2025`.
- [ ] **Step 2: Run** `npx vitest run src/components/calendar/monthPicker.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** the helpers and the picker, following the mockup (`mockups/calendar-additions.html`, "Jump to a month"):
  - **Header:** ‹ year ›. The arrow buttons are disabled at the range ends.
  - **Months:** a 4×3 grid of month buttons. The month on screen is filled (`--frost`/`--ink`), and the current month has an inset 2px `--teal` ring.
  - **Opening:** focus goes to the selected month.
  - **Keys:** arrow keys move by ±1 or ±4 months, Enter picks, and Escape closes and returns focus to the title button.
  - **Closing:** a pointerdown outside closes it, using the same pattern as `CardMenu`.
  - **Placement:** the panel is positioned under the title and is at most `calc(100vw - 32px)` wide on phones.
  - **Title button:** gets the soft `--raised` background and a small down-chevron, as in the mockup.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

### Task 4: Search look-ahead

**Files:**
- Create: `src/sky/calendar/nextMatch.js`, `src/sky/calendar/nextMatch.test.js`, `src/components/calendar/useNextMatch.js`

**Interfaces:**
- Produces:
  - `searchStart(shown: {year, month}, current: {year, month}) -> {year, month}`: the later of the month after `shown` and `current`.
  - `function* matchSearch(place, start, filters, comets, limit = 36)`: yields `{ match: null }` after each month with no match, then yields `{ match: event }` at the first match and stops. After `limit` months it yields `{ match: null, done: true }`. Each month uses `shownEvents(monthEvents(place, y, m, comets), filters)`, so all filters apply, and the earliest shown event by `date` wins.
  - `useNextMatch({ place, query, shown, current, filters, comets }) -> { status: 'idle' | 'looking' | 'found' | 'none', match }`. While `query` is non-empty, it steps the generator one month per `setTimeout(…, 0)` so typing is never blocked. It restarts and cancels whenever `query`, `shown`, filters or `place` change.

- [ ] **Step 1: Write the failing tests** in `nextMatch.test.js` (Kansas City as in the other tests):
  - `searchStart({year:2026,month:12}, {year:2026,month:11})` is `{year:2027,month:1}`.
  - From last year (Review Focus 4): `searchStart({year:2025,month:3}, {year:2026,month:11})` is `{year:2026,month:11}`.
  - Running `matchSearch` to the end with query `'Perseids'`, `kinds: ALL` and start `{2026, 11}` yields a match named `'Perseids peak'` with `day` in August 2027. It stops right there: fewer than 11 yields.
  - A query that matches nothing (`'zzzz'`) ends with `done: true` after exactly 36 month yields.
  - With `favoritesOnly: true` and one favorite key, the match has that key.
  - Two generators made one after the other with different queries don't share state (Review Focus 1).
- [ ] **Step 2: Run** `npx vitest run src/sky/calendar/nextMatch.test.js`. Expected: FAIL.
- [ ] **Step 3: Implement** `nextMatch.js` and the hook.
- [ ] **Step 4: Run** `npx vitest run`. Expected: PASS.

### Task 5: The "Next" button and Enter

**Files:**
- Modify: `src/pages/Calendar.jsx`, `src/components/calendar/SearchBox.jsx`, `src/pages/Calendar.css`

**Interfaces:**
- Consumes:
  - `useNextMatch` (Task 4).
  - `shortDate(event, today)` (`dates.js`).
  - The existing `wanted` deep-link ref in `Calendar.jsx`.
- Produces: `SearchBox` gets a new prop `onSubmit()`, called on Enter when the query is non-empty.

- [ ] **Step 1: Build the note.** `matchNote` in `Calendar.jsx` uses the spec's copy for each status:
  - **Found:** shows a `button.next-match` labelled `Next: {match.name} · {shortDate(match, today)} →`. When this month already has matches, the label starts "Next after this month: …" instead.
  - **Looking:** "Looking further ahead…".
  - **Nothing in three years:** "No matches in the next three years."
  - **Accessibility:** the note keeps `role="status"`.
- [ ] **Step 2: Add `goToMatch()`.** It sets `wanted.current = match.id`, sets `shown` to the match's month and clears `kept`. The existing deep-link effect then opens the card. Both the button and `SearchBox`'s `onSubmit` call it.
- [ ] **Step 3: Style `.next-match`** as in the mockup: `--raised` background, 10px radius, `--frost` text, weight 800, the same focus ring as the other calendar buttons.
- [ ] **Step 4: Check in the browser** at `/starling/calendar`:
  - Search "Perseids" in December 2026. The note offers the August 2027 Perseids, and clicking it opens that card.
  - Press Enter in the search box and get the same result.
  - Type quickly, for example "m", then "mo", then "moo". The note settles on the right match with no stale button.
  - Turn on "Only my favorites" with one favorite. "Next" respects it.
  - Then run `npx vitest run` and `npm run lint`.
