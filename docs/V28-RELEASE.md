# V28 — Drive & Navigate

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=28

The persistent delivery backlog is [TASKS.md](../TASKS.md). Larger multiplayer/combat/fleet requests remain scheduled for later tested bundles; V28 does not mark them complete.

## Smoothness and traffic

Low roundabout islands are wheel/foot support surfaces rather than enclosing body walls, allowing a vehicle to drive off after mounting a kerb. Taller island structures and other obstacles remain solid.

Wheel meshes are now batched inside their moving nodes, preserving suspension and detachable wheels. A sampled HiLux exterior uses 33 meshes compared with 57 in V26. The weighted traffic catalogue uses a cached cumulative table and binary search instead of filtering the catalogue on every spawn. The active NPC pool is unchanged.

Closed roundabouts now consider exits at intermediate connected nodes rather than wrapping forever. Junction routing respects road levels and one-way direction, tracks recent paths and varies exit choice. It reuses the existing mapped-junction graph. Exact critically damped suspension replaces the less stable integration step, reducing repeated road-height bounce while retaining terrain gradients. This is not a change to the measured road layout.

Rendering is capped at 60 FPS for normal qualities and 30 FPS on Low, and hidden tabs skip drawing. Balanced/adaptive quality, texture pooling, reduced network duplication and complete scenery swaps from V27 remain. These are measured work reductions, not a universal FPS guarantee.

## Selectable graphics / performance

GRAPHICS / PERFORMANCE in the garage opens saved Battery Saver, Low, Balanced, High and Maximum presets. Individual controls cover resolution scale, separate ground/air render distances, civilian traffic budget, vegetation density, shadows, adaptive scaling, moving clouds, animated water/foam and frame-rate cap. Battery Saver uses 30 FPS, reduced civilian/vegetation budgets, no shadows and no animated water. Police challenge and saved career are not changed by the civilian traffic setting.

## Bike and walking controls

H dismounts bikes. X wheelie, K knee knockers, G hand scrape, N no-hander, J no-footer and C camera remain. Help is available using the ? button while riding. The obsolete F2 shortcut/hints are removed.

Wheelie physics no longer stops working merely because admin test mode is active; leaderboard scoring remains subject to its existing admin-test rules. Wheelies can begin at lower moving speeds. The walking camera keeps the user's look direction after dragging, clips against scenery and maintains ground clearance.

## Garage spawn choice

The garage offers current area, mapped suburbs, Sunshine Coast Airport and a chosen map point. CHOOSE ON MAP opens the regional map; USE MAP POINT AS GARAGE SPAWN saves your clicked location. The choice persists, and DRIVE/LAUNCH prepares that location. Land vehicles use safe terrain/road placement, boats seek nearby open water, and airport fighter spawns use the runway heading.

## Crumple zones

Cars have finite front/rear crush travel, side-impact absorption and a stronger passenger cell. Each impact consumes zone travel and absorbs part of its kinetic energy. Already collapsed zones absorb less on subsequent hits; residual energy and cabin intrusion influence driver injury. Front, rear and oblique impacts retain deformation. The node/beam skin deformation is stronger, with bounded nearby active solvers to limit CPU cost.

This is an approximate game model, not manufacturer-calibrated structural analysis or a full BeamNG replacement. Repairs create fresh damage state and restore the zones.

Fuel leaks now make light-blue pools for readability, and slow/moving vehicles leave a bounded trail. Pool volume follows the gradual leak rate; old patches are bounded for performance.

## Fighter navigation

Fighter ATC requests automatically target Sunshine Coast Airport (YBSU), regardless of an arbitrary map pin. Runway thresholds for the active 13/31 runway come from the bundled OurAirports public-domain dataset. The closed 18/36 runway is not selected. Clearance still depends on game weather, traffic and wanted state.

The game provides an approach waypoint, then switches to the runway after reaching the approach point. The approved runway corridor supports the approach and landing. Runway markings and the landing target are rendered. This is game navigation, not real-world operational aviation guidance.

A heading compass appears at the top in the fighter, using aircraft heading and correctly wrapping multiple rotations. Private waypoints and approved landing markers have tall navigation columns. Ground players get a distance label too. Distant private columns use a horizon indicator within the rendering budget, while the map waypoint keeps its actual coordinate.

## Verification

Chromium tests verify actual H/X/K/G/N/J input, banked trick rewards, walking camera clearance, roundabout exits for multiple NPC choices, reduced mesh count with four retained wheel nodes, finite crumple travel, smooth suspension, the real-airport target, approval, wrapped compass heading private waypoint columns and actual garage-spawn launch/persistence. Existing damage, beam and crash-outcome tests pass. All owner credentials remain outside the public game/package.
