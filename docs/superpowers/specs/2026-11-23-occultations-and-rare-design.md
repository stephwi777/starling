# Occultations and the Rare tag — design

Agreed in conversation 2026-11-23.



## Intent

- **Occultations:** add the moments the Moon passes in front of a bright star or planet and hides it. From one place they're rare (Kansas City: about 2 after dark in two years; Sydney: about 4), which is what makes them worth flagging.
- **Rare tag:** a small tag on events that come around less than about once a year where you are, so the unusual ones stand out without a new visual. This replaces the old "make rare events stand out" idea.



## Goals

- **New event type** "Moon covers a star or planet" in the Moon group, **on by default**.
  - **Targets:** the same bright stars as "Moon near a bright star" (Pleiades, Beehive, Aldebaran, Regulus, Spica, Antares), plus Mercury, Venus, Mars, Jupiter and Saturn.
  - **Only events seen from your place.** The Moon and the target must both be up. Worldwide adds nothing for this type, because one happens somewhere almost every month.
- **When they're visible:**
  - **Dark sky** (Sun below −6°): any target.
  - **Daytime or twilight:** only Venus and Jupiter, tagged **"Daytime"**. The note explains that you'll need binoculars or a telescope.
  - Every other daytime occultation is dropped.
- **No double listing:** when an occultation happens, it replaces the "Moon near …" event for that same pass.
- **The "Rare" tag** goes only on events seen from your place that are:
  - a total or partial lunar eclipse
  - any solar eclipse
  - a Mercury or Venus transit
  - Mars at its closest
  - a planet pair closer than 0.5°
  - an occultation

  Blue Moons and Black Moons keep their own tags and don't get "Rare". Eclipses seen only elsewhere don't get it either.



## Non-goals

- Showing *where* on Earth an occultation is seen.
- Occultations of faint stars, asteroids or anything outside the target list.
- A Favorite tag. Favorites stay a personal mark (the yellow edge); tags describe the event itself.



## Approaches considered

- **Calculate them locally (chosen):** test, for this place, whether the Moon's edge covers the target, using the same library and the existing Moon-and-star passes. No outside data, so it works offline and matches every other event.
- **A published occultation feed:** rejected. It needs an online service and its own caching, and it's another moving part for a few events a year.



## How it works

- **Finding them:** for each Moon pass of a target (the existing pass search in `starEvents.js`, plus planets), check the separation as seen from your place near closest approach. An occultation happens when that separation is smaller than the Moon's apparent radius. For the Pleiades, the cluster's radius (about 0.5°) is added, since the Moon hides some of its stars.
- **Disappear and reappear times:** found by stepping and refining, the same way pass times are refined now.
- **Card:**
  - **Title:** "Moon covers Regulus" (or "Moon covers Venus").
  - **Chip and phone label:** "Moon covers Regulus" and "Regulus".
  - **Note:** "The Moon passes in front of Regulus, the heart of Leo the lion, hiding it for 48 minutes." Daytime ones add the binoculars or telescope sentence.
  - **Rows:** "Disappears" and "Reappears" times, plus Look and Moon (how much is lit).
- **Favorites:** the subject key is `occultation:{target}`, labelled "every time the Moon covers {target}".
- **Icon:** a crescent Moon with a small star tucked half behind its edge. It will be mocked for approval before it's final.
- **The Rare tag** is added by each event's own code where the rule above applies, so it shows in chips, rows, cards and search like other tags.



## Left to the builder

- Exact step sizes for the search and refinement, within the existing patterns.
- Tests:
  - known occultations are found: the Kansas City Pleiades occultation of September 21, 2027 after dark, and the Sydney Antares occultations of 2027
  - daytime star occultations are dropped
  - the "near" event is replaced, not duplicated
  - the Rare rule includes the listed cases and excludes eclipses seen elsewhere, Blue Moons and wide planet pairs
