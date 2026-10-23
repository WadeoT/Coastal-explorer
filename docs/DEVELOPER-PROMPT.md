# Coastal Explorer — complete developer build prompt

Copy everything between **BEGIN PROMPT** and **END PROMPT** into the brief for the developer or coding agent.

**Prepared:** 23 October 2026, Australia/Brisbane. This describes the intended finished game. Requirements marked as outstanding must not be mistaken for features already working in the published build.

---

## BEGIN PROMPT

You are an experienced browser-game developer with expertise in real-time 3D graphics, vehicle dynamics, geographic data, multiplayer networking and deployment. Build **Coastal Explorer**, a polished, playable Sunshine Coast open-world driving, flying and boating game. If the existing repository is available, improve it instead of replacing functioning systems with mock-ups.

Deliver working software, readable source, tests, an actual publicly accessible play URL, and a reliable downloadable client. Do not deliver only a concept, static menu, unconnected controls, simulated multiplayer, or a list of proposed features.

### 1. Product definition and order of authority

The player explores the real Sunshine Coast in Queensland, Australia, with recognisable roads, suburbs, coastal geography, elevation and buildings. Gameplay combines free roaming, distinct vehicle handling, a vehicle showroom, purchases and modifications, paid jobs and races, fair police pursuits, crashes, weather, day/night and public multiplayer.

The intended feel is an enjoyable open-world action-driving sandbox, with the breadth of activities associated with GTA-style free roaming. Use original or properly reusable assets. Do not present a browser prototype as having GTA V's production assets, city simulation or visual fidelity.

These later requirements supersede the original prototype brief:

- Cover the **whole Coast, Caloundra to Noosa and the hinterland**, rather than only Buderim or the original Sippy Downs–Coolum corridor.
- Use actual open geographic data as the default. A Google Maps key is not available and must not be required to play.
- Provide cockpit and switchable third-person cameras. Reduce unwanted camera movement while retaining useful suspension feedback.
- Use a **five-star**, restrained police system. Civilian cars must never transform into police cars.
- Make the LandCruiser genuinely manual, including gear-dependent wheel torque, clutch operation, engine stalling and restarting.
- Improve the engine audio; the existing synthesised sound was described as sounding like a PC fan.
- Improve house appearance and fix changing, missing or suddenly appearing houses, especially around Mudjimba and smaller suburbs.
- Fix the helicopter's reported permanent leaning and unstable behaviour.
- **Pressing Play must automatically connect the player to a public multiplayer server.** Requiring players to paste a relay URL, host a private room or exchange WebRTC codes does not satisfy the main Play flow.
- Award money for completed activities, never simply for travelling a distance.

When these requirements conflict with earlier prototype behaviour, use the requirements above. Keep a traceable checklist showing implementation, verification and any external blockers. Never mark a requirement complete merely because a button or placeholder exists.

### 2. Existing project and honest starting point

Repository: `https://github.com/WadeoT/Coastal-explorer`.

The existing working/default branch is `codex/sunshine-coast-game`; do not assume a `main` branch exists. Inspect the repository and current branch before changing anything. The published baseline for this handoff is commit `574336bde96507cf45a6122329bd299f7ee568c0`.

Existing public client: `https://wadeot.github.io/Coastal-explorer/index.html?v=6-v8`.

The baseline has a single-file Babylon.js client, a bundled real map, 16 vehicles, basic local career saving, a showroom, activities, manual gear selection, police, weather, map travel, and a separately supplied Node WebSocket relay. It is useful code to build on, but passing its historical tests does not mean the latest complaints are fixed.

Outstanding at this starting point:

1. The manual drivetrain does not meaningfully stall, and high gears launch too similarly to first gear.
2. Engine audio is procedural synthesis, not a genuine LandCruiser recording, and needs a perceptual improvement.
3. Estimated house placement depends on scenery rebuilds and needs stable generation and better architecture/detail.
4. The helicopter has a user-reported persistent lean/flight bug requiring reproduction and a fix.
5. Public matchmaking on Play is not implemented. No deployed public relay endpoint is established by the baseline.
6. A reusable, authentic turbo V8 recording has not been obtained.

Relevant files:

| Path | Responsibility |
| --- | --- |
| `src/game.js` | Main simulation, rendering, terrain/road geometry, traffic, input and audio integration |
| `src/fleet.js` | Vehicle catalogue, local economy, purchases/modifications, exterior models and cameras |
| `src/vehicle-models.js` | Detailed procedural LandCruiser model |
| `src/vehicle-upgrade.js` | Manual controls, suspension, lights, recording import, aircraft/kart/showroom models |
| `src/engine-audio.js` | Current procedural turbo-diesel V8 fallback |
| `src/geography.js` | Geographic feature processing and spatial lookup |
| `src/world-upgrade.js` | House infill, vegetation, weather/time and map interactions |
| `src/activities.js` | Jobs, checkpoint races, admin and additional UI |
| `src/multiplayer.js` | Existing relay/WebRTC client and remote vehicles |
| `server/relay.cjs` | Dependency-free HTTP/WebSocket room relay; must evolve for automatic public play |
| `src/shell.html` | HTML/CSS client template |
| `scripts/build.py` | Builds the complete standalone `index.html` |
| `scripts/package.py` | Builds the downloadable offline ZIP |
| `data/` | Map snapshot, provenance, source queries and licences |
| `tests/` | Existing geographic, feature, audio and relay verification |

