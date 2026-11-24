# Calendar additions — design

Approved in conversation 2026-11-23. Mockup: `mockups/calendar-additions.html` (approved as shown).



## Intent

Make the Calendar something you can plan your sky year with: events you export remind you, you can see just your favorites, you can get to any month quickly, and search takes you to the next time something happens.



## Goals

1. **Reminders** in downloaded calendar files.
2. **Only my favorites**: a view that shows only favorited events.
3. **Jump to a month** from the month title.
4. **Search "Next"**: from the search note (or Enter in the search box), go to the next match and open its card.



## Non-goals

- A live calendar subscription feed (needs a server that knows each visitor's place).
- Push notifications or any reminder that lives on the site itself.
- Searching the past.
- A day view or week view.



## Anti-goals

- The calendar lurching around while someone types (search never moves on its own).
- The page freezing while search looks ahead.
- Dozens of alerts landing in someone's own calendar from one "Add all".



## Approaches considered

- **Search look-ahead: small steps (chosen)** — check one month at a time between other work, reusing months already worked out (the month-by-month list computes the next 12), and stop at the first month with a match. Work grows only with the distance to the next match. A background worker was rejected: it's a new moving part, its months couldn't be shared with the list, and stopping at the first match makes the work small enough already.
- The other three have one sensible way each (below).



## How each works

### 1. Reminders

- **One event ("Add to calendar" in the card's ⋯ menu):** the event gets one alert.
  - Events with a time span (`span` or `window`): alert 1 hour before the start.
  - All-day events (no span): alert at 6pm the evening before, in the device's own time zone. *(Claude's call after review: Outlook only fires alerts before an event starts, and an all-day event starts at midnight, so "6pm on the day" would be dropped there.)*
- **"Add all to your calendar" (month-by-month list):** only favorited events get alerts; every other event is added without one.
- Alerts use the standard calendar-file alert block. Apple Calendar and Outlook show them. **Google Calendar ignores alerts inside imported files** and uses the person's own default notifications instead; nothing in the file can change that, so it's accepted.
- Alert text is the event's name.

### 2. Only my favorites

- A row at the top of Choose events, above "Show on calendar": a checkbox in the same style as the event types, colored `--beak`, labelled "Only my favorites", with a count on the right ("4 favorites").
- On: the calendar, the month-by-month list and its "Add all" show only favorited events. "Visible from here" and search still apply. The event-type list below fades to show it isn't in charge right now (it stays usable).
- No favorites: the row is disabled with the note "Star events to build your favorites."
- Saved with the other calendar choices, so it's remembered.
- *(Claude's call after review)* While there are no favorites, the saved setting is ignored (the calendar shows everything as usual) but stays saved, so it takes effect again once something is starred. This way un-starring the last favorite can never leave an empty calendar with a switch you can't use.
- *(Claude's call after review)* Home's Coming up does **not** follow this switch. It only looks 30 days ahead, so with just a few favorites it would usually be empty; favorites already stand out there with the yellow edge.

### 3. Jump to a month

- The month title becomes a button (small down-arrow, soft `--raised` background) that opens a panel just under it.
- Panel: ‹ year › at the top, then a 4 × 3 grid of month names.
  - The month on screen is filled (`--frost` background, `--ink` text).
  - The current month has a teal outline, matching today's teal circle.
- Range: last year through ten years ahead; the year arrows stop at the ends.
- Picking a month goes there and closes the panel. Escape or a click outside closes it and returns focus to the title. Arrow keys move between months; Enter picks.
- Works the same on phones (the panel fits the screen width).

### 4. Search "Next"

- The note under the calendar gains a button:
  - No matches this month: "No matches this month. **Next: Perseids · Thu, Aug 12, 2027 →**"
  - Matches this month: "3 matches this month. **Next after this month: Full Moon · Fri, Jan 22, 2027 →**"
  - While looking: "No matches this month. Looking further ahead…"
  - Nothing found: "No matches in the next three years."
- The search starts with the month after the one on screen, but never earlier than the current month *(Claude's call after review: searching the past is a non-goal, and the picker can show last year)*, and checks forward one month at a time, stopping at the first match. It follows the same filters as the calendar (event types, Visible from here, Only my favorites). It gives up after 36 months.
- Tapping the button, or pressing Enter in the search box, moves the calendar to that month and opens that event's card. From there, the note offers the following match the same way.
- The note keeps `role="status"` so screen readers hear the result.



## Left to the builder

- Where the look-ahead lives (a hook is natural) and how it yields between months; it must not block typing.
- The month cache holds 48 months (`LIMIT` in `monthEvents.js`); make sure a long look-ahead doesn't evict the months on screen and in the list.
- Opening the found event can reuse the existing deep-link path (`?event=` / `wanted` in `Calendar.jsx`).
- Exact wording of alert descriptions; panel and button styling within the mockup.
- Tests: alert lines in calendar files (timed and all-day; Add all only for favorites); favorites-only filtering and its saved setting; picker range limits; look-ahead stops at the first match, respects filters, and gives up after 36 months.
