# V13 verification

27 October 2026 (Australia/Brisbane). **131 checks passed** during the V13 verification run, including the final 18-scenario street-system test. Tests loaded the assembled game, original real-map database and actual headless Chromium/software WebGL. There were zero unexpected browser errors and zero external client requests. This does not establish native Mac FPS or a deployed public relay.

| Suite | Checks | Scope |
| --- | ---: | --- |
| Damage model | 9 | Component, fluid, impact and fatal-state invariants. |
| Thermal model | 6 | Load, inertia, airflow, cooldown, afterburner and shutdown. |
| Geography/browser | 27 | All-locality access, measured terrain/road/water alignment, roofs, nearby real-building inclusion, driving soak, actual keyboard/render loop, mobile UI and offline download. |
| Fleet/browser | 20 | Purchases, manual controls, unarmed civilians, police identity, maps/jobs, physical wall contact, audio and actual two-client relay state. |
| Repair pads/browser | 11 | All three unarmed helicopters, all 27 pad/type combinations, physical off-centre landings, stale records, gear, paid repair, cancellation, ATC and clean garage UI. |
| V12 combat/browser | 20 | Actual cannon rays/occlusion, interceptor contact, ammo/heat, flares, ejection/steering/landing, drone rewards and real relay-root autojoin/pilot replication. |
| V11 scenarios | 20 | Shared models, live maps, native mouse/Y input, private destinations, workshop geometry and service, rescue clearance and police deployment. |
| V13 street scenarios | 18 | Wider roads, textured terrain, unarmed vehicles, legal/illegal driving, actual officer arrests/surrender/escape/cover, fines, weapons bay and real save reload. |

## Measured behaviours

- All 38,541 vehicle-road paths retain source widths and centre lines. Named coastal and highway routes have wider default surfaces; walking paths retain their width. Native settings restore source widths and reapply wider mode.
- Rendered terrain tiles have 512-pixel repeating detail textures, valid UVs and many distinct vertex colours. Sand is visibly lighter/warmer than woodland. Real shore clipping and original elevations remain unchanged.
- Driving at the mapped limit beside a patrol did not create heat. Sustained +25 km/h witnessed speeding created a speeding offence and wanted stars, with POLICE RADAR visible. Without a witness, the speeding warning remained but no witness was invented.
- A stationary innocent driver was not arrested. An officer approached a stopped two-star driver and completed custody, deducted A$750 once, cleared the pursuit and returned to the garage. A repeated arrest call did not charge again. Driving away interrupted an incomplete arrest without a fine. Real solid cover blocked detection. Native U completed the shorter surrender sequence. Disabling police disabled custody.
- The weapons bay refused civilian upgrades without charging. Native purchases deducted A$6,000, A$9,000 and A$4,000 for the first ammunition/cooling/flare levels. The resulting F18 carried 722 rounds and 16 flares and cooled by 0.182 heat units in a second. Maximum ammunition reached level three/1,011 rounds, and another maximum purchase was refused. Weapon levels, fine totals and arrest history survived a real reload with the existing save.
- Screenshots inspected the wider/textured road scene, the officer at the driver's side and the arrest countdown. The final limit row sits inside the minimap rather than covering the clock/rewards panel.

The historical fleet counterattack assertion intentionally changed: civilian attack input now must return false and leave nearby traffic health unchanged. The actual F18-to-traffic and interceptor hit scenarios still verify working weapons.

The broader audio, relay authorization, V8/V9/V10 and damage-browser checks also passed during the preceding V12 work in this session; they are not counted again as fresh V13 checks above. No new competitive server authority or shared AI simulation is claimed.

Map SHA-256 remains `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`: all 250 localities, 28,596 retained mapped footprints and 108 DEM tiles remain. Wider game widths, generated surface textures and land-use colours are presentation choices, not new surveys. Public multiplayer still needs an externally hosted relay.
