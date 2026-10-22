# Included Sunshine Coast map

The map snapshot in `sunshine-coast.json.gz` is distributed inside the game, so the default map makes no network requests. This is actual downloaded geographic data, not test fixtures or generated street layouts.

- Bounds: −26.97° to −26.28° latitude; 152.72° to 153.20° longitude.
- OpenStreetMap snapshot: **22 October 2026, 05:12:48 UTC**. The exact export query is in `whole-coast.overpass`.
- 85,086 ways and 9,328 nodes: 94,414 geographic features. There are 25,292 mapped building footprints and 50,508 highway ways, including pedestrian paths. After filtering short ways and separating walking routes, the game has 31,706 drivable road ways.
- Terrain: 63 downloaded Mapzen/Terrarium z12 tiles, 256 × 256 samples each. Required Australian attribution: **© Commonwealth of Australia (Geoscience Australia) 2017**. See [Mapzen/Terrarium attribution](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) and [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Global source credits include Mapzen / USGS.

OSM data © [OpenStreetMap contributors](https://www.openstreetmap.org/copyright), distributed under the [Open Database Licence 1.0](LICENSE-ODbL-1.0.txt). The OSM portion of this derived database is available under that licence. That database licence does not change the separate licences of the terrain or game runtime. Attribution remains visible in the game. The compressed database is provided here in full for inspection and reuse.

The gzip JSON contains `meta`, `ways`, `points` and `terrain`. Way rows are `[OSM id, tags, flat coordinates]`; coordinates alternate latitude/longitude as integer millionths of a degree. Node rows are `[OSM id, tags, latitude, longitude]`. Terrain rows contain `[tile x, tile y, width, base64 heights]`; heights are little-endian signed 16-bit integers in quarter-metres. Terrain heights are interpolated on the same triangle grid used to render the surface, keeping roads and wheels on the visible ground.

Coordinates retain source geometry with rounding to approximately 0.1 metre. Terrain measurements are quantised to 0.25 metre. Sixteen extreme source pixels outside −100 to 1,200 metres were replaced with local median measurements. Every correction, original value and replacement is recorded in `provenance.json`. Roofs, missing heights, facade openings, road paint, furniture dimensions and some bridge geometry remain simplified estimates. No randomly placed streets or buildings are added.

To inspect the snapshot using Python's standard library:

```python
import gzip, json
with gzip.open("data/sunshine-coast.json.gz", "rt") as source:
    snapshot = json.load(source)
print(snapshot["meta"])
```
