# Coastal Explorer — the whole Sunshine Coast

The playable region now spans **Caloundra to Noosa, plus Beerwah, Nambour, Eumundi, Montville and Maleny**. Mooloolaba is the initial spawn; the map includes the whole region below. Bounds are −26.97° to −26.28° latitude and 152.72° to 153.20° longitude.

**Roads and building locations come from real geographic data.** The game downloads actual OpenStreetMap roads and building footprints and decodes measured public elevation tiles. Roads retain their source coordinates. Buildings use their mapped polygons; heights use OSM height/level tags when available and estimates otherwise. The renderer uses simplified shapes with estimated facade openings, lane paint and missing heights. It does not use satellite imagery.

**No Google key is needed for the default open-data map. An internet connection and access to the map providers are required.** If map downloads fail, the game shows the error and a Retry button. It does not generate a substitute road network, terrain, or building placements.

## Play

Extract the ZIP first. Try opening **index.html** in Chrome or Edge. If local file restrictions prevent map requests, use **Start Windows.bat** or **Start Mac.command** (Python 3 required), or run `python3 serve.py`. The launcher opens a local browser tab and binds only to 127.0.0.1. Keep its window open while playing. See [PLAY.txt](PLAY.txt).

The **Map** and **Help** buttons work from the garage, including while data loads. Help → **DOWNLOAD GAME FILE** saves the complete HTML from a running game. This browser download was verified; it is separate from chat attachment delivery. An internal workspace file path is not a public download URL.

`index.html` is the entire game. Its engine, fonts, models, and audio are bundled; geographic data streams from the public providers listed below. Serve the directory with a static HTTP server:

```bash
cd /workspace/Coastal-explorer
python3 -m http.server 8081 --bind 0.0.0.0
```

The managed cloud test browser requires HTTP; direct file navigation is blocked by its policy. No npm install or build step is needed to run the game.

Wait for real roads and elevation to load, then choose a vehicle. Open **Map (M)** to travel to any of the twelve town destinations, including Caloundra, Noosa Heads, Mooloolaba, Maroochydore, Coolum Beach and the hinterland. The map marks downloaded regional road sections. All fifteen sections are requested in the background; selecting a town prioritises its section and measured terrain. Buildings load around the current position, and terrain tiles refresh as you travel. Town travel is disabled during a police pursuit.

| Action | Driving / e-bike | AS350 helicopter |
| --- | --- | --- |
| Accelerate / brake / reverse | W / S or up / down | — |
| Steer | A / D or left / right | — |
| Handbrake | Space; reduces i20 N rear grip | — |
| Collective: ascend / descend | — | W / S |
| Yaw | — | A / D |
| Cyclic: forward / backward / strafe | — | Arrow keys |
| Recover to a loaded road | R | R: road landing |
| Regional map / garage | M / G | M / G |
| Pause / help and map settings | Escape / H | Escape / H |

Touch controls appear on touch devices. Sound starts muted; enable it with the sound button. Visual quality and volume are in Help. **Sharp detail** uses crisp rendering, hard sunlight shadows and visible distance haze beyond 5 km. **Low resolution / no shadows** lowers render resolution with pixelated edges and disables shadows. Both modes retain mapped street detail. Menus and browser focus loss pause movement and clear held controls. Recovery and town travel preserve health; selecting a new vehicle starts a fresh run.

## Handling and street detail

Steering responds in about 100 ms, suspension settles firmly, and speed-dependent cornering limits stop instant high-speed turns. Wheel force is limited by power and traction; drag slows the vehicle instead of being cancelled by the throttle. These are game approximations rather than calibrated vehicle models. The e-bike remains an unrestricted custom 45 km/h profile.

The i20 N handbrake releases rear grip, produces tyre marks and filtered tyre noise, and allows countersteering. The engine sound and RPM display follow approximate automatic gear ratios. The helicopter has faster cyclic and collective response. Traffic spawns at least 45 m from the player, leaves space between cars, follows mapped speed limits and brakes for vehicles ahead. Pursuits, collisions and vehicle damage remain active.

Near-player street batches include road grain, dashed Australian-style white lane paint, tagged sidewalks and kerbs, actual mapped footways, mapped trees, traffic signals, stop/give-way sign proxies and lamps. Footways never become car routes. Buildings retain actual footprints and gain inexpensive window/door estimates; those facade details are not surveyed. Geometry is batched to keep draw calls down. Roofs, street-furniture shapes, paint patterns and missing dimensions remain approximate.

## Real geographic data

