# V6 — Coast & Crew

The public game is hosted at https://wadeot.github.io/Coastal-explorer/index.html?v=6 . Its garage says **V6 · COAST + CREW**.

## Requested fixes and features

| Request | Delivered behaviour |
| --- | --- |
| Mudjimba and missing houses across the coast | All 28,596 original mapped outlines remain. Additional street-front houses fill gaps **inside actual mapped residential landuse**. These are clearly estimated, can be disabled in settings, and never replace known footprints. Mudjimba test: 133 actual nearby outlines plus 447 estimated houses within the local area. This does not claim a survey of every real house. |
| Ocean through land / map water bugs | Removed the full-region sea sheet. Sea, estuaries and lakes now use the same clipped water-cell polygons as collision checks, with islands and holes retained. Water is animated and textured. |
| Roads / elevation | Roads follow the full native 256-step measured elevation grid, including matched tile borders and raised bridges. Paint stops around junctions. No raw elevation sample, road, named locality or known building was removed. |
| Vegetation and realistic house appearance | Trees on mapped woodland and residential gardens; pitched roofs on suitable small buildings, facade doors/windows, brick/cladding and corrugated-roof textures. Infill avoids known buildings, roads, woodland and water. |
| Camera shake | First-person view compensates chassis pitch/roll and smooths suspension height; third person uses damped following and local footprint obstruction checks. |
| Aggressive police / civilians turning into police | 24 permanent civilians and four permanent marked police. Civilians cannot be converted. Five stars use wider thresholds. Speeding must be sustained and witnessed nearby. Police have bounded acceleration and speed and do not fire unless the player has five stars and recently attacked. Close firing range; searches expire after breaking line of sight. |
| Player/building collisions and crash physics | Vehicle-size probes stop the player at building walls; traffic and multiplayer collisions apply impulses. Damage, sparks and visible body compression respond to crashes. Collisions default on. |
| Fight back | F fires an arcade vehicle weapon against traffic/interceptors; Space fires the jet cannon. It can disable vehicles and escalate a witnessed offence. No on-foot combat is claimed. |
| Shop / modding / lobby area | Dedicated 3D showroom. Cards select a vehicle and scroll to its actions. Buy, drive, respray, and purchase compatible performance upgrades. Insufficient funds gives a clear explanation. |
| Remove movement money / add activities | Driving does not pay. Delivery contracts and ordered checkpoint sprints pay once when their travel/completion rules are met. Teleporting/changing vehicles cancels a job. |
| Map anywhere-click, panning and zoom | Click/tap a destination pin, then Travel to pin. Drag to pan, wheel or buttons to zoom, centre on the player or reset to the region. Boats use water and road vehicles use land; buildings get safe nearby spawn offsets. |
| Address search and rough location | Offline suburb, street and known mapped address lookup. Optional full-address online lookup. Unmapped house numbers are not invented. Approximate street/suburb/coordinates appear under the map and current street/suburb under the minimap. |
| Chopper model | More detailed AS350 cabin/bubble, doors, stripe, registration, engine/intake/exhaust, skids, swashplate, three-blade main rotor, tail boom, stabilisers and tail rotor. |
| Go-kart and fighter jet | Coast Sprint kart and an original F/A-18-inspired twin-tail fighter, with individual models, cockpit views and physics. Total: 16 vehicles. |
| LandCruiser manual and suspension | Shift is clutch; Q/E shifts between reverse, neutral and five forward gears. Gear-dependent acceleration/RPM, neutral coasting and visible wheel suspension travel. |
| Recorded LandCruiser audio | **No authentic licensed LandCruiser recording was supplied or found.** Local audio import and RPM-linked recorded playback are implemented for the selected vehicle; default sound is honestly labelled synthesised. This part remains source-dependent. |
| Day/night, weather, headlights, indicators and textures | A 20-minute day/night cycle; clear/cloudy/rain/storm/fog events, rain streaks and wet grip; automatic/manual headlights, brake lamps and left/right/hazard indicators. Vehicle paint, buildings, roof and water textures. |
| Admin commands | Solo player / room host console supports cash, repair, give/vehicle, wanted, time, weather, teleport, collision toggle, player list and kick. Relay independently verifies host authority for environment and kick packets. |
| Multiplayer | Real remote vehicle state, interpolation, collision, host weather/time and player cleanup. Browser-pair tests pass through the included WebSocket relay. Optional PeerJS rooms and direct WebRTC invites are available where a network provides usable candidates. |
| Hosting link for friends | GitHub Pages hosts the complete single-file game. **Internet relay multiplayer needs a separately deployed server**; GitHub Pages cannot run Node/WebSockets. A working server and Render blueprint are included. |
| GTA V style / “10 times cooler” | More free-roam systems, activities, weather, vehicles and visual detail. Assets remain original simplified models; this does not include GTA V assets, photorealistic houses or an on-foot GTA recreation. |

## Multiplayer deployment

Use [Deploy to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer). The blueprint is [render.yaml](../render.yaml). Sign into Render, select the repository's default `codex/sunshine-coast-game` branch if prompted, and create the free web service. The service runs `node server/relay.cjs` and also serves the game. Copy its **HTTPS URL** into the game’s Multiplayer → Relay server URL field. Host a room and share the resulting room link. Guests paste that link into the lobby and join. If using the game served by the Render URL, the relay field fills automatically.

The service URL is allocated by Render during deployment; it has not been invented or hard-coded. No Render deployment is claimed without account access. Free services may take time to wake from sleep.

Local test/run: `node server/relay.cjs`, then open `http://localhost:8080`. Relay field: `http://localhost:8080`. To expose it on the internet use a real HTTPS host; the server’s `PORT` environment variable is supported. `ALLOWED_ORIGINS` can restrict accepted origins to a comma-separated list of your game sites. Room limit: eight players; host departure ends the room.

Optional WebRTC exchanges need usable ICE candidates. Some managed browsers block candidate gathering, and some NATs need a TURN relay. The WebSocket option avoids those constraints. Public PeerJS signalling is external and has not been verified from this cloud network.

## Controls

WASD/arrows drive; S brake/reverse (the manual ute uses its selected gear). C camera, G showroom, M map, H settings, Esc pause. Shift clutch + Q/E for the LandCruiser. L headlights, [ / ] indicators, V hazards, F counterattack. Helicopter: W/S collective, A/D yaw, arrows cyclic. Jet: W/S throttle, arrows pitch/roll, A/D yaw, Shift boost, Space cannon. Boat: W/S throttle/brake/reverse, A/D steering, Space slows for docking. R recovers. Activities, multiplayer and admin have top-bar buttons. Mobile has extra control buttons.

Admin examples: `give jet`, `cash 250000`, `repair`, `wanted 0`, `time 21`, `weather rain`, `tp -26.6145 153.0993`, `noclip off` (collisions on), `players`, `kick <peer-id>`.