Read `README.md`, `PLAY.txt`, `docs/V6-RELEASE.md`, `docs/V6-VERIFICATION.md`, and `docs/ENGINE-AUDIO.md`. Treat reported bugs as additional regression cases, even if earlier tests passed.

### 3. Delivery architecture

Use Babylon.js with WebGL/WebGL2 and a source-based build pipeline. The maintainable project may contain multiple source modules; produce a distributable single HTML5 client with its runtime, fonts, procedural models, map snapshot and any permitted audio assets embedded or bundled reproducibly.

The original request for a single-file game applies to the **client**. Public multiplayer additionally requires a real hosted backend. Do not claim that an HTML file or GitHub Pages can itself run a persistent WebSocket server.

Keep these responsibilities separate:

1. Client rendering, local input, predicted vehicle motion, cameras, sound and UI.
2. Geographic preprocessing, spatial indexes, terrain and scenery streaming.
3. Multiplayer service, matchmaking, identities, shared world state and validation.
4. Persistence for authoritative multiplayer money, ownership and rewards.
5. Reproducible client/server builds, deployment configuration and release packaging.

Do not require a build tool or external CDN when an end user opens the already-built client. For the primary online mode, document that connecting to the public service requires internet access. If an offline practice mode is retained, label it separately; it must not silently replace a failed public connection.

### 4. Real Sunshine Coast geography

The map must use actual road geometry, coastlines, water, locality names, building outlines and measured elevation. Do not replace the region with an invented road grid or a few scenery islands named after real towns.

The existing extent is approximately latitude **−26.98 to −26.10** and longitude **152.50 to 153.22**. Retain this coverage at minimum and compare it with authoritative locality/region boundaries before claiming complete Sunshine Coast and Noosa coverage. Extend it if required to include the requested region.

Include major centres and smaller localities: Caloundra, Golden Beach, Pelican Waters, Kings Beach, Moffat Beach, Dicky Beach, Currimundi, Wurtulla, Bokarina, Birtinya, Warana, Minyama, Buddina, Parrearra, Mountain Creek, Mooloolaba, Alexandra Headland, Maroochydore, Cotton Tree, Kuluin, Kunda Park, Buderim, Sippy Downs, Palmview, Bli Bli, Diddillibah, Twin Waters, Pacific Paradise, Mudjimba, Marcoola, Mount Coolum, Coolum Beach, Yaroomba, Point Arkwright, Peregian Beach, Peregian Springs, Marcus Beach, Castaways Beach, Sunrise Beach, Sunshine Beach, Noosa Heads, Noosaville, Tewantin, Doonan, Eumundi, Yandina, Nambour, Woombye, Palmwoods, Eudlo, Mooloolah Valley, Landsborough, Beerwah, Glass House Mountains, Mapleton, Flaxton, Montville, Maleny, Witta, Conondale and Kenilworth, plus all other named localities in the chosen region.

This list is a test seed, not an excuse to omit unlisted suburbs. Build a locality coverage inventory from actual geographic sources and check every included locality. Retain aliases and place types without confusing a neighbourhood with a separate town.

The baseline dataset contains 250 searchable places, 28,596 known building outlines, 38,541 drivable road/track features, 98,042 ways, 10,227 points and 108 measured elevation tiles. Preserve source data and provenance. Changes in these counts require a documented data update, rather than quietly discarding difficult features for performance.

Use metric local coordinates derived consistently from latitude/longitude. Document the world origin, axis directions, heading sign and units. For a larger regional scene, use appropriate precision/origin management to avoid distant-object jitter. Verify coordinate conversion round trips and terrain/road alignment.

The default game must load real map data without a Google key. Optional Google Photorealistic 3D Tiles can be retained behind explicit configuration. If retained, provide `const GOOGLE_API_KEY = "PASTE_YOUR_KEY_HERE";` in a clearly documented location, respect provider attribution and restrictions, and do not make ordinary gameplay depend on it.

### 5. Terrain, roads, bridges and water

Use measured elevation with consistent shared tile borders. The baseline has native 256-step terrain grids; do not reduce geographic coverage or silently flatten hills to hide collision bugs.

Road surfaces, painted markings and collision sampling must agree with the rendered geometry. Drape roads onto the correct terrain triangles. Handle steep slopes, junctions, bridge approaches, tunnels where supported, divided roads, roundabouts, tracks and overpasses. Road markings must not float, flicker, disappear into asphalt or restart their dash pattern on every short source segment.

