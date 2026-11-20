# Seeing panel design

Date: 2026-11-20
Mockup approved: `.superpowers/brainstorm/60773-1795145333/content/seeing-v2.html`

## Why

Seeing answers "will my telescope show a sharp view?" The user wanted the panel easy to understand, with nothing repeated from the Clouds or Darkness panels. The tile used only jet stream speed, which misses most of what blurs a view.

## Goals

- **Open from the Seeing tile** with the shared `Popover`, like the other panels, and show the same night strip.
- **Chart:** five dots per hour from sunset to sunrise. Teal dots show the hour's score (1–5); tap, drag or use the keys to pick an hour, and a yellow line marks it.
- **Verdict:** the word (Excellent, Good, Average, Poor, Bad), "at 11pm", and the existing line ("Stars will twinkle a little.").
- **Rows:**
  - **High winds:** Calm, Light, Moderate, Strong or Very strong, with "35 mph, 34,000 ft up" (or "56 km/h, 10 km up" outside the US).
  - **Air layers:** Smooth, Some churning or Churning, with "moving together", "some sliding past each other" or "tumbling into each other".
  - **Ground wind:** Steady, Gusty or Very gusty, with "7 mph, gusts 16".
  - **Best for:**
    - Excellent: planet detail, close double stars
    - Good: Moon and planets
    - Average: the Moon and bright objects
    - Poor or Bad: wide views with binoculars
- **Note:** "What is seeing?", saying it matters for telescopes and barely for eyes.
- **Tile:** same look. Its score becomes the average of the hourly scores over the fully dark hours, so the tile and panel agree.

## Non-goals

- Temperature layers and boundary-layer depth (hard to explain, and they overlap the rows above).
- Clouds, haze, dew and darkness, which live in their own panels.

## Approaches

1. **Score each hour from three causes, and reuse the panel pieces (picked).**
2. **Keep the jet stream only.** Simpler, but it misses ground gusts and churning layers, so the panel could only show one row.
3. **A published seeing formula** (Trinidad-style or similar). Its numbers would be hard to explain on screen, and it needs data the forecast doesn't give.

## Scoring (my calls, as mocked up)

- **Inputs per hour, in m/s:**
  - jet stream: wind speed at 250 hPa
  - layers: the largest vector difference between neighboring levels at 850, 700, 500 and 250 hPa, using speed and direction
  - ground: gusts at 10 m
- **Levels:**
  - jet: 10, 20, 30 and 40 split it into levels 0–4
  - layers: 10 and 18 split it into 0–2
  - gusts: 7 and 11 split it into 0–2
- **Score** = 5 − jet − layers − ground, kept between 1 and 5.
- **The night's word** is the rounded average of the fully dark hours. It adds "Steadiest around X." when the best and worst hours differ by 2 or more.
- **Forecast request:** add the hourly fields `wind_speed_850hPa`, `wind_speed_700hPa`, `wind_speed_500hPa`, `wind_direction_850hPa`, `wind_direction_700hPa`, `wind_direction_500hPa`, `wind_direction_250hPa` and `wind_gusts_10m`.

## Left to the builder

File layout and class names, within the site's code style.
