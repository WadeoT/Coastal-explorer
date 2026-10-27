# Coastal Explorer — Street & Stunt (V26)

[Play the hosted game](https://wadeot.github.io/Coastal-explorer/index.html?v=26) · [V26 release notes](docs/V26-RELEASE.md) · [Netlify + public multiplayer setup](docs/NETLIFY-MULTIPLAYER.md) · [Deploy the multiplayer relay to Render](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer)

A single-file Sunshine Coast driving/flying/boating sandbox with 24 original, simplified vehicle models, first-person and third-person views, a 3D showroom, saved purchases/modifications, deliveries and checkpoint races, a five-star police response, crash collisions, day/night, weather, lights and multiplayer support. The game is not a recreation using GTA V assets.

V13 widens game roads while keeping their real centre lines, adds richer ground texture and land-use colours, enforces observed speeding, and gives police a visible officer approach/arrest process with fines and surrender. Civilian cars, boats and helicopters are unarmed. The F18 has saved ammunition, cannon-cooling and flare upgrades in the garage weapons bay. All V12 thermal, fighter, ejection and working repair-pad features remain. See [release behaviour](docs/V13-RELEASE.md) and [verification](docs/V13-VERIFICATION.md).

New players get an optional 12-step in-game tutorial once the real map is ready. It reacts to driving, braking, switching cameras, opening the map and visiting activities/the garage, with instructions for the current vehicle. It saves progress separately from your career. Skip it anytime or replay through **H → NEW PLAYER TUTORIAL / REPLAY**. See [V15 release notes](docs/V15-RELEASE.md).

V17 adds contact-aware car rollovers and sliding wrecks, deformable panels and body-attached impact scars, richer procedural ground/building/vehicle textures, and layered explosion effects. Cars and boats use hold-to-accelerate controls with coasting on release. Cars show critical warnings instead of extra oil/coolant monitors; aircraft retain their throttle behavior and instruments. See [V17 details](docs/V17-RELEASE.md).

V26 adds an ALL E-BIKES tab, animated X/K/G/N/J stunt controls, more detailed dirt e-bikes and 200 additional procedural cars for the shop and estimated NPC mix (228 vehicles total). The official census still controls volume/heavy share; individual model weights and vehicle specifications are estimates. See [V26 details](docs/V26-RELEASE.md).

V25 added road-safe scenery placement, faster building streaming, breakable scenery, hourly world restoration, manual stalling, four petrol motorcycles, survivor/ejection improvements, custom drivers and suggestions. See [V25 details](docs/V25-RELEASE.md).

V24 added overall/category multiplayer community leaderboards with career and server-session views, XP ranks/milestone cash, five electric dirt bikes, banked stunt combos and a freeride job. The shop now groups 24 models by brand, with separate performance/cosmetic tuning tabs and real drivetrain, mass, cooling and electric-power upgrades. Public scores are self-reported; remembered leaderboard history is browser-local. See [V24 details](docs/V24-RELEASE.md).

V23 clips lane paint/kerbs/footpaths at real same-level junctions, reconstructs roundabout centre islands, and keeps traffic on actual connections. New neighbourhood activities include staged block sprints, two-lap club runs, Clean Cruise, parcel shifts and vehicle-specific jobs, with rotating featured pay, medals, personal bests and district ranks. Open **ACTIVITIES**, or stop at a local events board and press **F**. See [V23 details](docs/V23-RELEASE.md).

V22 adds a natural-colour map and optional keyless aerial imagery; samples usable roof colours from aerial pixels of mapped footprints; and gives houses separate brick, render, weatherboard and block textures, with metal/tiled roofs. Added property fences with driveway gaps and Australian-style street/speed signs. Exact wall finishes remain inferred when unmapped. See [V22 details](docs/V22-RELEASE.md).

V21 replaces the helicopter crash cutoff with persistent impact/contact physics and rotor strikes; fits the chassis to four wheel contacts with correct cross-slope roll and local suspension travel; adds animated on-foot characters and **E to enter/hijack** nearby slow NPC/parked vehicles; and fills neighbourhoods with palms, eucalypts, grasses, verandas, weatherboards, street furniture and **F** errand boards. Mapped buildings survive partial elevation gaps; inferred frontage homes cover residential streets missing land-use tags. Mapped geometry is retained; missing facades and homes remain estimates, not surveyed Street View replicas. See [V21 details](docs/V21-RELEASE.md).

V20 adds two independently tested signed public relay routes when MQTT services are blocked, a copyable connection report, native Retina resolution and 4096-pixel shadows by default, rounded vehicle panels and shaped wheel openings, detailed civilian/NPC models including commercial trucks, permanent node/beam cage deformation with detachable parts, NPC crash/fire/rollover behavior, walking pedestrians and pursuit escalation for pedestrian strikes and wrong-way driving. Traffic demand uses 240 actual 2025 Queensland census sites across the Sunshine Coast and Noosa, with a bounded local population. See [V20 details](docs/V20-RELEASE.md) and [sources/limits](docs/TRAFFIC-AND-CRASH-SOURCES.md).

V19 adds a tested public MQTT route over standard HTTPS port 443, alongside two backup services. Moderate oil leaks now drain over minutes; a destroyed sump remains a fast breach. Crash outcomes apply immediately using contact speed/direction, obstacle type, fuel load and temperature. **X** lets you jump from moving cars or civilian helicopters: momentum, falls and obstacles can injure or kill the person. Officers can pull a boxed-in wanted driver out before cuffing them. See [V19 changes and checks](docs/V19-RELEASE.md).

V18 adds a ground-level neighbourhood focus: shorter scenery range, nearby house/garden/footpath detail, lamps, parked cars, refuge islands and local delivery/walking circuits. Real mapped beaches get sand detail; nearby water gets shore-safe animated waves and foam. For a ground-vehicle fuel fire, stop, **X to exit**, move at least **12 m** away, and use **E** to re-enter a safe vehicle or **G** for the garage. Ground fires now allow roughly nine seconds before exploding. See [V18 details and checks](docs/V18-RELEASE.md).

## Play and controls

Open the hosted link, wait for **OFFLINE MAP READY**, then select a vehicle and **DRIVE / LAUNCH**. Play starts immediately. Multiplayer automatically tries public MQTT relays when no dedicated server is configured; unavailable services never block driving. The status badge clearly identifies local play. The complete approximately 46 MB HTML includes the runtime, fonts, model geometry and real map. No map API key is needed. The showroom says **V26 · STREET & STUNT**.

Download: extract `downloads/Coastal-Explorer-v26.zip` and open the game via the included launcher/local server, or run `node server/relay.cjs` to serve the client and relay together. The map/runtime are bundled; Local Play works without a relay. Detailed instructions are in [PLAY.txt](PLAY.txt).

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

**No server account or URL is needed for public free roam.** Leave the optional server field blank. The game automatically attempts HiveMQ and EMQX public MQTT/WebSocket test services. Players in the default COAST-PUBLIC room exchange vehicle positions. For your mate, both open MULTIPLAYER → JOIN PUBLIC SERVER under **Sunshine Coast Public**. No invites are needed. The online count includes people in the garage. Spawned players have distance indicators, FIND ON MAP buttons and nearby vehicle name tags. Optional friends rooms and custom/direct connections are collapsed under Advanced. Old remembered custom-server URLs no longer override normal public startup. Explicit server/invite URLs still work. A connected badge means a broker accepted the subscription; your mate appears once their connection succeeds too.

Public services are best effort and can be blocked by networks. The game shows Local Play and retries when neither service connects. `?network=off` disables automatic public connections. These anonymous public topics are not private; use a nickname. Traffic is limited to five non-retained snapshots per second per broker, with at most 15 remote players, duplicate rejection and eight-second expiry. Public transport shares player poses/collisions, not police AI, combat damage, jobs, economy or authoritative weather. Admin codes and money are never sent to public brokers. Shared moderation requires the optional dedicated relay below. See [V14 release and verification](docs/V14-RELEASE.md).

This workspace blocks direct public broker access. A separate read-only GitHub CI run completed actual two-client subscribe/publish/receive exchanges on **HiveMQ and EMQX**; the failed Mosquitto backup was replaced. The actual browser adapter is checked with isolated game clients and protocol fixtures. Reachability still depends on the player network. [Optional dedicated hosting](docs/NETLIFY-MULTIPLAYER.md) remains available for reliable controlled rooms and admin actions.
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