Use a suitable hierarchy for ground contact: applicable road/bridge deck first, terrain next. Avoid snapping a vehicle under a bridge onto its roof/deck or onto a nearby building roof. Use rays or indexed height queries that identify the correct surface layer. Provide stable loading behaviour where a required terrain tile is unavailable; do not let vehicles fall through the world.

The ocean must be restricted to actual water geometry. Preserve islands, inlets, canals, rivers, lakes and polygon holes. **Never place a blanket sea plane across the entire region.** Terrain below sea level must not automatically become ocean.

Water rendering, boat contact and road-vehicle shoreline collision must use compatible geographic definitions. Use subtle animated normals/ripples, natural blue-green colour, controlled specular response and convincing shore transitions. Prevent water z-fighting, inland flooding and water leaking through Mudjimba or hinterland terrain. Prefer actual coastline polygons; document any coarse water-mask fallback.

### 6. Houses, buildings, vegetation and streaming

Preserve every known footprint in the visible/loaded area, including irregular outlines, courtyards and holes. Support approximate heights/storeys and roof information where source tags exist. Missing tags require sensible estimates, not claims of surveyed accuracy.

Do not describe estimated houses as exact recreations of real addresses. OpenStreetMap does not contain every real house. Use available reusable building data where feasible; otherwise clearly distinguish mapped buildings from estimated residential infill.

Estimated infill must:

- Be seeded by stable world identifiers or fixed spatial tiles, never frame number, player position or the order of a nearby-road query.
- Stay at the same coordinates, orientation, dimensions and appearance after driving away, returning, teleporting, changing graphics settings, rebuilding scenery or joining another client.
- Avoid mapped footprints, adjacent generated houses, roads, water, woodland and unsuitable slopes.
- Align plausibly with street frontages and setbacks inside real residential land use.
- Use deterministic conflict resolution across tile boundaries. Avoid camera-relative limits that change which nearby houses exist.
- Have a clear settings option and description; it must not silently replace actual footprints.

Improve the architecture beyond plain boxes: believable proportions, pitched/hipped or appropriately flat roofs, roof thickness, eaves, gutters, fascia, framed windows, doors, garage doors, verandas/porches where appropriate, restrained material variation and grounded foundations. Use Queensland/coastal housing cues. Avoid repeating the same bright brick pattern on every wall or applying roof materials to gable walls.

Use efficient reusable textures and batched geometry for cladding, brick, render, roofing, glass and trim. Windows and doors must sit on the correct wall, face outward and avoid z-fighting. Do not orient every front door to an arbitrary first polygon edge without considering the street.

Stream scenery ahead of movement, keep a margin behind the player, and use stable LOD/hysteresis so near houses do not repeatedly appear and disappear. Keep old scenery visible until a replacement is ready. Never rebuild the whole world every frame. Distinguish loading distant detail from a missing local building.

Vegetation should reflect actual wooded/residential land, using deterministic placement and efficient instances/batches. Include believable trees, shrubs and gardens without placing trunks in roads, houses or water. Maintain complete local building coverage on low graphics; simplify meshes and draw distances instead of randomly deleting houses.

### 7. Vehicle roster and visual models

Provide at least these 16 drivable/flyable vehicles:

| ID | Vehicle | Intended role |
| --- | --- | --- |
| `ute` | Toyota LandCruiser 79 Series single-cab ute | Heavy manual 4WD, turbo-diesel V8 |
| `bike` | Custom Commuter E-Bike | Light, agile, 45 km/h electric bicycle |
| `drift` | Hyundai i20 N | Fast hot hatch with handbrake-induced sliding |
| `heli` | Eurocopter AS350 | Civilian helicopter with collective/cyclic/yaw |
| `hilux` | Toyota HiLux SR5 | Popular 4WD ute |
| `ranger` | Ford Ranger Wildtrak | Popular 4WD ute |
| `patrol` | Nissan Patrol Y62 | Heavy SUV |
| `jimny` | Suzuki Jimny | Small, light 4WD |
| `commodore` | Holden Commodore SS | Rear-drive performance sedan |
| `falcon` | Ford Falcon XR6 Turbo | Turbo performance sedan |
| `mustang` | Ford Mustang GT | V8 coupe |
| `gtr` | Nissan GT-R R35 | Fast AWD coupe |
| `wrx` | Subaru WRX STI | AWD performance sedan |
| `boat` | Quintrex 590-style runabout | Driveable boat with outboard |
| `kart` | Coast Sprint go-kart | Low, exposed-frame, responsive kart |
| `jet` | Original F/A-18-inspired fighter | Fast jet with flight controls |

