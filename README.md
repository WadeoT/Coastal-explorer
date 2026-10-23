# Coastal Explorer — Sunshine Coast, offline edition

**Version 4 fixes the coast and road surfaces and expands suburb coverage.** The included map has **250 searchable towns, suburbs and localities**, **28,596 mapped building outlines**, 38,541 drivable roads/tracks and 108 measured elevation tiles. It covers Caloundra–Noosa, smaller coastal suburbs and the wider hinterland, including Conondale, Kenilworth, Kin Kin and Cootharaba.

The sea is clipped against actual OSM coastlines. Lake and estuary islands retain their holes, shore edges are sealed, and adjoining DEM tiles share border heights. Roads, sidewalks and paint are split on the same terrain triangles so hills cannot poke through the surface. Mapped bridges get a continuous raised deck; unsealed roads and vehicle tracks use dirt colouring. Clipped shore vertices inherit the surrounding terrain colours, and roofs and lakes face upward for daylight lighting. Forest and beach colours belong to the terrain, eliminating floating cover polygons that previously crossed roads and buildings.

Every available building footprint in the visible area is rendered, including relation outlines and courtyards. The loaded building area extends beyond the camera's visible distance and refreshes as you move. There is no nearby building-count cap. **OSM building coverage is incomplete: these 28,596 outlines are the available mapped structures, not a claim that every real-world house is present.** Additional satellite-footprint providers could not be reached from the development environment. Missing buildings are not replaced with randomly positioned houses.

The default Balanced preset caps rendering at 1280 × 800 and disables shadows. Ground checks and road searches stay local, scenery builds yield to gameplay, and at most nine nearby elevation meshes are kept on the GPU. All map data is included; the default game makes **zero external requests**. No Google key is required.

## Play

1. Extract the ZIP into a new folder.
2. Open **index.html** in Chrome (recommended on Mac) or Edge.
3. Wait for **OFFLINE MAP READY**, then choose a vehicle.

The new garage says **V4 · FULL REGION MAP INCLUDED** and shows **30 / 30 regional road sections** once opened. If you see a message about downloading real roads, you opened the older version.

If your browser or administrator prohibits local HTML pages, use **Start Windows.bat** or **Start Mac.command** with Python 3 installed. Linux: `python3 serve.py`. The launcher opens a local browser tab and binds only to `127.0.0.1`; keep its window open while playing. The packaged map still works without internet.

The entire playable game is `index.html`. Engine, fonts, model geometry, audio and real map data are embedded. Its approximately 29.8 MB size includes the coast-wide map. Initial startup unpacks it and builds the nearby scenery. Help → **DOWNLOAD GAME FILE** saves the complete HTML from a running game.

| Action | Driving / e-bike | AS350 helicopter |
| --- | --- | --- |
| Accelerate / brake / reverse | W / S or up / down | — |
| Steer | A / D or left / right | — |
| Handbrake | Space | — |
| Ascend / descend | — | W / S |
| Yaw | — | A / D |
| Tilt forward / back / sideways | — | Arrow keys |
| Recover to a road | R | R |
| Map / garage | M / G | M / G |
| Pause / help | Escape / H | Escape / H |

Touch controls appear on touch devices. Enable audio using the sound button. Balanced is the default graphics setting. For a slower computer, choose Help → Visual quality → **Fast / low resolution**. **High / shadows** restores full viewport resolution and dynamic shadows. The map database is identical in every preset. Losing browser focus pauses the simulation. Recovery preserves health and pursuit; selecting a new vehicle starts a fresh run.

## Host on GitHub Pages

The single HTML also works as a normal static website. After these changes are on the repository branch:

1. Open [this repository's Pages settings](https://github.com/WadeoT/Coastal-explorer/settings/pages).
2. Under **Build and deployment**, choose **Deploy from a branch**.
3. Choose **codex/sunshine-coast-game** and **/ (root)**, then **Save**. If you merge the game into `main`, select `main` instead.
4. Wait for the Pages deployment to finish. The site address will be **https://wadeot.github.io/Coastal-explorer/**.

Visitors open the website, wait for the included map to unpack, and choose a vehicle. No server, API key, Python installation or download is needed to play the hosted game. The first visit downloads the approximately 29.8 MB HTML, including the whole map. The `.nojekyll` file keeps Pages deployment static.

## Region and map data

The region spans −26.98° to −26.10° latitude and 152.50° to 153.22° longitude. Mooloolaba is the initial destination. Press **M**, then use **Find any mapped suburb or locality** to search all 250 places. The original twelve centres remain labelled on the regional map; smaller places also have markers and searchable travel buttons. Examples include Wurtulla, Sippy Downs, Marcoola, Diddillibah, Doonan, Verrierdale, Eudlo, Palmwoods and Mooloolah Valley.

Travel starts on the closest mapped vehicle road. A rural locality's centre can be in bushland or water, so its road approach may be a few kilometres from that label; the game reports longer approaches. Travel is disabled during a pursuit.

The snapshot contains 98,042 ways and 10,227 nodes, plus derived building relation outlines, water polygons and terrain clipping. All source coordinates are retained, with numerical rounding described in [data](data/README.md). All 28,596 normalised building footprints remain in the database across the region; only scenery outside the visible/streaming radius is unloaded. Optional higher graphics settings change resolution and shadows, retaining the same local geographic coverage.

Street detail includes mapped asphalt and unsealed tracks, paint, tagged sidewalks, trees, signals, lamps and facade estimates. Terrain contact samples shared DEM triangles and nearby raised road/footpath meshes. Water prevents cars from driving across open ocean; mapped bridge decks remain driveable.

This is a simplified 3D rendering of real geography. Building roofs, missing heights, windows, lane patterns, furniture dimensions and some bridges are estimates. It does not reproduce satellite imagery, every structure, or surveyed road engineering.

Data attribution: **© OpenStreetMap contributors** (ODbL 1.0); Australian terrain **© Commonwealth of Australia (Geoscience Australia) 2017** (CC BY 4.0); Mapzen/Terrarium and global USGS terrain sources. Attribution stays visible while playing. See [OpenStreetMap copyright](https://www.openstreetmap.org/copyright) and [terrain attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

## Vehicles

The LandCruiser menu illustration has been replaced with a rendered, metre-scale **79 Series single-cab model**: long bonnet, alloy tray and headboard, snorkel, bullbar, rectangular lights, steel rims, tyre tread, ladder chassis and leaf springs. The driving view uses the same model with a right-hand dashboard, analog instruments, steering wheel, manual gear stick and transfer lever. Its driver eye height is 1.72 m above the road. It is a simplified model, not a scanned manufacturer asset.

All four profiles retain their distinct handling. Steering responds quickly, suspension is firmer, wheel force is limited by power and traction, and drag slows the car. The i20 handbrake produces lateral slip, tyre marks and filtered tyre noise. Vehicle parameters are gameplay approximations. Traffic uses mapped roads and speed limits, starts with clearance from the player and brakes for vehicles ahead. Police pursuit, collisions and damage remain active.

## Optional Google 3D Tiles

Google photorealistic terrain is an optional **online** mode in Help. It requires a Maps browser key with Map Tiles API and billing enabled. The supplied key stays in page memory and is sent to Google. It is not saved to browser storage. The first script also retains:

```js
const GOOGLE_API_KEY = "PASTE_YOUR_KEY_HERE";
```

This mode uses `tile.googleapis.com`, `maps.gstatic.com` and a pinned Draco decoder from `cdn.jsdelivr.net`. It has not been validated with a real user key. Returning to the included map works without those services. Town travel selects the included map.

## Build and verify

No build or package installation is needed to play. Readable sources are in `src`; geographic rendering is in `src/geography.js`, and the shared vehicle model is `src/vehicle-models.js`. The runtime, fonts and licences are vendored. Rebuild with Python's standard library:

```bash
python3 scripts/build.py
```

Optional browser checks:

```bash
npm ci
npx playwright install chromium
npm test
```

Set `CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium; `/usr/bin/chromium` is detected automatically. Tests start their own local HTTP server, block **every external request** and use the **actual shipped map**, without geographic fixtures. They verify startup, known real roads, the 79 Series preview and cockpit, the occupied-traffic crash regression, five simulated minutes of driving/traffic, police pursuit, exhaustive road-search comparisons, ocean/terrain separation, terrain-plane road alignment, every shared DEM edge, travel access for all 250 places, nearby building inclusion and roof-ray checks in twelve centres, sixteen smaller suburbs/localities, bounded terrain meshes, asynchronous scenery cancellation, recovery, all vehicles, helicopter flight, mobile layout, large-display resolution limits and the complete browser download. Screenshots go to the system temporary directory.

The managed cloud browser prohibits `file://` navigation, so its verification uses localhost HTTP with external traffic blocked. Direct-file navigation cannot be tested in that managed browser.


Bundled runtime: Babylon.js 9.31.3, 3DTilesRendererJS 0.5.3, earcut 3.0.2, fflate, DM Sans and Space Grotesk. Dependency licences are embedded in the HTML and retained in `vendor/LICENSES.txt`.
