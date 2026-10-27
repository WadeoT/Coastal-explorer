# Traffic and crash references — V20

## Measured Sunshine Coast traffic

Queensland Department of Transport and Main Roads, **2025 Traffic census for the Queensland state-declared road network**, [dataset and licence](https://www.data.qld.gov.au/dataset/traffic-census-for-the-queensland-state-declared-road-network), [public datastore resource](https://www.data.qld.gov.au/api/3/action/datastore_search?resource_id=dd96f1cd-f7ee-4c00-b5bc-2eb4f0b16952&limit=10000). Retrieved 27 October 2026. **Creative Commons Attribution 4.0**. Attribution: State of Queensland (Department of Transport and Main Roads), 2025 traffic census.

The client includes 240 unique sites inside the coast/hinterland bounding box in Sunshine Coast Regional or Noosa. The source has 720 matching records: against, with, and both directions at each site. We use **BOTH DIRECTIONS once**, not the combined record plus its two constituents. Examples:

| Site | Road | 2025 AADT, both directions |
| --- | --- | ---: |
| 20222 | Bruce Highway, Brisbane–Gympie | 88,387 |
| 21133 | Nicklin Way | 73,188 |
| 20861 | Nicklin Way | 72,166 |
| 22885 | Sunshine Motorway, Mooloolaba–Peregian | 69,567 |

136 sites have light/heavy classifications. Across those classified station passages, the weighted heavy share is about **10.26%**. This is a vehicle-passage mix, not unique registered cars; summing road counts counts through journeys repeatedly. Zero light and heavy values at an unclassified site are treated as missing classification, not proof of no trucks.

Counts guide road weighting and a local expected occupancy estimate using road length, speed and an **assumed hourly profile**, then a rendering/simulation cap (8–52 civilian cars by demand/quality). AADT is vehicles per day, not cars to render simultaneously. Census-to-OSM matching uses nearby stations and normalized road names. Streets without stations use clearly estimated road-class weights. Vehicle brands/body choices are representative original art; the census does not identify HiLux versus Ranger or precise make/model shares. Heavy traffic is represented by a generic rigid commercial truck; articulated-truck subclasses are retained in data, not reproduced as articulated trailer physics.

Read-only extraction evidence: [official dataset extraction](https://github.com/WadeoT/Coastal-explorer/actions/runs/40451239799). The published JSON preserves source, licence, station IDs, coordinates, daily counts and classification totals; `tests/traffic-census.cjs` verifies uniqueness, combined-direction handling and source totals.

## Real crash research and limits

Reviewed ANCAP's official [testing explanation](https://www.ancap.com.au/safety-testing-explained), which distinguishes frontal offset, full width, side impact, oblique pole, far side, rear/whiplash and vulnerable-road-user impacts. These distinctions inform separating contact direction, intrusion, rollover, occupants and post-impact fire instead of treating every collision as the same hit-point loss.

Attempts to retrieve the specific LandCruiser model reports through the older rating URLs returned empty search pages; the current public sitemap did not expose a usable per-model report. Euro NCAP/NHTSA reference fetches were blocked or returned missing pages. **We did not obtain manufacturer force–displacement curves, structural meshes or validated crash models for the individual cars. No test rating is used as a claim that the game predicts real injury or deformation.**

The game uses metre-scale approximate dimensions and vehicle mass, contact-normal delta-V, momentum-conserving impulses, an arcade rigid-body rollover/contact solver, and a 30-node/167-beam position-based cage with yielding/rest-length changes. Shell vertices interpolate that cage. Breakaway components are actual available model objects; impact proximity and severity determine detachment. A stronger cabin region, deformable outer regions, bounds and damping keep the solver stable. Parts move with inherited velocity and bounded debris contacts. Missing wheels reduce or disable powered travel. Fuel, oil, coolant, temperature, fire and occupants use the existing component damage model.

This is **a small node/beam deformation approximation, not BeamNG's calibrated soft-body vehicle system or a finite-element crash model**. Separate bonnet/bumper/mirror/wheel objects can detach; doors welded into the procedural shell do not become fully articulated torn assemblies. The models remain original procedural approximations. Properly licensed GLB/glTF vehicle assets would improve visual accuracy; correct structural calibration would require additional engineering data and vehicle-specific work.