Use recognisable silhouettes, plausible scale, proper wheel placement and original/reusable materials. The LandCruiser must read as a 79 Series single-cab tray-back, with a boxy cab, correct wheelbase, tray, bullbar, mirrors and snorkel. Its showroom illustration must agree with the actual model.

Improve the helicopter with a shaped AS350 fuselage and canopy, skids, correctly placed tail boom/fins, main and tail rotors, mast, engine cowling and cockpit. Avoid disconnected primitive shapes or a rotor visibly clipping the cabin. The kart needs exposed chassis, tyres, seat, wheel and engine. The jet needs a coherent fuselage, canopy, wings, fins, exhausts and landing arrangement.

Provide individual mass, wheelbase, dimensions, clearance, torque/power, grip, steering, braking and aerodynamic/rolling resistance. Use sensible real-world reference values where available and identify gameplay approximations. Do not apply the same handling profile to every vehicle.

### 8. LandCruiser manual drivetrain — critical correction

Model the **4.5-litre 1VD-FTV turbo-diesel V8** with a five-speed manual gearbox, reverse, neutral, clutch, idle, stall and starter states. Model the drivetrain mechanically enough that gear choice changes behaviour.

Compute wheel force from engine torque, selected gear, final drive, drivetrain efficiency and tyre radius:

`wheelForce = transmittedClutchTorque × gearRatio × finalDrive × efficiency / wheelRadius`

Derive coupled engine speed from wheel speed and gearing, while allowing clutch slip and free engine revs. Integrate engine speed using plausible flywheel inertia, combustion/idle torque, friction and clutch load. Use a torque curve rather than a fixed equal force in every gear. Engine upgrades must affect this model consistently.

Do not implement a fake gearbox that only changes the HUD or a gear-specific speed cap. Do not keep RPM clamped above idle when the clutch load should stall the engine. Do not hard-code “fifth gear means stall” as a substitute for a drivetrain model.

Required behaviours:

1. Start in neutral with the engine running and explain how to select first. Alternatively, use an explicitly documented start procedure that is equally clear.
2. Shift is clutch; Q/E changes down/up through reverse, neutral and gears 1–5.
3. Clutch disengagement removes drive torque and allows the engine to rev independently.
4. Releasing the clutch creates a controlled bite/engagement transition. A poor launch can bog or stall; a reasonable first-gear launch is learnable and repeatable.
5. Fifth gear at 0 km/h must not accelerate like first. An unsuitable high-gear launch should bog and generally stall under load.
6. Stopping in an engaged gear without using the clutch can stall. Braking with the clutch down should not.
7. Neutral plus throttle revs the engine without propelling the vehicle.
8. A stalled engine produces no powered acceleration or engine sound. Momentum/gravity may still move the vehicle appropriately.
9. Show an obvious **ENGINE STALLED** status and a restart hint. Use I for the starter, requiring clutch disengagement or neutral. Animate a short starter state before returning to idle.
10. S brakes in forward gears. Reverse requires selecting reverse; holding S at a stop must not silently change the manual vehicle into reverse.
11. Downshifts must not instantly clamp the car's velocity. Apply engine braking and handle over-rev behaviour consistently.
12. Recovery, vehicle switching, joining a server and teleporting must initialise drivetrain state coherently.

Animate front steering, wheel rotation, visible suspension travel, clutch/gear indications and readable instruments. Avoid exaggerated chassis shake that makes the cockpit unpleasant to use.

### 9. Other vehicle physics and helicopter correction

Use a fixed simulation step with bounded catch-up, independent of render frame rate. Handle browser suspension and long frame times without explosive impulses. Keep positions, velocities, orientation and camera transforms finite.

Ground vehicles need longitudinal drive/braking, lateral grip/slip, steer-angle limits, sensible mass-dependent impulses, slope response, drag and suspension. The i20 N's Space handbrake should reduce rear lateral grip and permit controllable slides; do not represent drifting as a disconnected camera animation.

E-bike: sharp steering, low mass, electric response, visible handlebars/levers/computer and 45 km/h cap. Kart: low driving position, quick steering and distinct grip. Boat: water-based buoyancy/contact, acceleration, drag, turning, reverse/docking and shoreline collision. Spawn boats on valid water, not a road.

Helicopter controls: W/S collective ascent/descent, A/D yaw, arrows cyclic pitch/roll. Disable road/terrain ground clamping while airborne; retain a landing collision floor and building/world collisions.

Reproduce and fix the **permanent lean** complaint. Verify both the aircraft and camera after keyboard input, touch input, focus loss, landing, recovery, teleport, camera changes and multiplayer updates. Use a clear attitude convention and consistent local/world axes. Avoid mixing Euler and quaternion orientation or accidentally reapplying bank to the camera twice.

For this accessible flight model, releasing cyclic should bring commanded bank/pitch back toward neutral with damping; residual velocity can decay smoothly. The helicopter must not keep tipping because of stale keys, terrain suspension state, accumulated rotations or an offset model pivot. Yaw should preserve a valid heading, not compound into roll. Clear inputs on blur/visibility changes and pointer cancellation.