- **Roads, building footprints, land cover, coastline and place metadata:** OpenStreetMap via Overpass. Roads are loaded across a fifteen-section grid covering the full region. Nearest-road queries use a spatial index, and the 3D renderer batches the road and building geometry near the player.
- **Measured terrain:** Mapzen/Terrarium public elevation tiles on AWS, including Australian elevation data. RGB values decode to metres using `(R * 256 + G + B / 256) - 32768`; height samples are interpolated in their actual Web Mercator tile coordinates. Neighbouring tiles load around the selected town and player.
- **Ground contact:** raycasts against downloaded, rendered elevation and road meshes. Missing geometry holds the vehicle instead of replacing the surface with an invented height. Helicopter AGL rays sample from high altitude and flight remains independent of suspension clamping.
- **Geometry limits:** elevations are sampled public DEM measurements, not a road engineering survey. Building roofs, missing heights, inferred facade openings, lane patterns and bridges are simplified. Sidewalks follow OSM tags; separate footways use their source geometry. Photorealism requires the optional Google source.

Default provider hosts:

```
overpass.private.coffee
overpass.kumi.systems
overpass-api.de
elevation-tiles-prod.s3.amazonaws.com
```

The client retries the configured Overpass providers. No API key, account, or secret is needed for these public sources. Their availability and rate limits are outside the game’s control. The application displays source attribution.

Data credits: **© OpenStreetMap contributors** (ODbL); Australian terrain **© Commonwealth of Australia (Geoscience Australia) 2017**; Mapzen/Terrarium terrain tiles, with global GMTED/SRTM data courtesy of USGS. Provider documentation: [Terrarium format](https://github.com/tilezen/joerd/blob/master/docs/formats.md), [terrain data attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md), and [OpenStreetMap copyright](https://www.openstreetmap.org/copyright).

## Optional Google Photorealistic 3D Tiles

In Help, enter a Maps **browser** key in the optional Google field and choose **Connect Google 3D Tiles**. The value stays in page memory, is sent to Google and is not saved to browser storage. Alternatively, the first script in the file retains:

```js
const GOOGLE_API_KEY = "PASTE_YOUR_KEY_HERE";
```

A configured constant is used by the Connect button when the input is empty. Enable Map Tiles API and billing and use suitable API and HTTP referrer restrictions. Do not use an unrelated Google service-account credential. The optional mode needs `tile.googleapis.com`, `maps.gstatic.com`, and the version-pinned Draco decoder from `cdn.jsdelivr.net`.

Google uses the bundled Babylon.js 3DTilesRendererJS integration, session handling, geocentric coordinate conversion, and visible-tile attribution. A Google failure returns to real open-map data. Selecting a town from the travel controls uses the open-data renderer. Google access has not been validated with a real user key.

## Validation and current environment limitation

The current version passes **22 browser checks with no page errors**, using **clearly synthetic OSM responses and Terrarium PNG fixtures**. All fifteen coast-wide road sections are requested. Tests cover coordinate preservation, DEM decoding, raycast ground contact, driving, six town transfers, all four vehicles, mapped detail rendering, separate pedestrian paths, crisp quality settings, mobile layout, browser file download and explicit provider failure. Controlled flat-road checks measured approximately 5.65 s and 9.77 s for the car and ute to reach 100 km/h, 31.7 m to brake the car from 100 km/h, direct steering response, bounded high-speed yaw, handbrake slip and stable helicopter hover. Traffic retains 100% player health during a stationary ten-second check.

Optional development checks (no install needed to play):

```bash
npm ci
npx playwright install chromium
npm test
```

Tests start their own local server. Set `CHROMIUM_EXECUTABLE_PATH` to use an existing Chromium; `/usr/bin/chromium` is detected automatically. Test screenshots go to the system temporary directory and are labelled as fixtures. They do not validate the live world or show actual Sunshine Coast scenery.

**Live public downloads remain unverified in this cloud instance:** Overpass returned HTTP 406; the alternate Overpass and elevation hosts were blocked by the workspace network proxy with CONNECT 403. Required host additions and updated startup instructions have been saved in the environment configuration draft. Review/save the settings and publish the environment to activate the updated configuration, then retry live map downloads. This does not prevent an ordinary browser with access to the public providers from attempting them; the game reports failures rather than pretending the data loaded.

Bundled runtime: Babylon.js 9.31.3, 3DTilesRendererJS 0.5.3, earcut 3.0.2, DM Sans and Space Grotesk. Dependency licences are embedded at the end of index.html. Readable application logic follows the labelled engine bundle near the bottom of the file.
