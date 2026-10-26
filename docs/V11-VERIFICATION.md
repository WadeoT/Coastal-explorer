# V11 verification

26 October 2026. Tests use the assembled HTML, actual bundled Sunshine Coast data, headless Chromium/software WebGL and two actual local relay clients. This does not measure native Mac frame rate or establish a deployed public relay.

V11 adds 20 scenario checks covering all actual previews and model bounds; matching showroom/player/remote aircraft; rotor and gear layouts; slope reset; native Y/map/mouse input; private waypoints; corner ATC and landing destinations; airborne garage rejection; physical approved roof touchdown; timed one-charge repair; actual workshop bay collision opening; clean garage damage state; scaled police dispatch/idle relocation; capsized-boat and car-crash rescue incidents; dispatch airport safety; unauthorized landing escalation; network model consistency/privacy; bounded workshop material/texture reuse; and clearing inherited bank from the third-person horizon.

Measured workshop result: 32 retained workshops matched their original building footprints; nine roofs passed pad-fit tests. A physical 0.61 m/s approved touchdown stayed on the pad, raised no stars and enabled service. The vehicle drove through the actual bay opening without collision or a false private-property offence. Five-star deployment produced 12 dedicated police units alongside 24 civilians, including units from Nambour Station. Relocated idle patrols respawned approximately 300–360 m from the player. A 25-second rescue-dispatch airport simulation produced zero heat, zero stars and no interceptors.

The model-preview manifest records the source SHA-256, finite model bounds, mesh/vertex counts and relevant rotor/gear metadata for all 18 rendered meshes. Repeated workshop builds held both material and texture counts constant. Preview geometry SHA-256: `6f00de60e8b7858dc80bc62ee2d460c1feaf85ee551e6a23a17ab4b92663a989`.

| Suite | Checks | Scope |
| --- | ---: | --- |
| Damage model | 9 | Components, fluids, impact severity and fatal outcomes. |
| Engine audio | 4 | Synthesis, spool, clipping guards and silence. |
| Rewards | 6 | Drift, road speed and active pursuit rewards. |
| Relay | 10 | Matching, identity, owner authorization, gifts, settings, bans and restart. |
| Geography/browser | 27 | Whole coast, all localities, terrain/road/water/roof alignment, building inclusion, driving soak, responsive UI and actual download. |
| Fleet/browser | 20 | Purchases, manual gearbox, permanent police identity, maps, jobs, crashes and two relay clients. |
| Damage/browser | 17 | Actual rendered deformation, fluid/engine failures, shooting obstruction, repair and gauges. |
| V8 regressions | 24 | Smooth flight, houses, rescue jobs, airspace, physical dash controls, crash crush and owner actions. |
| V9 UI regressions | 16 | Immediate Play, reconnect, admin buttons, map contacts, physical switch picking and error recovery. |
| V10 scenarios | 14 | Code admin, swept scenery impact, roof crash, private grounds, nose-only firing and native ATC decisions. |
| V11 scenarios | 20 | Shared models, workshop geometry/service, native input, live maps, private waypoints, dispatch and rescue safety. |

**167 checks passed** across all suites, with zero unexpected browser errors and zero external client requests. Deliberate banned-session reconnect denials were expected and tracked separately. The final V11 run also passed the inherited-bank and texture-reuse regressions.

Historical checks now expect 700-pixel actual-model cards and 12 police units at five stars, rather than the previous 800-pixel single-vehicle illustration and fixed four-unit pool. Model, collision, pursuit and geography assertions remain in place.

Main map SHA-256 remains `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`. Workshop entrances/pads are gameplay additions. Model detail and crash physics remain simplified; not every real building/business is mapped. Shared public multiplayer still requires an externally hosted relay.