Animate main/tail rotors appropriately. Display altitude above actual terrain and airspeed. The jet must have distinct throttle, pitch, roll, yaw, lift/stall-speed behaviour, altitude limits and recovery; it must not be a car with a flight-shaped mesh.

### 10. Cockpits, cameras and controls

Use Australian right-hand-drive layouts where appropriate.

- LandCruiser: upright dark dashboard, right-side steering wheel, manual gear lever, analogue-style speedometer/tachometer, visible interior structure and sensible eye height.
- i20 N: lower sporty cockpit, dark/carbon materials, restrained blue/red accents, live digital instruments and hydraulic handbrake.
- E-bike: open view, believable bars, grips/brakes and a live computer display.
- AS350: canopy framing, cyclic, collective, instrument panel, overhead details and readable altitude/airspeed.
- Added road vehicles, boat, kart and jet: appropriate driving position and coherent cockpit controls rather than reused floating dashboards.

C toggles cockpit/third person. Cockpit view should follow meaningful chassis motion with controlled suspension smoothing and roll/pitch compensation. Third person needs a damped chase rig, useful look direction and obstruction handling that keeps the camera out of buildings and terrain. Do not eliminate the vehicle's movement by making the view disconnected, and do not make it shake continuously at rest.

Baseline bindings:

| Action | Input |
| --- | --- |
| Drive/accelerate, brake | W/S or up/down for ground vehicles |
| Steer | A/D or left/right for ground vehicles |
| Handbrake | Space |
| Manual clutch | Shift |
| Manual downshift/upshift | Q/E |
| Restart manual engine | I |
| Camera | C |
| Map / garage / settings | M/G/H |
| Pause or menus | Escape |
| Recover | R |
| Headlights | L |
| Left/right indicators | [ / ] |
| Hazards | V |
| Arcade counterattack | F |
| Jet cannon | Space in jet |

Vehicle-specific instructions must update correctly. Provide usable touch controls, including clutch, gears and restart, with pointer-capture/cancellation handling. Inputs must not trigger gameplay while the player types into search, chat, settings or admin fields.

### 11. Engine sound — critical correction

The desired LandCruiser sound is a **recorded turbocharged diesel V8**, preferably the specified 4.5 L Toyota engine. A petrol V8 without a turbo, an inline-six diesel, a generic fan recording, or synthetic oscillators must not be labelled as that authentic recording.

Find a recording with verifiable engine provenance and permission to redistribute. Include the source, author, licence and any attribution. Ordinary videos or public repository audio files do not automatically establish reuse permission. Do not claim the authentic-recording requirement complete while no usable recording is supplied.

Ideally use matching idle, low/medium/high RPM, loaded acceleration and coast samples. Build seamless loops and smooth crossfades. Pitch and volume should follow actual engine RPM and load; gear changes and stalling must be audible. A turbo layer should respond to load/spool and remain subordinate to combustion/exhaust. Do not leave a loud, steady sine whistle or broadband air hiss that dominates and sounds like a PC fan.

If no genuine recording is available, improve a clearly labelled synthesised fallback with audible exhaust pulses, combustion character and load variation. A four-stroke V8 has eight combustion events per two crank revolutions; use this correctly, but recognise that matching this frequency alone does not establish authenticity or good sound.

Use Web Audio efficiently. No per-frame AudioContext creation, duplicate engine graphs, leaking buffer sources or heavy per-sample main-thread synthesis. Respect user activation, volume/mute, pause, visibility changes, showroom mode, engine-off state and vehicle switching. Imported local recordings must suppress the matching synthetic layers and remain local unless the user explicitly chooses upload.

### 12. Graphics, materials, lighting and performance

Prioritise crisp, readable detail and natural colours over expensive softness. The requested look is grounded coastal Queensland: believable asphalt, sand, water, greenery, buildings and vehicle paint. Avoid a uniformly washed-out/pastel scene, excessive bloom, strong blur or thick fog hiding broken scenery.

Use texture detail, proportion, geometry silhouettes, appropriate roughness/specular response, restrained ambient lighting and useful shadows. Keep cars, windows, roofs and streets distinguishable in daylight and at night. Avoid shimmering repeating textures and z-fighting.

Provide low/balanced/high settings with sensible defaults on a Mac. Cap pixel ratio/internal resolution, batch static meshes, use instances where suitable, apply frustum/distance culling, pool traffic/effects, and budget terrain/scenery work across frames. Bound memory, draw calls, particles and active lights. Do not turn each window, brick or tree leaf into a separate live draw call.

Target approximately 60 FPS in balanced mode on a documented recent Apple Silicon Mac at 1280×720 internal resolution, with a usable 30 FPS low-mode target. These are performance goals, not verified claims. Record hardware, browser, settings, frame-time percentiles and test route. A headless software-GPU test does not establish native Mac FPS.

