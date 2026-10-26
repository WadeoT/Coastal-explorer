# V7 verification

Verification covers the built single-file game over localhost in headless Chromium, using the shipped Sunshine Coast map. The browser uses a software GPU; these are correctness checks, not a native Mac frame-rate benchmark.

## Checks

- `node tests/damage-model.cjs`: **9 passed**. Healthy engine for ten simulated minutes; independent engine, driver, oil, cooling and fuel consequences; geometric component rays; impact severity/location; malformed input and electric-vehicle fluid exclusions.
- `node tests/damage-browser.cjs`: **17 passed**, zero browser errors and no external requests. Safe repair before vehicle selection; actual scene/collider bullet hits; engine loss of power; radiator and oil leaks/seizures; correct live gauges; fire before explosion; lethal driver state; no revival by closing settings; mesh deformation and crash motion; small-bump survival; real police fire and a solid bullet barrier; cleanup after repeated vehicle selection; dark showroom/settings. A ray from the cockpit camera verifies the gauge panel is visible in front of the dashboard, and cockpit/fire/crash/settings screenshots are inspected.
- `node tests/v6.cjs`: **20 passed**, zero browser errors and no external requests. Existing map/water/building coverage, 16-vehicle catalogue, showroom purchases, manual gear controls, money/activities, five-star traffic identities, weather/lights, cameras, building collision, actual two-browser relay connection/collision/authority/cleanup, recorded-audio import and mobile shop layout.
- `node tests/browser.cjs`: **27 passed**, zero browser errors and no external requests. Complete geographic regression, native DEM seams, real building/roof rays, full driving ticks and traffic soak, police pursuit/escape, all twelve main destinations and sixteen smaller localities, keyboard/render loop, scenery refresh, quality settings, mobile menus and browser download.
- `node tests/engine-audio.cjs`: **4 passed**. Existing V8 pulse/spool, volume, inactive silence and RPM guards.
- `node tests/relay.cjs`: **5 passed**. Real relay identity/message validation, host authority, eight-player capacity, kicking and cleanup.

The pursuit regression now accepts a physically valid fatal component hit as a wreck, while continuing to reject simulation errors. Escape is checked with a fresh vehicle after the firing phase. The dedicated damage browser checks verify the lethal hit rather than requiring the player to survive every armed encounter.

## Release checks

The generated HTML resolves all build markers and contains the new damage modules/theme, runtime, fonts and unchanged real map payload. Packaging validates ZIP integrity and exact equality of the extracted and generated HTML. Public download/deployment checks are recorded in the release response after publishing.

No authentic engine recording, native Mac FPS result, newly deployed public matchmaking service, detailed soft-body physics or network-authoritative PvP component damage is represented as verified by this release.
