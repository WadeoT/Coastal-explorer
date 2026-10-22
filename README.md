# Coastal Explorer — Sunshine Coast, offline edition

The previous version could leave every vehicle disabled while waiting for public map servers. **Version 2 includes the real map in the HTML file**: 94,414 OpenStreetMap features and all 63 measured elevation tiles covering Caloundra–Noosa and the Sunshine Coast hinterland. The default game makes **zero external requests**. No Google key or internet connection is required to drive.

## Play

1. Extract the ZIP into a new folder.
2. Open **index.html** in Chrome or Edge.
3. Wait for **OFFLINE MAP READY**, then choose a vehicle.

The new garage says **OFFLINE MAP INCLUDED** and shows **15 / 15 regional road sections** once opened. If you see a message about downloading real roads, you opened the older version.

If your browser or administrator prohibits local HTML pages, use **Start Windows.bat** or **Start Mac.command** with Python 3 installed. Linux: `python3 serve.py`. The launcher opens a local browser tab and binds only to `127.0.0.1`; keep its window open while playing. The packaged map still works without internet.

The entire playable game is `index.html`. Engine, fonts, model geometry, audio and real map data are embedded. Its approximately 15.7 MB size includes the coast-wide map. Initial startup unpacks it and builds the nearby scenery. Help → **DOWNLOAD GAME FILE** saves the complete HTML from a running game.

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

Touch controls appear on touch devices. Enable audio using the sound button. Sharp detail and low-resolution settings are in Help. Losing browser focus pauses the simulation. Recovery preserves health and pursuit; selecting a new vehicle starts a fresh run.

## Region and map data

The region spans −26.97° to −26.28° latitude and 152.72° to 153.20° longitude. Mooloolaba is the initial destination. Map travel includes **Caloundra, Mooloolaba, Maroochydore, Coolum Beach, Noosa Heads, Buderim, Nambour, Montville, Maleny, Beerwah, Eumundi and Peregian Beach**. Town travel is disabled during a pursuit.

The included snapshot contains 31,706 drivable road ways, separate mapped pedestrian/cycle paths, 25,292 mapped building footprints, land cover, trees and street furniture. Source coordinates and actual footprint locations are retained. The database, export query, snapshot timestamp, transformation details and licences are available in [data](data/README.md).

Terrain and road surfaces use a shared triangle interpolation of the measured DEM, so roads conform to the visible ground. Ground contact uses raycasts against locally batched terrain, roads and footpaths. Street detail includes rough asphalt, lane paint, tagged sidewalks, mapped trees, signals, lamps and building facade estimates. Data availability varies by location; missing footprints are not replaced with randomly positioned buildings.

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

No build or package installation is needed to play. Readable sources are in `src`; the shared vehicle model is `src/vehicle-models.js`. The runtime, fonts and licences are vendored. Rebuild with Python's standard library:

```bash
python3 scripts/build.py
```

Optional browser checks:

```bash
npm ci
npx playwright install chromium
npm test
```

Set `CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium; `/usr/bin/chromium` is detected automatically. Tests start their own local HTTP server, block **every external request** and use the **actual shipped map**, without geographic fixtures. They verify startup, known real roads, the 79 Series preview and cockpit, ground contact, driving, recovery, all vehicles, helicopter flight, all twelve towns, mobile layout, quality settings and the complete browser download. Screenshots go to the system temporary directory.

The managed cloud browser prohibits `file://` navigation, so its verification uses localhost HTTP with external traffic blocked. Direct-file navigation cannot be tested in that managed browser.

Bundled runtime: Babylon.js 9.31.3, 3DTilesRendererJS 0.5.3, earcut 3.0.2, fflate, DM Sans and Space Grotesk. Dependency licences are embedded in the HTML and retained in `vendor/LICENSES.txt`.