### 13. Traffic, crashes and collision

Populate real drivable roads with mixed civilian traffic travelling on the **left**. Use reusable pools with speed limits, lanes, turns and safe spawn/recycling positions. Cars must not continually appear visibly in front of the player, spawn inside houses, drive through water or all use police models.

The baseline uses 24 civilians and four permanently designated police; retain a clear identity separation even if counts are tuned for performance. Recycling a civilian must preserve its civilian identity.

Enable vehicle-to-vehicle, player-to-player, building and relevant terrain/world collision by default. Use broad-phase spatial queries and suitable narrow-phase colliders, with adequate handling of high-speed movement to prevent tunnelling. Respect vertical separation at bridges and aircraft altitude.

Apply mass-relative impulses, friction/restitution, speed-based damage, controlled deformation and pooled sparks/effects. Avoid explosive feedback loops or arbitrary health loss while parked. Simplified damage is acceptable if identified honestly; do not claim detailed soft-body physics if only scaling a mesh.

### 14. Fair five-star police and action mechanics

Use 0–5 stars, visible in the HUD. Legal ordinary driving must not raise wanted level. Minor mistakes must not immediately become a maximum chase.

Use witnessed, attributable offences. The baseline's starting values are heat thresholds 30/90/180/300/450, speeding more than 20 km/h over the road limit for approximately eight seconds with a nearby witness, witness distance around 85 m, pursuit/search distance around 120 m, and approximately 12 seconds unseen to escape. Tune and document these values for enjoyable gameplay.

Offence attribution matters: an AI car hitting a stationary player must not automatically blame the player. Ignore unavoidable spawn overlap. A collision or shooting offence should escalate in proportion to its actual severity.

Police should follow roads, have bounded acceleration/speed, and avoid omniscient long-distance tracking. The baseline has a 34 m/s maximum police speed; tune for road context without rubber-banding or teleporting to catch the player. Losing line of sight and increasing distance must meaningfully help escape.

Do not shoot at a harmless or low-wanted player. Reserve armed response for severe escalation and recent player aggression, with short, unobstructed firing range; the baseline uses five stars, recent attack and roughly 22 m range. Buildings/terrain should block fire. Do not fire through the map or treat a distant helicopter as a ground car's immediate target.

Provide the requested arcade means of fighting back: F can attack nearby opposing vehicles and the fighter can fire its cannon. Use visible feedback, cooldowns, collision/hit checks and appropriate wanted escalation. The required scope is vehicle-based action; do not advertise an on-foot combat system unless implemented.

### 15. Money, activities, garage and modifications

Fresh careers start with approximately **A$65,000** and the original four vehicles available. Additional vehicles have configured prices and must be earnable. Preserve existing saves with versioned migrations where practical.

Provide a proper garage/showroom area with visible 3D vehicle preview, selection, price, balance, ownership, Buy, Drive/Launch and compatible upgrades. Cards must select the intended vehicle and bring its actions into view. Buying must deduct exactly once and immediately unlock the vehicle. Insufficient funds must give a useful message.

Offer paint and compatible engine, brake, tyre and suspension upgrades. Existing starting values: paint A$750; three levels per upgrade; engine base A$4,500, brakes A$2,000, tyres A$2,500, suspension A$1,800, with increasing level costs. Existing effects are approximately +12% engine power/+4% top speed, +15% braking, +12% grip and +12% suspension response per level. Tune consistently; these are gameplay settings rather than manufacturer claims.

**Do not pay money for distance travelled.** Deliveries and checkpoint races pay stated rewards once after valid completion. Provide start markers/menu entries, route/checkpoint guidance, progress, time limits and success/failure feedback. Checkpoint order, actual travel and vehicle requirements must be enforced. Teleporting, resetting or changing vehicles must not allow reward farming or skipping a race.

Persist balance, owned vehicles, modifications and completed rewards. Public multiplayer needs server-validated transactions and rewards; browser localStorage alone cannot be the authoritative public economy. Keep offline/admin test progress separate from normal public progress.

### 16. Map, search, teleport and current location

Provide a readable regional map and live minimap using the same geographic coordinates as the 3D world. Support drag panning, wheel/pinch/button zoom, centring on the player and resetting to the whole region.

Click/tap places a destination pin; a clearly labelled action travels there. Provide valid on-land spawns for road vehicles, suitable water for boats, and safe altitude for aircraft. Avoid spawning inside a known building, below terrain, inside another player or under an incompatible bridge deck. Apply clear wanted/activity restrictions and validate public teleport requests on the server.

Search must find all included suburbs/localities and streets. Use known mapped addresses where present, with an optional online full-address geocoder that observes its provider's usage policy and handles failure gracefully. Do not invent house numbers for generated houses.

