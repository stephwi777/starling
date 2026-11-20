# Clouds panel design

Date: 2026-11-19
Mockup approved: `.superpowers/brainstorm/60773-1795145333/content/clouds-c-v6.html` (direction C, stacked bars)

## Why

The Clouds tile says whether tonight is clear. Stargazers planning a night need more than that: which hours are clear, what kind of cloud is in the way, how clean the air is, and whether dew will fog their gear. The panel gives "all the advanced cloud information someone could need for stargazing" in a form a beginner can read.

## Goals

- Open from the Clouds tile exactly like the Moon panel: the same popover beside the tile, the same size, the same motion, a full-screen sheet on phones.
- A strip of nights, from the night before tonight to six nights ahead (8 nights), like Apple Weather's Wind panel: weekday letters, dates, the chosen night ringed in yellow, tonight in teal, ‹ › arrows, the full date written out.
- A stacked bar chart, one bar per hour from sunset to sunrise. From the bottom up: low clouds (frost), middle clouds (snow shade), high clouds (dim snow). The bar's height is the total cloud cover. The hourly row's cloud icon sits on hours that are 60% cloudy or more. A Low / Middle / High key sits under the hour labels.
- Picking an hour: tap or drag across the chart, or use the arrow keys. A yellow line under the bar marks the chosen hour. The rows below describe that hour.
- Rows: Cloud cover (with each layer's share), Transparency, Dew risk, Haze & smoke, Chance of rain. A "What's transparency?" note at the bottom.

## Non-goals

- Planning beyond about a week. That belongs to the future Calendar page.
- Seeing in this panel. Seeing has its own tile.
- A changing bottom note (parked idea from the Moon panel).

## Anti-goals

- Bars that make clear nights look cloudy. Clear hours have only a tiny stub.
- Changing the approved Moon panel's look or behavior.

## Approaches

1. **Shared popover shell (picked).** Move the Moon panel's placement, page-scroll lock, focus handling, light dismiss, arrow, scroller and motion into one `Popover` component. Moon and Clouds both render inside it. One place to fix later, and the other tiles (Darkness, Seeing) will reuse it. The risk is refactoring an approved panel, so it gets checked side by side afterward.
2. **Copy the Moon panel's shell into the Clouds panel.** It's faster today, but it duplicates about 120 lines of tricky focus and placement code that would drift apart.
3. **Native anchor positioning for the shell.** It isn't Baseline widely available, and the existing JavaScript placement already works and is tested.

The user handed over the how ("Implement"), so approach 1 is my call.

## Data

- **Forecast** (Open-Meteo, the existing request): add the hourly fields `cloud_cover_low`, `cloud_cover_mid`, `cloud_cover_high`, `dew_point_2m` and `precipitation_probability`, plus `past_days=2` so the night before tonight has data even after midnight. Hours are still matched by exact moment.
- **Haze** (Open-Meteo air-quality API, new, fetched only while the panel is open): hourly `aerosol_optical_depth` with `past_days=2` and `forecast_days=7`. Later hours come back null, which reads "Not forecast yet".
- The Tonight page passes its forecast to the panel through the outlet context.

## Words (my calls; the mockup used rough estimates)

- **Verdict** (big word), with thresholds matching the tile so the two never disagree:
  - Clear: under 20%
  - Mostly clear: under 60%, with low and middle clouds together under 20%
  - Patchy clouds: under 60%
  - High clouds: 60% or more, with low and middle clouds together under 20%
  - Cloudy: 60% or more
- **Line:**
  - thin high clouds only: "Only thin high clouds: bright stars and planets still shine through."
  - low clouds at 50% or more: "Low clouds block nearly everything."
  - clear: "A clear view of the stars."
  - 90% or more: "A solid deck of clouds; little gets through."
  - otherwise: "Clouds come and go; watch for gaps."
- **Transparency** (Excellent, Good, Average, Poor, Bad, the same words as Seeing): start at 5 and subtract for
  - haze: optical depth over 0.1, 0.2 or 0.3 takes away 1, 2 or 3
  - damp air: humidity over 70% or 85% takes away 1 or 2
  - thin high cloud: over 30% or 60% takes away 1 or 2

  At 80% total cloud or more, it reads "Hidden / behind the clouds".
- **Dew risk:** the gap between the temperature and the dew point, worked out in °C. Under 2.2° is High, under 4.5° is Some, otherwise Low. The small line reads "N° above the dew point" in the place's unit, or "At the dew point" when the gap is 0.
- **Haze & smoke:** optical depth under 0.1 is Very little, under 0.2 Light, under 0.35 Noticeable, otherwise Heavy. "Not forecast yet" when null, "Loading" while fetching, "Not available" if the request failed.
- **Chance of rain:** the forecast percent.
- **Missing data:** "Loading" or "No forecast" in place of the verdict, with the rows showing "—". A night with no dark hours reads "No night" and hides the chart.

## Behavior

- Opens on tonight at the current hour if it falls inside the night, otherwise the first fully dark hour, otherwise the first hour.
- Changing night keeps the same time of night (hours after noon), clamped to the new night's hours, like the Moon panel's calendar.
- The chart is a slider:
  - role="slider", with aria-valuetext like "11pm, Cloudy, 100% cloud cover"
  - Left and Right (or Up and Down) move an hour; Home and End jump to the ends
  - Page Up and Page Down change night
  - touch-action: pan-y keeps the sheet scrollable on phones
- Strip dates are 44px-tall buttons, with aria-current on the chosen night and an accessible name like "Tuesday, November 24, tonight". The arrows use aria-disabled at the ends and keep focus.
- The Clouds tile gets the same full-tile `.tile-link` as the Moon tile. Clicking any tile while a panel is open just closes that panel.
- The page title becomes "Clouds | Starling" while it's open.

## Left to the builder

File layout, class names, and how the shell and panels split props, all within the site's code style (section headers, minimal classes, theme tokens only).
