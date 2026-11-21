# Calendar page

Approved direction 2026-11-20 from mockups/calendar-big.html, with Google Calendar's month view as the reference. The user asked to build the first draft straight away and refine it on main.

## Why

So nobody misses something special in the sky this year. Sky conditions stay on Tonight (forecasts only matter a day or two ahead); the Calendar is about *what* happens and *when*. It is the destination of the home page's Coming up card and Tonight's Next 7 nights card.

## Goals

- A big, readable month calendar is the heart of the page.
- Every kind of event we can compute, with a checklist of which kinds to show. Well-known kinds start on, lesser-known ones start off.
- A Visible from here / Worldwide switch (starts on Visible from here).
- A search box.
- A closed "All events, month by month" list at the bottom that opens to show the next twelve months.
- More detail than the tiles: clicking an event opens a card with times, where to look, brightness, the Moon that night.

## Non-goals and anti-goals

- No weather or "is tonight good" here (that is Tonight).
- No Moon phase drawn in every day square (rejected as redundant).
- Not glassy or busy; same solid, rounded Finch-like cards and palette as Tonight.

## Approaches considered

- A · Month grid with a Moon in every square: rejected, redundant and cramped.
- B · List by month only: kept as the closed list at the bottom.
- C · Small grid plus list: replaced by the big Google-style grid.
- **Chosen:** big month grid with colored event chips, a checklist sidebar, search, the switch, a detail card, and the list below.

## Event kinds (first draft, all computed on the device)

| Group | Kind | Starts |
|---|---|---|
| Moon | Full Moon (with traditional name in the north) | on |
| Moon | New Moon | on |
| Moon | Supermoon | on |
| Moon | Blue Moon | on |
| Moon | First and last quarter | off |
| Moon | Micromoon | off |
| Moon | Black Moon | off |
| Moon | Perigee and apogee | off |
| Moon | Moon crossing the Sun's path (nodes) | off |
| Eclipses and transits | Solar eclipses | on |
| Eclipses and transits | Lunar eclipses | on |
| Eclipses and transits | Mercury and Venus transits | on |
| Planets | At their best (opposition for outer planets, greatest elongation for Mercury and Venus; merged 2026-11-20) | on |
| Planets | Venus at its brightest | on |
| Planets | Mars closest to Earth | on |
| Planets | Close pairs of planets | on |
| Planets | Moon near a planet | on |
| Planets | Planet parades | on |
| Planets | Turning points (retrograde starts and ends) | off |
| Planets | Behind or in front of the Sun (conjunctions) | off |
| Planets | Closest and farthest from the Sun | off |
| Meteor showers | Major showers | on |
| Meteor showers | Minor showers | on |
| Sun and seasons | Equinoxes and solstices | on |
| Sun and seasons | Earth closest and farthest from the Sun | off |

Occultations are agreed as off and come later with comets, asteroid flybys, aurora and space station passes (those need online feeds). Fireballs and flares cannot be scheduled.

An event can belong to more than one kind (a full Moon that is also a supermoon); it shows when any of its kinds is checked.

## Visible from here

- Events that happen for everyone (Moon phases, seasons, perihelion, conjunctions with the Sun, turning points) always show.
- Location-dependent events show in Visible from here only when they can actually be seen: eclipses (any part, with the local amount and times), transits (Sun up), planet and Moon pairings, oppositions and elongations (the objects are above the horizon while it is dark), parades, and meteor showers (radiant gets high enough).
- Worldwide adds the rest, drawn dashed, with a plain line on where they can be seen ("centered over the South Atlantic") or why not ("too close to the Sun").

## Placement and time words

- Each event sits on the local date of the night you would look (an event best seen at 2am sits on the evening before), in the chosen place's time zone.
- Moments show a clock time; night events show Evening, Late night, Before dawn or All night, with the viewing window in the card.

## Page

Revised 2026-11-20 after the first draft: on wide screens (above 1180px) the calendar fills the whole screen width and height; the big Calendar title and place line sit at the top of the left column above the checklist, and search plus the switch sit in the month's header row after Today ‹ › and the month name (Google order). Rows fit their events and then stretch to fill the screen. Tablets and phones (900px and below) use colored bars with a tap-to-list day view, and swiping left or right changes the month with a short slide. Ideas for later: tapping a day or week to see exact timeframes, and adding events to the user's own calendar app.

- No sky band (only Home and Tonight have one). Title, a one-line subtitle naming the place, then search, the switch and (on phones) a Choose events button.
- Desktop: checklist sidebar on the left (grouped, color swatches, x/y counts), month grid on the right with Today and ‹ › buttons. Chips show icon and name, colored by group (Moon cream, eclipses rose, planets bronze, meteors teal, Sun and seasons beak). Chip names wrap to two lines rather than being cut.
- Phones: chips become colored bars; tapping a day lists its events underneath; the checklist opens from Choose events.
- Detail card: opens from a chip or a list row; closes on ✕, Escape or a click outside; focus moves in and back.
- The checklist and the switch are remembered on the device.

## Left to the builder

Exact thresholds (pairs within 2°, Moon within 4°, parades of four or more bright planets after dark), wording, spacing, and the region names used for "where it can be seen".
