# V12 verification

27 October 2026 (Australia/Brisbane). The V12 verification run passed **177 distinct checks** with zero unexpected browser errors and zero external client requests. Deliberate banned-session reconnect denials remain expected and are counted separately. Browser tests use the assembled game, original Sunshine Coast data, headless Chromium/software WebGL and actual local WebSocket relay clients. They do not establish native Mac FPS or a deployed internet relay.

| Suite | Checks | Scope |
| --- | ---: | --- |
| Damage model | 9 | Components, fluids, impact severity and fatal outcomes. |
| Thermal model | 6 | Monotonic load response, thermal inertia, airflow, cooldown, afterburner and shutdown. |
| Audio | 4 | Diesel pulse synthesis, spool, clipping and silence. |
| Rewards | 6 | Drift, road speed and active pursuit rewards. |
| Relay | 10 | Matching, identity, owner privileges, gifts, settings, bans and restart. |
| Fleet/browser | 20 | Purchasing, manual transmission, police identity, jobs, impacts, models and two clients. |
| Damage/browser | 17 | Actual component ray hits, fluids, deformation, repair, gauges and bullet obstruction. |
| V8 flight regressions | 24 | Flight interpolation, gear, dash controls, jobs, airspace, building crush and owner actions. |
| V9 UI regressions | 16 | Immediate Play, reconnect, maps, admin buttons, cockpit picking and error recovery. |
| V10 scenarios | 14 | Swept collisions, roof impact, nose firing, ATC decisions, admin and network fallback. |
| V11 scenarios | 20 | Shared models, workshop geometry/service, live maps, mouse/Y input, private waypoints and rescue safety. |
| V12 combat/browser | 20 | Nose-aligned sight/rays, real traffic/interceptor damage, cover, cadence/heat, swept aircraft collision, flares, actual ejection/steering/landing, target payout and real relay autojoin/pilot replication. |
| Repair pads/browser | 11 | All three unarmed helicopters, 27 pad/type combinations, real off-centre touchdowns, stale records, roof approach, failed-engine service, one charge, departure, gear, ATC, insufficient funds and garage cleanup. |

## Reproduced pad defect

At Just Autos Mechanical, the former game pad was at 20.206 m while a nearby estimated roof reached 20.320 m. The helicopter body contacted that higher roof during an off-centre descent and stopped at approximately 21.590 m, above the intended 21.356 m landing position. This reproduced with all three helicopter types. Ordinary roof collisions, rather than a missing UI click, prevented touchdown.

The supported deck now sits at 20.696 m, clearing the surrounding roofs. All three actual physics runs landed 4 m off centre at 21.846 m, matching their 1.15 m clearance, produced a shallow-touchdown record and raised no wanted stars with approval. All nine pads accepted each of the three helicopter types 4.5 m off centre after stable contact even without an old record. Hovering remained ineligible. The original V11 physical landing, paid repair and drive-in collision-opening regressions also passed with the raised decks.

## Combat and hosting observations

Five actual nose-ray hits disabled an interceptor; a wall blocked fire without damaging the aircraft behind it. Sideways camera look did not turn the gun. A 200 m swept path detected an interceptor crossing and rejected a parallel pass; a head-on collision produced a burning wreck when collisions were enabled. Overheat/ammo limits and effect caps remained enforced.

Native X separated a living pilot from a failed engine, opened the chute automatically and allowed WASD steering. The pilot and abandoned jet followed distinct motion. Airborne garage/recovery/firing were rejected; safe touchdown allowed a clean new-vehicle launch. The actual relay's HTTP root served the game, automatically joined the public room without a manually entered URL and showed the ejected pilot/chute to another browser. Five real drone hits paid A$4,000 once; timeout paid nothing.

The full 27-check geography suite last passed in V11 and was not rerun for V12. V12 retains the source archive unchanged: SHA-256 `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`, 250 localities, 28,596 mapped building footprints and 108 original DEM tiles. Raised repair decks are explicit fictional game additions to the existing nine rooftop locations. No new surveyed property/airspace claims, licensed engine recording, competitive server authority or public hosted relay are implied.
