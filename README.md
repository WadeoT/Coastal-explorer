# Coastal Explorer — Street Pursuit (V13)

[Play the hosted game](https://wadeot.github.io/Coastal-explorer/index.html?v=13) · [V13 release notes](docs/V13-RELEASE.md) · [Netlify + public multiplayer setup](docs/NETLIFY-MULTIPLAYER.md) · [Deploy the multiplayer relay to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer)

A single-file Sunshine Coast driving/flying/boating sandbox with 18 original, simplified vehicle models, first-person and third-person views, a 3D showroom, saved purchases/modifications, deliveries and checkpoint races, a five-star police response, crash collisions, day/night, weather, lights and multiplayer support. The game is not a recreation using GTA V assets.

V13 widens game roads while keeping their real centre lines, adds richer ground texture and land-use colours, enforces observed speeding, and gives police a visible officer approach/arrest process with fines and surrender. Civilian cars, boats and helicopters are unarmed. The F18 has saved ammunition, cannon-cooling and flare upgrades in the garage weapons bay. All V12 thermal, fighter, ejection and working repair-pad features remain. See [release behaviour](docs/V13-RELEASE.md) and [verification](docs/V13-VERIFICATION.md).

## Play and controls

Open the hosted link, wait for **OFFLINE MAP READY**, then select a vehicle and **DRIVE / LAUNCH**. Play starts immediately. Multiplayer connects automatically when a server is configured; unavailable servers never block driving. The status badge clearly identifies local play. The complete approximately 32 MB HTML includes the runtime, fonts, model geometry and real map. No map API key is needed. The showroom says **V13 · STREET PURSUIT**.

Download: extract `downloads/Coastal-Explorer-v13.zip` and open the game via the included launcher/local server, or run `node server/relay.cjs` to serve the client and relay together. The map/runtime are bundled; Local Play works without a relay. Detailed instructions are in [PLAY.txt](PLAY.txt).

WASD/arrows drive; Y toggles driving HUD information, hold left mouse to look around, C switches camera, G opens the showroom, M opens the map, H settings, R recovery and Escape pauses. The LandCruiser is manual: hold Shift for clutch and Q/E to change gear. L headlights, [ / ] indicators, V hazards, F fires one F18 cannon round; civilian vehicles are unarmed. F18: hold Space for cannon fire, X ejects, Z deploys flares; use GUNNERY RANGE for the five-target challenge. Ejection opens a chute automatically; WASD steers and G returns to the garage after landing. Extra controls are shown in the game for helicopter, fighter and boat. U signals surrender during a pursuit after landing/stopping; an officer can arrest a stopped wanted driver and charge a game fine. Use Activities for vehicle-specific jobs and races, or earn skill money through drifts, sustained road speed and active five-star pursuits. Ordinary movement alone awards nothing. A fresh career has $65,000 and the original four vehicles owned. Cash, purchases, upgrades and resprays persist in browser storage. Private browsing may not retain progress.

Helicopter systems: J gear, I engine, K searchlight, O hover hold, B rescue hoist, N navigation lights, P rotor brake. Switches are physical dashboard controls: hover to see the label, click to toggle. No floating aircraft buttons. The AS350 has fixed skids; rescue variants have retractable wheels. Flight maps show fictional gameplay airspace, with red violations and altitude limits. These are not official aviation boundaries.

Open **ADMIN**, enter **`Iamsteve`**, then **UNLOCK ADMIN**. Your money, wanted, vehicle, damage and repair controls work locally with no server. A newly deployed relay uses the same code unless `OWNER_ADMIN_TOKEN` overrides it. Anyone who knows the code can unlock it; this is a code gate, not private account identity. Shared-player moderation needs a connected, authenticated relay. See [hosting and admin setup](docs/NETLIFY-MULTIPLAYER.md).

## Geography and visual accuracy

The region spans −26.98° to −26.10° latitude and 152.50° to 153.22° longitude, Caloundra–Noosa and the hinterland. The snapshot retains **250 searchable named places**, **28,596 real mapped building outlines**, **38,541 drivable roads/tracks**, **98,042 ways**, **10,227 nodes** and **108 measured elevation tiles**. Every original raw feature and elevation sample is retained. The terrain now uses a 256-step grid, roughly 30–40 m spacing in this region, with exact shared tile borders and road contact on matching triangles.

The sea no longer has an unlimited plane beneath the land. Actual sea/lake/estuary water-cell polygons define both appearance and water contact, retaining islands and courtyards. Measured terrain, road strips, bridges and paint share contact rules. Nearby geography streams as you move. Balanced graphics caps the internal resolution and disables expensive shadows; changing quality retains the same map coverage.

**OSM does not map every real house.** Known outlines are preserved. To avoid empty residential streets, estimated frontage-aligned houses fill gaps **inside actual mapped residential landuse**, avoiding water, roads, woodland and known footprints. These houses are explicitly estimated and can be disabled in settings. Heights, pitched roofs, windows, doors, garden vegetation, road markings, street furniture and some bridge profiles remain estimates. This is not satellite imagery or a survey of every building.

Map tools provide click-to-travel, drag panning, zoom, suburb/street search and known mapped addresses. Online full-address search is optional; missing house numbers are not invented. Current street/suburb/coordinates are approximate. Road vehicles cannot teleport into water; boats need water; a point inside a known building gets a safe nearby offset.

Attribution: © OpenStreetMap contributors (ODbL 1.0); terrain © Commonwealth of Australia (Geoscience Australia) 2017 (CC BY 4.0), Mapzen/Terrarium and USGS. See [data documentation](data/README.md), [provenance](data/provenance.json) and [licence](data/LICENSE-ODbL-1.0.txt).

## Multiplayer and hosting

GitHub Pages hosts the game at the link above. Repository Settings → Pages should use branch `codex/sunshine-coast-game`, `/ (root)`. The default branch is already configured; `.nojekyll` keeps deployment static.

**GitHub Pages and Netlify cannot run the persistent WebSocket relay.** With a configured relay, selecting DRIVE / LAUNCH automatically enters a public room; share the configured site or invite to play together. Without a relay, the game continues in clearly labelled local play. [Netlify import and relay deployment instructions](docs/NETLIFY-MULTIPLAYER.md) explain the account steps. The included `netlify.toml` builds a deployable static site. No Netlify site or internet relay has been deployed from this workspace.

Local run: `node server/relay.cjs`. The server serves the game and automatically selects itself as relay. Defaults to eight players per public room; the verified owner may set 2–16. Public rooms survive the first visitor leaving, and use WebSocket state coalescing, interpolation, remote collisions and server time/weather. Private rooms and optional PeerJS/direct WebRTC remain, but public relay mode is the recommended path.

The relay defaults to the requested code `Iamsteve`. An optional private `OWNER_ADMIN_TOKEN` on the relay overrides shared-server admin access; local controls still use the requested game code. `COASTAL_RELAY_URL` is a public frontend build variable. `ALLOWED_ORIGINS` and `COASTAL_DATA_FILE` configure the relay. Owner commands are server-authorized; normal vehicle physics, police and career rewards remain client-side. Bans apply to issued anonymous identities and require durable storage to survive redeploys. This is cooperative free roam, not a competitive authoritative economy or shared police/combat simulation.

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
npm run test:rewards
npm run test:v8
npm run test:v9
npm run test:v10
npm run test:v11
npm run test:thermal
npm run test:v12
npm run test:pads
npm run test:v13
```

`CHROMIUM_EXECUTABLE_PATH` selects an existing Chromium; `/usr/bin/chromium` is detected automatically. Tests use localhost, block external requests and load the actual shipped Sunshine Coast snapshot. Geographic checks cover known roads, every locality's access, matched native DEM edges, shore/land separation, bridge decks, actual roof rays and nearby building inclusion across major centres and smaller localities, traffic/crash regressions, a five-minute simulation soak, actual keyboard rendering, responsive UI and offline download. Fleet and damage checks exercise purchasing, manual clutch/stalling, weather/lights, map lookup, mission rewards, real crashes, audio and two relay clients. V8 checks add stable Kuluin buildings, interpolated flight, actual cockpit switch picking and gear animation, FPV-only gauges, airspace escalation, specialist work, wall crush, public matching and owner-only cross-player actions. See [V13 verification](docs/V13-VERIFICATION.md).

The cloud browser blocks direct `file://` navigation and usable WebRTC candidates. Verification therefore uses localhost HTTP and the relay rather than claiming those blocked paths were tested.

Bundled dependencies: Babylon.js 9.31.3, 3DTilesRendererJS 0.5.3, earcut 3.0.2, fflate, PeerJS 1.5.5, DM Sans and Space Grotesk. Licences remain embedded in HTML and in `vendor`.
