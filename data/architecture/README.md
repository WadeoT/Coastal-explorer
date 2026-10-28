# Supplied architectural pilot

`buildings.jsonl`, `schema.json` and `sources.csv` are the supplied 100-building pilot, kept as data. No uploaded Python script was executed. `scripts/import-architecture.py` validates IDs, closed coordinate rings, region bounds and non-synthetic records, then creates compact `runtime.json`.

All 100 OSM way IDs already match existing mapped buildings. Integration attaches provenance without creating duplicate houses. All 13 observed storey values already agree with existing map tags: this upload does not add new surveyed geometry or change those heights. Missing tags can be filled from observed values; existing game map tags take precedence. Roof shapes, materials, colours and façade details are unknown in this pilot. Renderer defaults are procedural, not observations.

Raw council roof/base elevation measurements and storey-derived height estimates are deliberately excluded from runtime height overrides. The source CSV identifies council measurements present in the uploaded source dataset; their presence does not mean they were used to construct runtime geometry.

Footprints/tags: © OpenStreetMap contributors, ODbL 1.0. See sources.csv and ../LICENSE-ODbL-1.0.txt. Source records refer to Sunshine Coast Council Building Footprints 2022 (CC BY 3.0 AU); council absolute elevations are not used as ground-relative heights. No source imagery, private interiors or personal information is included.