Show approximate current street/suburb and coordinates below the full map, with a compact current-location indicator under the minimap. Distinguish “near an address” from an exact address match. Show activity goals and other players without making the map unreadable.

### 17. Mandatory automatic public multiplayer — critical new requirement

The normal user flow must be:

**Open website → load essential assets → choose vehicle/press Play → automatically join a suitable public server → spawn safely with other real players.**

No relay URL entry, room-code copying, port forwarding or manual hosting should be required for normal public play. First-person controls should only become active once the client has the required world/server state. Show meaningful Connecting, Joining, Loading area, Ready and failure states.

Implement a hosted service with a documented client configuration/bootstrap endpoint. Prefer HTTPS/WSS, with server region/ping information and automatic room selection. An initial target of eight players per instance is acceptable, with additional instances when full. Design how room allocation and instance lifecycle work.

Public instances must not disappear just because the first visitor leaves. The existing private-room host lifecycle is insufficient. Server time, weather, world authority and ordinary privileges belong to the service rather than an arbitrary first browser.

Synchronise player identity, vehicle, transforms, velocity, relevant lights/indicators, damage and shared environment state. Use timestamped updates, bounded interpolation/extrapolation and local prediction/reconciliation appropriate to the physics model. Prevent obvious remote jitter, permanently banked helicopters, mismatched vehicle models and huge correction impulses.

Validate messages, sizes, rates, world bounds, vehicle ownership, authoritative rewards and administrative actions. Give the server stable identities; do not trust a client-supplied ID or arbitrary admin flag. Support heartbeat, timeout, disconnect cleanup, reconnect/backoff and safe re-entry without duplicate player models or repeated rewards. Handle full servers and service wake-up delays visibly.

Player collisions must be coherent between clients, with server arbitration/authority sufficient to avoid two incompatible outcomes. Never describe a local visual imitation as tested multiplayer. Shared police/world simulation and economy authority must be explicitly defined; do not imply features are shared if each browser runs an unrelated copy.

For public sessions, pause menus should release controls safely without pretending the entire shared world is paused. Any optional private rooms/direct WebRTC mode are secondary features, not substitutes for automatic public matchmaking.

If no hosting account, deployment permission or persistent service is available, finish the deployable backend/configuration and report that external blocker precisely. Do not fabricate a public endpoint or say automatic internet multiplayer works without testing a real deployed service.

### 18. Admin commands and player permissions

Provide a useful command console for authorised administrators, with commands such as `help`, `cash <amount>`, `repair`, `give <vehicle>`, `vehicle <id>`, `wanted <0–5>`, `time <hour>`, `weather <type>`, `tp <lat> <lon>`, `noclip on/off`, `players`, and `kick <player-id>`.

Solo practice can expose development commands. Public-server admin requires server-side permission checks and configured administrator identity. Do not make every public player an admin, grant admin to the first person joining, or embed an administrator secret in the client HTML.

Validate command arguments and show clear feedback. Privileged money/vehicle grants must not be confused with ordinary progression. Keep an appropriate server audit trail for public admin actions.

### 19. Day/night, lighting and weather

Implement a smooth day/night cycle, with a configurable starting point and roughly 20-minute full cycle as an initial gameplay value. Synchronise time and weather on public servers.

Support clear, cloudy, rain, storm and fog conditions with gradual transitions and performance-aware effects. Rain can reduce grip and alter surface appearance; it must not generate excessive particles or make the map impossible to see. Lighting should remain usable during night and adverse weather.

Provide functional headlights, brake lights, indicators and hazards. Headlights need a useful beam with a controlled performance budget, not just emissive lens cubes. Include suitable boat/aircraft lighting where implemented. Disable or simplify expensive lighting for distant vehicles.

### 20. Reliability and user experience

Fix “simulation error while driving” at its cause. Add actionable diagnostics for non-finite state, failed assets or invalid surfaces; do not repeatedly send the user back to a menu without retaining the actual error context.

Ensure a new player can load the site, join a server, select a vehicle and move without developer tools. Menus must be readable, keyboard-accessible and usable on the supported screen sizes. Clearly explain a stalled engine, insufficient cash, network failure, unavailable terrain or invalid teleport rather than silently ignoring input.

Keep renderer, simulation, audio and UI state transitions coherent across garage, gameplay, map, settings, connection failure, recovery and destroyed vehicle. Remove duplicate event handlers, leaking mesh/material/audio resources and accumulated multiplayer objects.

### 21. Verification and acceptance criteria

Run existing relevant checks, extend tests to cover the reported bugs, and provide observed evidence. Do not write tests that merely confirm a UI label changed while the underlying behaviour is still wrong.

**Drivetrain acceptance:** compare first/fifth launches from rest with the same initial state and throttle; verify distinctly different wheel force/acceleration and a plausible high-gear bog/stall. Verify a successful clutch-assisted first-gear launch, stopping in gear causing a stall, clutch-down braking avoiding it, neutral revving without movement, restart prerequisites/timing, reverse behaviour, engine-off silence and upgrade interaction. Inspect the actual rendered HUD and keyboard flow.

