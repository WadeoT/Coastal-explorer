# Coastal Explorer — active delivery backlog

Version naming: planned V29 is v1.2.9, with subsequent bundles using the same dotted format. Older published V-number links remain valid. See [version history](docs/VERSION-HISTORY.md).

Requests accumulate here. Work is ordered by dependencies and published in tested version bundles. Publishing one bundle does not close unfinished requests in later bundles.

## V27 — published (admin, streaming and baseline performance)

- [x] Signed public-lobby money and vehicle grants with delivery acknowledgements, replay protection and a separately supplied private owner key.
- [x] Local admin code continues to control the owner's own player.
- [x] Explicit persistent solo/offline option; no automatic reconnect while solo.
- [x] Friends can see chase police/interceptors on screen and maps (chases remain client-simulated).
- [x] Complete scenery replacement, pooled GPU textures, Balanced default and adaptive resolution/shadows.
- [x] Compact previews reduced the client from roughly 46.7 MB to 33.6 MB.
- [x] Gradual visible fuel pooling and a pre-fire warning.

## V28 — published: smooth driving, controls and crumple zones

- [x] Saved selectable graphics/performance presets and individual workload controls, including Battery Saver.
- [x] Profile and reduce model draw calls; batch wheel geometry while preserving suspension/detachment.
- [x] Cache NPC model selection and avoid increasing the active NPC pool.
- [x] Fix trapping after hitting a low roundabout island while keeping taller obstacles solid.
- [x] Fix closed roundabouts ignoring exits; route through intermediate junctions.
- [x] Improve NPC route diversity and avoid repeatedly looping the same roads.
- [x] Smooth suspension over paved-road height changes while retaining terrain gradients.
- [x] Fix on-foot camera clearance and unwanted look-direction recentering.
- [x] Garage spawn selector: current area, named suburb/airport or chosen map point.
- [x] Fighter ATC directs to Sunshine Coast Airport, active runway/approach markers and a top heading compass.
- [x] Private waypoints have visible sky columns and distance guidance.
- [x] H dismounts bikes; remove F2 and conflicting help hints.
- [x] Fix wheelie/trick physics while admin test mode is active; support lower-speed starts.
- [x] Front/rear crumple zones, side-impact energy absorption, stronger passenger cell and persistent used crush travel.
- [x] Stronger visible dents from front, rear and angled impacts; bound active deformation CPU cost.
- [x] Light-blue fuel pools and trails from moving vehicles.
- [x] Cap unnecessary rendering work for battery/CPU savings; keep quality/render-distance options.
- [x] Package, publish and verify deployment.

## v1.2.9 — verified bundle: shared driving, PvP and traffic crash fix

- [x] Make visible dents easier to sustain and activate permanent front/rear/side crumpling at lighter impacts.

- [x] Prefer common crash fuel leaks followed by delayed ignition/fire; reduce instant impact explosions to exceptional hot, fuel-loaded tank failures.
- [x] Fix the reported createTrafficCar material crash during civilian-model recycling; verify every traffic-eligible profile.
- [x] Solid player-to-player vehicle and on-foot collisions, with impact damage.
- [x] Player attacks damage other players and their vehicles; visible remote damage.
- [x] Board a friend's car as a passenger and move with the driver.
- [x] Correct passenger cameras/avatars; leave moving vehicles with injury risk.
- [x] Handle driver disconnect/death and prevent passenger/driver self-collisions.
- [x] Bound/rate-limit/validate community combat messages; document client-authority limitations.
- [x] Two-client collision, damage, passenger and disconnect tests; publish verified bundle.

## v1.3.0 — performance bundle

- [x] Profile the existing real-map simulation and map drawing.
- [x] Cache static minimap geography/roads in one bounded overscan canvas; retain live contacts, airspace, jobs and waypoint markers.
- [x] Spatially index natural-map areas for local views, preserving complete regional coverage.
- [x] Invalidate on movement, imagery updates, resize and expiry; verify performance and publish.

## v1.3.1 — graphics and supplied architecture pilot

- [x] Validate and integrate the supplied 100 source-backed building records without duplicates.
- [x] Preserve observed storeys, unknown visual attributes and source attribution; never use raw roof elevations as heights.
- [x] Add batched nearby window frames and sills with bounded detail budgets.
- [x] Verify real-map rendering and package the graphics/data bundle.

