# V26 — Street & Stunt

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=26

## One e-bike shop tab

ALL E-BIKES displays the commuter, Talaria Sting R/MX5, Sur-Ron Light/Ultra Bee and Stark VARG EX together. Cars remain grouped by brand; motorcycles, aircraft and boats have their own categories. Search works across the catalogue, with an Owned only filter. Existing purchases and upgrades are retained.

## Controls from the supplied image

| Hold | Action |
| --- | --- |
| X | Wheelie |
| K | Knee knockers |
| G | Hand scrape |
| N | No-hander |
| J | No-footer |
| C | Switch camera (press) |

Hold X while moving, then add K/G/N/J. Poses require a sustained moving wheelie and animate the actual rider arms/legs. Each distinct held pose adds to the combo; releasing into a safe landing banks XP/cash. Bails discard pending points. Poses appear to other multiplayer players. A matching bottom control strip supports pointer/touch holding.

F2 dismounts a bike; the header also has a dismount button. G while riding performs the hand scrape instead of opening the garage: use the header GARAGE button. On foot/in cars G retains the garage shortcut. X remains car/helicopter exit and fighter ejection. Legacy V wheelie remains an unadvertised compatibility alias. B stoppie, Space hop, Z whip and Q electric-bike airborne spin remain. Petrol motorcycles use T to spin because Q/E shift their manual gearbox. Help and tutorial cover the new controls.

## More detailed electric dirt bikes

Rounded seats/batteries, curved mudguards, narrower cross-laced spokes, annular brake rotors, brake hoses/calipers, telescopic forks, a rear coil shock, sculpted shrouds and readable model decals replace simpler components. Wheelbase, wheel radii, frame finish and battery/seat dimensions vary between models. These are original procedural game representations, not factory CAD or licensed scanned assets.

## 200 additional cars

The catalogue grows from 28 to 228 vehicles: 200 additional named production cars across 31 brands, including ordinary hatchbacks, sedans, wagons, SUVs, utes, coupes and vans. Every addition has a purchasable saved profile, tuning, cockpit, damage/collision support, an actual rendered preview, NPC eligibility and multiplayer support. Representative examples include Corolla, RAV4, Camry, CX-5, i30, Sportage, Triton, D-MAX, Forester, HiAce and Model 3.

Geometry uses metre-scale procedural bodies, estimated dimensions/driving values and brand/body details. Some profiles use rounded dimensions for a selected variant; others use varied class estimates. These are not 200 factory-accurate meshes or certified vehicle specifications. Pricing and performance are game estimates. Electric-car variants use electric component capacities rather than fictitious petrol/oil tanks.

## What the real-world traffic data supports

The original [Queensland 2025 traffic census](https://www.data.qld.gov.au/dataset/traffic-census-for-the-queensland-state-declared-road-network), including 240 regional station records, still drives road density and the measured light/heavy mix. It measures annual average daily counts, not simultaneous cars or make/model ownership.

Individual model frequencies in data/expanded-fleet.json are explicitly estimates: common everyday cars/utes are much more frequent than sports/luxury cars. They are not presented as measured Sunshine Coast fleet shares or national sales data. All 200 added cars are eligible; the bounded NPC pool is not increased by 200. Distant recycled NPCs rotate their models, and parked vehicles use the broader selection too. This preserves performance while changing the traffic you encounter.

## Verification

All 228 geometries were constructed and rendered. Chromium checks cover category/search/purchase persistence, distinct body classes, weighted NPC eligibility, measured heavy share, recycled colliders, detailed bike/rider construction, actual keyboard X/K/G/N/J, safe combo banking, visible controls and F2 dismounting. Two-client public-protocol checks verify added models and remote rider poses. Existing shop/upgrade/leaderboard, traffic-census, damage-model and owner-relay checks are retained. Public services remain third-party infrastructure; local play remains available.