**Helicopter acceptance:** fly forward/back/left/right, yaw, release controls, change cameras, land, recover, blur/refocus and reconnect. Verify a finite stable attitude and return toward neutral cyclic with no permanent unwanted bank. Check a second client's representation as well as the local view.

**Building acceptance:** inspect Mudjimba and a documented mix of small suburbs and hinterland towns. Compare house IDs/transforms across overlapping view centres, scenery rebuilds, departures/returns and clients. Confirm no dropped known footprints, overlapping filler, houses in water or near-field pop-in. Provide ground-level screenshots of façades, roofs and street layout; a screenshot of the garage is not evidence of house quality.

**Geography acceptance:** verify known roads and place searches across the full region, road/terrain alignment, native tile seams, bridge-layer contact, uphill/downhill driving, coast and inland-water separation, actual building roof/collision geometry, boat shore handling and safe map travel.

**Multiplayer acceptance:** use at least two independent real clients against the deployed public service, preferably on separate devices/networks. Each presses Play without entering connection details, automatically joins, sees the other, moves, changes vehicle, collides, disconnects and reconnects. Verify instance-full behaviour, first-player departure, server restart/recovery, invalid packets, reward duplication prevention and admin rejection for normal players. A localhost relay test is useful but does not establish deployed internet play.

**Audio acceptance:** test idle, acceleration, load changes, shifts, coast, stall, restart, mute, pause, imported sample and vehicle changes. Check clipping, loop seams, dominant whistle/hiss and resource reuse. Include a short in-game audio capture for human listening; spectral checks alone do not prove the sound is convincing.

**Gameplay acceptance:** verify varied traffic identities, no wanted level during legal driving, proportionate witnessed escalation, fair escape, bounded police speed/range, civilian persistence, collision damage, working purchases/upgrades, exactly-once job/race rewards and teleport/vehicle-change restrictions.

**Reliability/performance acceptance:** run a sustained drive of at least ten minutes on a documented Mac/browser route spanning scenery updates, traffic, collisions and weather. Report frame times and memory behaviour, plus zero uncaught simulation errors. Test keyboard focus, supported touch layout and loading/network failures.

**Release acceptance:** build from source reproducibly; check for unresolved template markers and missing assets; verify the ZIP extracts and contains the exact released client. Download the archive from its actual public URL and verify it opens. Check the exact GitHub Pages/server deployment revision and provide working links. Do not hand over a guessed URL or rely only on a local build.

### 22. Hosting and deployment

The client may be served by GitHub Pages at the existing project path. Configure the actual available branch and root directory, include the required static-hosting files, use correct relative URLs and test the deployed site. Resolve 404s instead of telling the user to repeat unexplained deployment steps.

The public multiplayer backend needs a real Node-compatible or equivalent HTTPS/WebSocket host. The repository already contains `render.yaml`, but a blueprint is not a deployed server. Set the correct production endpoint in the client/bootstrap configuration and configure health checks, origins, environment variables, persistence and deployment/restart behaviour.

Document any cost, free-tier sleep behaviour, player limits and persistence limitations relevant to operating the game. Do not assert that the service will remain online indefinitely without an actual hosting arrangement.

The user previously requested a `.chatgpt.app` address. Do not fabricate a domain or imply control over that namespace. Provide the actual working public URL from the hosting available; support a custom domain only if it is genuinely provisioned.

Provide a primary shareable Play link, a verified download link, straightforward Mac play instructions and a server deployment guide. Normal players should not need to understand the backend deployment to join the finished public game.

### 23. Required handover

Deliver:

1. Complete readable client/server source and reproducible build commands.
2. Built browser client and verified downloadable release archive.
3. Live public client URL and actual public multiplayer endpoint, with automatic Play matchmaking tested.
4. Vehicle configurations, geographic provenance and asset/audio licences.
5. A concise player guide for driving, clutch/gears/restart, cameras, map, garage, activities and public multiplayer.
6. Deployment/environment configuration, persistence arrangement and operational limitations.
7. A requirement checklist mapping every request to implementation and evidence, with external blockers shown openly.
8. Test results, native performance measurements, visual evidence and audio capture relevant to the latest complaints.

Work in verifiable stages: reproduce the current bugs; fix drivetrain/flight/scenery correctness; improve sound and visual detail; implement and deploy automatic public multiplayer; then validate the integrated release. Choose practical implementation details independently, but do not quietly omit requirements or claim success for unavailable external services/assets.

The finished game should be recognisably the Sunshine Coast, enjoyable to drive, stable on a Mac, clear about geographic estimates, mechanically different across vehicles, and simple for friends to join by pressing Play.

## END PROMPT
