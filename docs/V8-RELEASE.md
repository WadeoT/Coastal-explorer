# V8 — Coastal Pursuit

26 October 2026. Builds on V7's component damage, black interface, manual LandCruiser, measured terrain and offline map.

## Flight and cockpit

Aircraft visuals and the camera interpolate between fixed physics steps. Helicopter cyclic and collective responses are damped, released cyclic levels the aircraft with stability enabled, and hover hold brakes horizontal movement. Physical collisions still use the simulation position.

Two original AW139-inspired rescue variants join the AS350: LifeFlight-inspired white/blue/yellow and RACQ-inspired yellow/blue. They are simplified game models, without an affiliation claim. Both have retractable wheeled gear and a deployable hoist. The AS350 retains fixed skids.

In FPV, click the labelled cockpit switches, or use J gear, I engine master, K searchlight, O hover hold, B rescue hoist, N navigation lights and P rotor brake. Gear cannot retract on the ground. Rotor brake requires engine off and a landed aircraft. The stability switch controls automatic levelling. Oil pressure, oil/coolant temperature, fluid levels and warnings remain on the cockpit instruments and corner monitor; that monitor is hidden in third person. C changes camera.

Aircraft maps show red airport exclusion circles and a fictional offshore training zone. Current AGL and gameplay limits appear in the HUD; violations turn the map red. Built-up areas have a 90 m minimum and the general ceiling is 900 m AGL. Airport exclusions extend to their labelled ceilings. These are **fictional game rules, not official aviation charts or legal flight advice**. Mission landing areas grant local clearance. After an 18-second takeoff grace and four-second warning, continued unauthorized flight raises wanted heat; persistent violations reach five stars and launch two interceptor fighters. Their warning, approach and cannon bursts use actual moving actors and line-of-sight checks.

## Driving, police and work

Linked road drifts build a multiplier up to ×8 and bank after straightening. Road speed streaks require sustained speed above 120 km/h; off-road, airborne, teleported and inactive movement does not qualify. Crashes lose unbanked skill rewards. Ordinary movement still pays nothing.

Five-star police have stronger acceleration, a higher bounded top speed, predictive pursuit, wider searches and a longer escape timer. They escalate suppression fire during sustained fast pursuits. Active five-star survival pays in increasing 15-second intervals; escaping after a meaningful chase adds a bonus. Owner test states cannot farm skill rewards.

Activities now depend on the vehicle: helicopter passenger shuttles; rescue medical transfers and hover/hoist extractions; ute supply runs; bicycle coffee delivery; boat river taxis; sedan rideshare; 4×4 survey work; fighter airshow checkpoints; and a kart-only race. Boarding and unloading require the right height/speed and a timed stop. Jobs reject incompatible vehicles, skipped travel and teleporting, and pay once. Landing sites are approximate game clearings, not certified helipads.

A solid 120 km/h wall hit directionally crushes the actual vehicle mesh, damages components and leaves a fatal wreck at the wall without the previous bounce/launch. Lesser crashes can still be driven away from; repair restores the model. This is an arcade deformation model, not a full soft-body simulation.

The fighter costs **A$5 million** as a game balance choice. There are 18 selectable vehicles. The existing LandCruiser clutch, stalling, RPM-dependent drive and turbo-diesel V8 synthesis remain. No genuine engine recording has been added.

## Geography and buildings

Kuluin appears at regional map zoom and searches also accept “Kulin”. All 250 named places and 28,596 known building outlines are preserved. Every mapped footprint intersecting the configured nearby building window is generated. Residential infill uses fixed world tiles and deterministic spacing, so nearby houses do not change with the camera position. Building windows are 2.5, 3.6 or 4.8 km in settings; small facade details have a shorter distance to control rendering cost. New scenery is prepared asynchronously and replaces the prior scenery together.

OSM does not include every actual house. Gap-filling houses remain explicitly estimated and can be disabled. Increasing render distance increases CPU/GPU/memory cost; this release does not promise every real-world house, satellite fidelity, or a measured Mac frame rate.

## Public multiplayer and owner controls

With a relay configured, choosing DRIVE / LAUNCH automatically enters an available public room. Sharing the relay-configured link allows friends to join it; a full room creates another public room. Private invitations remain available. Public rooms survive their first player's departure. Remote movement uses smoothed position and shortest-angle rotation.

Only a relay-side private `OWNER_ADMIN_TOKEN` unlocks administration. Being the first player or room host grants no admin powers. The owner can set their own balance, gift money, set any connected player's balance/wanted level, repair/damage/ignite/explode/freeze players, teleport them, grant/select vehicles, start/cancel compatible jobs, trigger interceptors, ban/unban/kick, and change time, weather, capacity, reward multiplier and police settings. These are enumerated supported actions, not arbitrary code execution. See `help` in the console.

The relay persists issued player identities, bans, pending gifts and settings. Deployments need durable storage to retain these across redeploys. Guests are anonymous browser identities: clearing storage or using a new browser can bypass an identity ban. Vehicle simulation, police and ordinary career earnings remain client-side, so this is cooperative free roam rather than an authoritative competitive economy or shared combat server.

**Hosting status:** the GitHub client can be published directly. Netlify configuration is included, but no Netlify site or external relay has been created in the user's account. Internet public rooms and private owner access require the deployment steps in [NETLIFY-MULTIPLAYER.md](NETLIFY-MULTIPLAYER.md). Local two-browser verification is not a claim of a live internet relay.
