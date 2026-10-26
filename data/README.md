# Included Sunshine Coast map

The gzip database is also embedded in `index.html`; the default game never downloads a map at runtime.

- Expanded bounds: −26.98° to −26.10° latitude; 152.50° to 153.22° longitude.
- Base OSM export timestamp: `2026-10-22T23:10:04Z` (23 October 2026 in Brisbane). The separate building/water relation and vehicle-track queries were retrieved during the same update.
- 98,042 ways and 10,227 nodes; 38,541 drivable road/track ways after filtering, plus walking/cycling paths.
- 28,596 normalised real building outlines, including 108 building relations and 29 outlines with courtyards. Overlapping building parts inside complete outlines are not duplicated.
- 251 named OSM place points. The UI exposes 250 unique towns/suburbs/localities; the aggregate “Sunshine Coast” city label is represented by the region itself.
- 108 Terrarium z12 DEM tiles, each with 256 × 256 measured heights. The runtime displays a shared 128 × 128 triangle grid per tile, with adjacent border samples blended from the neighbouring source pixels.
- Coast clipping uses 110 real coastline ways and 47 water relations. There are 2,408 connected water bodies, preserving mapped islands. The renderer contains additional clipped shoreline triangles and vertical edge skirts. Inland water levels and bridge deck heights without surveyed tags are estimates.

Source queries are `whole-coast.overpass`, `relations.overpass` and `tracks.overpass`. Numeric provenance is in `provenance.json`. Database attribution: **© OpenStreetMap contributors**, ODbL 1.0; Australian measured elevation **© Commonwealth of Australia (Geoscience Australia) 2017**, CC BY 4.0; Mapzen/Terrarium and USGS sources. See [OSM copyright](https://www.openstreetmap.org/copyright) and [terrain attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md).

**Coverage limits:** this is every available footprint in the included OSM export, not every real-world building. Other satellite-footprint data hosts were blocked during this update. No random houses, roads or locality positions are generated. Heights, colours, windows and road furniture dimensions are visual estimates where untagged.

## Database format

- `ways`: `[OSM id, tags, flat coordinates]`; coordinates alternate latitude/longitude as integer millionths of a degree (approximately 0.1 m).
- `points`: `[OSM id, tags, latitude, longitude]` with the same coordinate units.
- `terrain`: `[tile x, tile y, width, base64 heights]`; original heights are little-endian signed 16-bit integers in quarter-metres. Source outlier repairs are listed in `provenance.json`.
- `buildings`: `[stable source id, tags, rings]`; the first ring is the exterior and subsequent rings are courtyards. Coordinates use the same integer microdegrees.
- `surfaces.tiles`: triangle classification bytes (water, land, clipped), extra terrain/shoreline vertices in little-endian int32 centimetres, and actual forest/beach class bytes. Original raster measurements remain in `terrain`.
- `surfaces.waterCells`: 512 m contact-query cells, with level water surfaces and polygon holes.
- `surfaces.waterMesh` / `mapWater`: real water rings for 3D elevated lakes and 2D maps. Render coordinates are local metres/centimetres around −26.68°, 153.05°.

All derived OSM geometry remains available in this database under the [ODbL](LICENSE-ODbL-1.0.txt). The terrain and runtime retain their separate licences.

## Rebuild geographic preparation

The ordinary HTML build uses only Python's standard library (`python3 scripts/build.py`). Updating the map preparation additionally needs NumPy, Pillow and Shapely >= 2.1. Export the public queries, gzip the full `whole-coast` JSON response, then run from the repository:

```sh
python3 scripts/prepare_geography.py --osm whole-coast.osm.json.gz --supplement relations.json --extra tracks.json
python3 scripts/build.py
```

The preparer reuses the included measured DEM samples and fetches any newly required tiles. It computes the coastline/water masks and normalises real building outlines once, so the browser has no GIS library or live-data dependency.

## V6 native elevation refinement

The 256-step terrain surface uses the original 256×256 measured DEM samples, including shared border interpolation. `scripts/refine_elevation.py --source-pack <original-pack>` refines terrain clipping from the existing verified water masks and retains all original `ways`, `points`, `buildings` and raw `terrain` rows byte-for-byte at the JSON-value level. No newly guessed building is inserted into this geographic database. Additional in-game houses are explicitly estimated frontage infill on mapped residential landuse and can be disabled.

## V11 workshops and police stations

`repair-garages.json` retains 32 building-tagged OSM car-repair workshops and `police-stations.json` retains 12 mapped police station/beat buildings from the original full-map response dated 2026-10-22T23:10:04Z. Source IDs, tags and coordinates remain available under ODbL. Workshop records match existing building footprints; no footprint was moved. These are incomplete mapped lists, not complete business or station directories.

Game drive-in entrances, workshop props, estimated roof heights and nine suitable rooftop helipads are fictional additions at those business locations. An H does not mean that a real mechanic has a helipad. The main compressed geographic archive is unchanged.
