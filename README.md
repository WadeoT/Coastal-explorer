# Coastal Explorer — Damage + Drive (V7)

[Play the hosted game](https://wadeot.github.io/Coastal-explorer/index.html?v=7) · [V7 damage and interface notes](docs/V7-RELEASE.md) · [Deploy the multiplayer relay to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer)

A single-file Sunshine Coast driving/flying/boating sandbox with 16 original, simplified vehicle models, first-person and third-person views, a 3D showroom, saved purchases/modifications, deliveries and checkpoint races, a five-star police response, crash collisions, day/night, weather, lights and multiplayer support. The game is not a recreation using GTA V assets.

V7 adds location-based bullet damage to the engine, driver, radiator, oil system, fuel tank and body; leaking fluids, overheating, oil-pressure loss and engine seizure; severe crash deformation/tumbling, debris, fire and explosions; visible cockpit gauges; and a black/charcoal interface. See [release behaviour](docs/V7-RELEASE.md) and [verification](docs/V7-VERIFICATION.md).

## Play and controls

Open the hosted link, wait for **OFFLINE MAP READY**, then select a vehicle and **DRIVE / LAUNCH**. The complete approximately 31 MB HTML includes the runtime, fonts, model geometry and real map. No key is needed. The showroom says **V7 · DAMAGE + DRIVE**.

Offline: extract `downloads/Coastal-Explorer-Offline-v7.zip` and open `index.html` in Chrome or Edge. If local HTML is blocked, the Mac/Windows launchers or `python3 serve.py` provide a localhost server. Detailed instructions are in [PLAY.txt](PLAY.txt).

WASD/arrows drive; C switches camera, G opens the showroom, M opens the map, H settings, R recovery and Escape pauses. The LandCruiser is manual: hold Shift for clutch and Q/E to change gear. L headlights, [ / ] indicators, V hazards, F counterattack. Extra controls are shown in the game for helicopter, fighter and boat. Use Activities for deliveries and races; movement alone no longer awards money. A fresh career has $65,000 and the original four vehicles owned. Cash, purchases, upgrades and resprays persist in browser storage. Private browsing may not retain progress.

The top-bar Admin console provides solo/host commands, including `help`, `give jet`, `cash 250000`, `repair`, `wanted 0`, `time 21`, `weather rain`, `tp -26.6145 153.0993`, `noclip off`, `players` and `kick <peer-id>`. Host commands do not grant guests control of other players or server environment settings.

## Geography and visual accuracy

The region spans −26.98° to −26.10° latitude and 152.50° to 153.22° longitude, Caloundra–Noosa and the hinterland. The snapshot retains **250 searchable named places**, **28,596 real mapped building outlines**, **38,541 drivable roads/tracks**, **98,042 ways**, **10,227 nodes** and **108 measured elevation tiles**. Every original raw feature and elevation sample is retained. The terrain now uses a 256-step grid, roughly 30–40 m spacing in this region, with exact shared tile borders and road contact on matching triangles.

The sea no longer has an unlimited plane beneath the land. Actual sea/lake/estuary water-cell polygons define both appearance and water contact, retaining islands and courtyards. Measured terrain, road strips, bridges and paint share contact rules. Nearby geography streams as you move. Balanced graphics caps the internal resolution and disables expensive shadows; changing quality retains the same map coverage.

**OSM does not map every real house.** Known outlines are preserved. To avoid empty residential streets, estimated frontage-aligned houses fill gaps **inside actual mapped residential landuse**, avoiding water, roads, woodland and known footprints. These houses are explicitly estimated and can be disabled in settings. Heights, pitched roofs, windows, doors, garden vegetation, road markings, street furniture and some bridge profiles remain estimates. This is not satellite imagery or a survey of every building.

Map tools provide click-to-travel, drag panning, zoom, suburb/street search and known mapped addresses. Online full-address search is optional; missing house numbers are not invented. Current street/suburb/coordinates are approximate. Road vehicles cannot teleport into water; boats need water; a point inside a known building gets a safe nearby offset.

Attribution: © OpenStreetMap contributors (ODbL 1.0); terrain © Commonwealth of Australia (Geoscience Australia) 2017 (CC BY 4.0), Mapzen/Terrarium and USGS. See [data documentation](data/README.md), [provenance](data/provenance.json) and [licence](data/LICENSE-ODbL-1.0.txt).

## Multiplayer and hosting

GitHub Pages hosts the game at the link above. Repository Settings → Pages should use branch `codex/sunshine-coast-game`, `/ (root)`. The default branch is already configured; `.nojekyll` keeps deployment static.

**GitHub Pages cannot run the multiplayer relay.** [server/relay.cjs](server/relay.cjs) is a dependency-free Node HTTP/WebSocket server, and [render.yaml](render.yaml) is a deployable Render blueprint. [Deploy to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer), then copy the allocated HTTPS URL into Multiplayer → Relay server URL. Host a room and share the generated invite. The relay also serves the game itself and automatically fills its URL on `*.onrender.com`. A Render account is required; no deployment to a user's account is claimed without access.

Local run: `node server/relay.cjs`, then `http://localhost:8080` with the relay field set to `http://localhost:8080`. `PORT` and optional comma-separated `ALLOWED_ORIGINS` are supported. Rooms support eight players, position updates, interpolation, collisions, host-controlled time/weather and cleanup when players leave. The relay verifies host authority for environment and kick packets. It is a cooperative free-roam relay, not a server-authoritative competitive economy or shared police simulation.

Optional public PeerJS rooms and manual WebRTC invite/reply exchange are provided for compatible networks. Some managed browsers produce no usable ICE candidates; some NATs require TURN. The relay avoids those restrictions. Public signalling could not be verified from the cloud. The two-browser test uses actual WebSocket connections and remote vehicle collisions against the supplied relay.

**Engine recordings:** a licensed authentic LandCruiser recording was not supplied or found. The LandCruiser now uses a synthesised turbo-diesel V8 with eight firing pulses per cycle and gradual, load-dependent turbo spool. It targets the 4.5 L 1VD-FTV; it is not a genuine recording. Settings accepts an audio recording the user owns and loops it with RPM-linked playback for the selected vehicle in the current tab. No generic clip is labelled as a LandCruiser recording. See [audio source status and verification](docs/ENGINE-AUDIO.md).

Google photorealistic terrain remains optional and online, requiring the user's Maps browser key with Map Tiles API/billing. The key stays in page memory and is sent to Google; it is not persisted. This optional mode is not validated with a real key.

## Build and verification

Rebuild the standalone HTML and offline ZIP with Python's standard library:

```bash
python3 scripts/build.py
python3 scripts/package.py
```

Runtime, fonts, PeerJS and licences are vendored. Readable source modules are in `src`. If changing runtime exports, install the pinned dev dependencies and run `npm run build:runtime` before rebuilding HTML. Native elevation refinement uses `scripts/refine_elevation.py --source-pack <original-pack>` with numpy, Pillow and shapely ≥ 2.1; it explicitly retains all original roads, places, building outlines and raw elevation measurements.

Browser tests are optional development dependencies:

```bash
npm ci
npx playwright install chromium
npm run test:audio
npm run test:damage
npm run test:geography
npm run test:fleet
```

`CHROMIUM_EXECUTABLE_PATH` selects an existing Chromium; `/usr/bin/chromium` is detected automatically. Tests use localhost, block external requests and load the actual shipped Sunshine Coast snapshot. Geographic checks cover known roads, every locality's access, matched native DEM edges, shore/land separation, bridge decks, actual roof rays and nearby building inclusion across major centres and smaller localities, traffic/crash regressions, a five-minute simulation soak, actual keyboard rendering, responsive UI and offline download. V6 checks exercise the shop, manual gear/clutch, no movement payments, five-star identities/range, day/night/weather/lights, new vehicles, map street lookup, mission rewards, building crashes, two real relay clients, remote collision, host authority and cleanup.

The cloud browser blocks direct `file://` navigation and usable WebRTC candidates. Verification therefore uses localhost HTTP and the relay rather than claiming those blocked paths were tested.

Bundled dependencies: Babylon.js 9.31.3, 3DTilesRendererJS 0.5.3, earcut 3.0.2, fflate, PeerJS 1.5.5, DM Sans and Space Grotesk. Licences remain embedded in HTML and in `vendor`.
