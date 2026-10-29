# Uploaded QTopo reference

Source: user-supplied `QTopoMap_A1_b1d51bc1-4d0c-4723-a3d1-112099c838cf.pdf`, produced 29 October 2026 by the Queensland Government QTopo service. Original bytes are retained in [source.pdf](source.pdf). Attribution: **State of Queensland, QTopo**, [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Adaptations: cropped map rendering, coordinate transformation, extracted controls and local DEM correction. Original map credits remain in the full PDF.

The A1 sheet is 1:100,000. Its main GeoPDF viewport is GDA2020 / MGA Zone 56 (EPSG:7856); geographic registration corners are stored in `reference.json`. Geographic coordinates use GDA2020 (EPSG:7844). Height units are metres as printed. The PDF does not state its vertical datum: this release does not invent an AHD declaration. Rounded GeoPDF corners close to within about two metres in MGA coordinates. Cartographic symbols and the game mesh add further positional uncertainty.

`import-qtopo.py` is validated against this specific PDF's SHA-256. It extracts 38 named printed heights and pairs each with its mountain-symbol centre, rather than the offset text label. It also renders the original main map viewport at two pixels per PDF point into a lossless WebP. An 8×8 coordinate-warp grid preserves the projected sheet's alignment in the game's geographic map. The map is bundled and works offline; its 1:100,000 detail cannot reveal individual house façades.

## Physical terrain

The existing measured DEM remains the base. Compact smooth corrections extend at most 1,100 m from each spot-height control. A small linear solve accounts for the actual mesh triangle interpolation, so the surface used by collision, roads, buildings and aircraft matches all 38 printed controls. Examples: Mount Coolum 208 m; Mount Ninderry 311 m; Mount Cooroora 439 m; Mount Tinbeerwah 267 m. Values follow the supplied sheet even if other sources give different summit heights.

Corrections fade at the sheet boundary and from original land heights of 5–30 m, preserving low coastal land and mapped water. Clipped shoreline vertices receive the same interpolated correction as their parent terrain triangle; intentional vertical skirts remain. Shared tile borders agree. Vertex correction runs once per prepared tile; fitting never runs in the animation loop. The topographic map uses one cached warped canvas and is separate from the minimap.

**Limits:** this is a spot-height calibration, not a complete reconstruction of every contour. Between/away from controls the existing DEM still determines slope and valley shape. The 217 contour-text candidates in `reference.json` are reference-only: rotated PDF fragments and cartographic label offsets prevent treating them as reliable sampled height coordinates. Full contour tracing or a properly licensed georeferenced elevation raster is needed for a denser, independently validated reconstruction. Areas outside this sheet retain the existing regional DEM. The map does not provide new building façades, house colours or surveyed bridge decks.

## Rebuild and checks

Install Python packages `PyMuPDF`, `pyproj` and `Pillow`, then run:

```
python3 scripts/import-qtopo.py /path/to/the/supplied.pdf
npm run build
npm run test:1.3.9
```

The importer never executes PDF code. The build embeds `runtime.json` and `map.webp` into the standalone HTML. The original reference PDF is also included in the downloadable release.
