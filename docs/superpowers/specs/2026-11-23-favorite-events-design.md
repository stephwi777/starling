# Favorite events — design

Approved in conversation 2026-11-23. Replaces the parked idea of the site deciding which events are "rare" and making them stand out (`mockups/calendar-rare.html`, none of whose looks the user liked).

Mockup: `mockups/calendar-favorites.html` (look C and the star button on the card were chosen).



## Intent

Instead of Starling guessing which events matter, a visitor marks the events they care about, and those events carry a mark wherever they appear. Stargazers follow kinds of events year after year ("I never miss the Perseids"), so one favorite covers that subject every time it comes around, not one date.

Success: someone stars the Geminids once and, from then on, every Geminids peak on the Calendar, in the month-by-month list and on Home's Coming up card is easy to pick out, with no extra setup.



## Goals

- Favorite a subject from an event's card, and un-favorite it the same way.
- Every event with a favorited subject gets the mark: the month grid (big chips and phone labels), the "All events by month" list, and Home's Coming up card.
- Favorites are saved in this browser, like the event checklist.
- Favorited events always show, even when their type is turned off in Choose events.



## Non-goals

- Accounts, syncing between devices, reminders or notifications.
- A separate "favorites only" view or a favorites list page. (Could come later.)
- Changing which events the Calendar computes.



## Anti-goals

- A favorite that silently stops matching (for example after a rename, a new year or a location change).
- Any star-shaped mark on the calendar itself: stars on this site mean real stars, so the calendar mark is a yellow edge, not a star.
- Making the calendar busier: no glows, tints or extra strips (all rejected in the rare-events round).



## Decisions made with the user

- **What a favorite covers: the same subject, every time.** Favoriting the Geminids marks every Geminids peak, but not the Ursids. Jupiter at its best marks Jupiter each year, not Saturn. Moon near Antares marks every Moon–Antares pass, not Spica. Events that are already one subject (Full Moon, solar eclipse) mark every one of them.
- **The mark is C · yellow edge.** Big chips get an inset 3px `--beak` stripe on the left (padding nudged so text doesn't touch it). Phone labels get the same stripe. Rows in the month-by-month list get a 4px stripe. No star.
- **The card keeps a star button.** It sits in the card's top tools, left of the ⋯ menu, 36px round like the others. Off: outlined star in `--mist`. On: filled star in `--beak`. It is a toggle (`aria-pressed`) labelled "Favorite every Geminids peak". Its tooltip says what it covers ("Favorite every Geminids peak"). Only when something is favorited does a line under the title say "In your favorites: every Geminids peak." (The "Tap the star…" prompt was removed 2026-11-23: too busy.)
- **Each event says its own subject** (not a shared rule that guesses from names).



## Approaches considered

1. **Each event says its own subject (chosen).** Every event generator adds subject keys and the words for them. Exact, testable, survives renames, new years and location changes. Touches every event file, one small addition each.
2. **One shared rule.** A single function guesses the subject from kinds and names. No generator changes, but names vary ("Full Cold Moon", "Comet Lemmon arrives"), so favorites could quietly break. Rejected for that reason.
3. **Favorite single dates (event ids).** Rejected by the user in favor of "every one like it". Ids also include exact times, which can shift.



## How it works

### Subjects on events

Every event gets `subjects`: a list of `{ key, label }`, main subject first.

- `key` is a stable string that never includes a date or time, for example `shower:Geminids`, `full-moon`, `opposition:Jupiter`, `moon-star:Antares`, `planet-pair:Jupiter+Venus` (names sorted so either order matches), `comet:<comet id>`.
- `label` finishes the sentence "Favorite …": "every Geminids peak", "every Full Moon", "every time Jupiter is at its best", "every time the Moon passes Antares", "every time Venus and Jupiter meet".
- Extra subjects cover events that are several things at once. A Full Moon that is also a supermoon has `[full-moon, supermoon]`; a New Moon that is a Black Moon has `[new-moon, black-moon]`. The star favorites the main subject; each extra subject gets its own item in the card's ⋯ menu ("Favorite every supermoon" / "Remove every supermoon from favorites").
- An event is a favorite when any of its subject keys is favorited.

Suggested subjects per kind (the builder fills in the exact key and label wording, following the pattern above):

| Kind | Main subject |
|---|---|
| full-moon, new-moon, quarter-moon, moon-node, solar-eclipse, lunar-eclipse, parade, venus-brightest, mars-closest, milky-way (begins and ends share one) | one subject for the kind |
| supermoon, micromoon, blue-moon, black-moon | extra subjects on the Full or New Moon |
| moon-distance, earth-distance | one each for closest and farthest |
| moon-star, moon-planet | per star / per planet |
| opposition, station, solar-conjunction, planet-distance, transit | per planet |
| planet-pair | per pair of planets |
| planet-star | per planet and star |
| major-shower, minor-shower | per shower |
| season | per season (March equinox, June solstice, …) |
| comet, telescope-comet | per comet |

### Saving

Favorites live in their own localStorage entry (`starling.favorites`), following `calendarStorage.js`: a version number, a list of subject keys, safe fallback to empty on bad data, and try/catch around every read and write. Keys whose events no longer exist stay saved (a comet may come back in the data later); they simply match nothing.

A small hook (like `useCalendarSettings`) exposes `favorites`, `isFavorite(event)` and `toggle(key)`. Home's Coming up card reads the same storage.

### Showing favorites

- `shownEvents` lets a favorited event through even when its kind is unchecked. "Visible from here" and search still apply.
- `upcoming` (Home) does the same, so a favorited subject turned off in the checklist can still appear on Coming up. Favorites get no special place there: Coming up stays the next 3 events in date order (user's decision), and a favorite shows only if it falls within those 3.
- Chips, phone labels, list rows and Coming up rows get a `fav` class and the yellow edge.
- Screen readers: favorited chips, labels and rows include "Favorite" in their accessible name (for example visually hidden text), since the stripe alone is visual only.



### Calls made after the builder check (Claude's calls; the user can overrule)

- **Card when only an extra subject is favorited.** The star always means the main subject. The line under the title names every favorited subject of this event, for example "In your favorites: every supermoon." If none is favorited it says "Tap the star to favorite every Full Moon." Extra subjects are added and removed only from the ⋯ menu.
- **Favorites first within a day.** Within each day, favorited events sort ahead of the rest, on every screen size, so the phone grid's two labels show a favorite before falling back to "+N". Keyboard order follows the same order.
- **Un-favoriting while the card is open.** An event that is only on screen because it is a favorite stays shown until its card closes, so focus can return to it. It disappears after that.
- **No note in Choose events** explaining that favorites always show; the yellow edge is the explanation. Revisit if it confuses people.
- **Comet keys use the comet id.** A comet that later gets a permanent number changes id and loses its favorite. This is rare and accepted.



## Left to the builder

- Exact key strings and label wording, following the pattern and the table.
- Where the hook and storage file live, and how state is shared between the card and the grid.
- Whether ⋯ menu items for extra subjects appear only when the event has extras (it should not show an empty section).
- Tests: every generator gives every event at least one subject with a date-free key; the same subject on two years' events produces the same key; storage round-trips and survives junk; favorited events pass `shownEvents` with their kind off.