## v1.3.2 — lighting and surface graphics

- [x] Day/night/weather sky gradient and tone mapping/contrast.
- [x] Shared surface-normal textures, stronger vehicle highlights and water relief; Low skips relief.
- [x] Browser/screenshot verification, package and publish.

## v1.3.3 — impact deformation and hijack identity

- [x] Persistent local crease offsets alongside the bounded node/beam solver, across all vehicle classes.
- [x] Fair deformation scheduling for multi-vehicle pileups within the existing four-cage CPU budget.
- [x] Hijacked exteriors preserve source geometry/paint/modifications and damaged bodywork.
- [x] Borrowed vehicles bypass career paint/tuning; share bounded paint/tuning snapshots with peers.
- [x] Browser and public-lobby regression checks; publish.

## v1.3.4 — living coast environment

- [x] More varied rounded foliage, grass and destructible scrub with road/building/workshop exclusions.
- [x] Expanded drifting clouds, weather-dependent colour/coverage and quality controls.
- [x] Calm/moderate/rough sea states with wind, swell, foam and boat response; sheltered-water damping.
- [x] Verify real-map environment in Chromium and analytic wave/geometry checks.
- [x] Package and publish the tested bundle.

## v1.3.5 — startup recovery hotfix

- [x] Tie loading-screen dismissal to successful map/showroom loading instead of all scene resources.
- [x] Show current map-building stage and expose startup/map errors above the overlay.
- [x] Recovery buttons after 25 seconds: reload or low graphics, retaining career data.
- [x] Yield during map feature decoding to let progress/recovery UI update.
- [x] Verify actual loading UI, map-failure path and low-graphics recovery; package and publish.

## v1.3.6 — visible impact and road/camera corrections

- [x] Exaggerated persistent folds and surface-attached impact shading for player/NPC vehicles, with earlier part detachment.
- [x] Independent geometry and full mesh/colour repair; retain bounded damage update and debris budgets.
- [x] Walking camera follows the player, resets vehicle camera state on exit, continuous orbit mouse look and proper first-person pitch.
- [x] Include shoulders and two opposing lanes in motorway/trunk width estimates; verify narrow-tagged Sunshine Motorway sections near Coolum.
- [x] Verify collision/camera/road regressions, package and publish.

## v1.3.7 — next: combat vehicles and fleet expansion

- [ ] Tank with aimable turret, finite shells/reload, physical projectiles and destructive blast effects.
- [ ] Verify shells damage actual buildings, obstacles and vehicles.
- [ ] Kawasaki Ninja H2R and Ducati motorcycles, shop profiles, tuning and controls.
- [ ] Another 200 named production models/generations in shop and weighted NPC selection; render actual previews.
- [ ] Preserve measured Queensland road-volume/heavy shares; label individual model frequencies and specs as estimates.
- [ ] More aircraft/vehicle breakup, detachable pieces and stronger crash damage presentation.
- [ ] Place regional airfields/runways at verified real coordinates, with mapped aprons and spawn points.
- [ ] Park usable unarmed light aircraft (including a Cessna-style plane) at airfields; on-foot entry/hijack and takeoff.
- [ ] Add multiple propeller aircraft profiles to shop and NPC traffic, with appropriate propulsion, controls, prices and tutorial help.
- [ ] Keep the larger catalogue inactive until needed; optimise models, textures and render distance.
- [ ] Update tutorial/help for all new features; publish tested bundle.

## Asset/data inputs (do not block bug fixes)

- [x] Supplied a structured building-data collection prompt, including stable footprint IDs, architectural attributes, confidence and source licences.
- [x] Requested licensed low-poly GLB/glTF models: LandCruiser 79, AW139, Sur-Ron/Talaria, H2R, Ducati Panigale, with separate breakable parts.
- [ ] Incorporate supplied licensed assets/data when available, starting with a small validated sample.

Performance targets are measured improvements and smoother frame times, not an unverified promise of 200% higher FPS or manufacturer-calibrated crash simulation.

## Further architecture data

- [ ] Integrate further licensed images, materials and surveyed façade details when supplied.
