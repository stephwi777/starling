# Tonight: Hours Card

Second real component of Tonight (after the Moon tile). The user approved this design on 2026-11-18.

## Why

The top box tells someone at a glance how tonight unfolds hour by hour: when it gets dark, when clouds come and go, and when the Moon gets out of the way.

## The hourly row

From sunset to sunrise, in time order, for the visitor's place and tonight.

**Whole hours** between sunset and sunrise:

- Sun higher than 18° below the horizon: "Twilight".
- Otherwise, from the forecast's cloud cover for that hour: under 20% "Clear", under 60% "Patchy", otherwise "Cloudy".
- No forecast (loading or failed): "Dark".

**Moments**, highlighted, at their exact times: Sunset, Fully dark, Moonrise and Moonset (only between sunset and sunrise), Twilight (when morning twilight begins, the Sun 18° below the horizon; called Dawn until 2026-11-19), Sunrise. A moment without a time (for example no full darkness in summer far north) is left out.

**Icons** (chosen 2026-11-19 from the icon sheet): Sunset and Sunrise (half Sun with short rays and a down or up arrow), Twilight (the Sun just below the horizon), Fully dark (yellow twinkle), Clear (three white twinkles), Patchy (cloud with a white star peeking out), Cloudy (solid cloud), Dark (three dim twinkles), Moonrise and Moonset (crescent with the arrow tucked into its curve).

## The summary sentence

Up to two short sentences.

1. **Clouds**, over the dark hours (all night hours if it never gets fully dark):
   - All clear: "Clear all night." All cloudy: "Cloudy all night." All patchy: "Patchy clouds all night."
   - Otherwise the first change from how the night starts: clear to patchy "Patchy clouds roll in around 1am.", clear to cloudy "Clouds roll in around 1am.", cloudy or patchy to clear "Clouds clear around 11pm.", patchy to cloudy "Clouds thicken around 2am.", cloudy to patchy "Clouds start to break around 2am."
   - Forecast loading: "Checking the forecast…". Forecast failed: "The forecast isn’t available right now, so clouds aren’t shown."
2. **One thing worth knowing**, the first that applies:
   - A shower giving at least 8 meteors an hour at its best tonight: "Leonid meteors are best after the Moon sets at 12:40am." when the Moon sets during the night, otherwise "Leonid meteors are best after midnight."
   - The Moon sets during the night: "The Moon sets at 1:30am, leaving darker skies."
   - The Moon rises during the night: "The Moon rises at 10:15pm."

## Non-goals

The sky band, the Darkness, Clouds and Seeing tiles, Next 7 nights and Up tonight stay as samples. No night picker yet.

## Builder's calls

- Word rules live in a new `src/sky/hours.js` with tests. Moon rise and set reuse the sunset-to-sunrise crossings from `src/sky/moon.js`.
- Tonight fetches the forecast with `useForecast` the same way Home does and passes it to `useNight`.
- Shower names drop the trailing "s" and add "meteors" ("Leonids" → "Leonid meteors").
