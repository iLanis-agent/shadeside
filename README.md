# ShadeSide

Which side of the bus, car or plane should you sit on to keep the sun out of your eyes?
Pick a city, time, and direction of travel - ShadeSide computes the sun's real position
(azimuth + elevation) for that exact place and moment, works out which side of the
vehicle it shines on, and tells you to sit on the other one. It also rates the glare
(low sun is the blinding kind) and handles night rides honestly.

- No signup, nothing to install - pure static HTML/JS
- Handles timezone and DST correctly per city via the Intl API
- `engine.js` holds the solar math (suncalc-style position algorithm) and side logic as
  pure functions, shared between the app and node tests

## Use it

Open `index.html`, or visit the deployed site.

## Run locally

Any static server works:

```
python3 -m http.server
```

Then open http://localhost:8000/.

## Engine tests

The node suite validates the solar math against hand-computed values (Tel Aviv solstice
solar noon due south at elevation 77-81, winter noon ~186 deg at 34 deg up, Sydney winter
noon due north, night below horizon), timezone/DST offsets, the side-of-vehicle logic
including wraparound, and glare bands.
