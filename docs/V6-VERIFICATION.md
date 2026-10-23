# V6 verification

Audio follow-up: the four audio-render checks and 20 game feature checks passed again on 23 October 2026. Geography and relay-only results below are retained from the V6 baseline; those sources and the map data are unchanged in this audio update.

- `npm run test:audio`: **4 passed**. Actual offline Web Audio renders verify the 750 RPM / 50 Hz V8 pulse relationship, unclipped output, gradual turbo spool/decay, mute/inactive silence, stop fade and RPM bounds. No external samples are bundled.

- `npm run test:geography`: **27 passed**, no browser errors and no external requests. Includes coast-wide real data, 250-place access, native DEM border agreement, terrain/road contact, bridges, roofs, building inclusion in twelve main destinations and sixteen smaller localities, five simulated minutes, pursuit/traffic, actual keyboard rendering, mobile settings and complete offline download.
- `npm run test:fleet`: **20 passed**, no browser errors and no external requests. Includes 16-vehicle catalogue, Mudjimba land/water separation, mapped-plus-estimated house coverage, buying/launching a kart, manual clutch/gears, zero distance payments, five-star identities/escalation, weather/night/lights, counterattack, chopper/jet/boat views, actual map pointer pan and Mudjimba click travel, race checkpoint/teleport guards, delivery reward once, building crash, two connected relay browser clients, remote collision, host authority, cleanup, turbo-diesel V8 activation/mute/vehicle switching, imported audio replacing both synthetic layers, and 390 px shop layout.
- `npm run test:relay`: **5 passed**. Server assigns identities, rejects malformed states and guest environment/kick messages, accepts host settings, kicks guests, enforces eight players and removes all participants when the host leaves.
- Final focused browser check passed for aircraft nose/velocity agreement, stable finite cockpit camera, forward weapon hits and abbreviated street/address normalisation. Final showroom renders inspected for AS350 and fighter.
- Geographic JSON-value equality confirmed for all original `ways`, `points`, `buildings` and raw `terrain` rows after the native-grid refinement.
- Release ZIP integrity checked and extracted HTML matched the generated `index.html`; relay source and Render blueprint included.

These checks ran in headless Chromium with a software GPU over localhost. They are not a native Mac frame-rate benchmark. Direct `file://` navigation and usable WebRTC candidates are blocked in this managed browser; those paths are not represented as passing tests. Internet multiplayer requires deployment of the supplied relay; no cloud account was available for that deployment. No authentic licensed LandCruiser engine sample is bundled.
