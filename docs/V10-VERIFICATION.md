# V10 verification

26 October 2026. Browser tests load the actual assembled game and bundled real Sunshine Coast snapshot, using headless Chromium/software WebGL. This does not measure native Mac FPS or establish a deployed internet relay.

| Suite | Checks | Scope |
| --- | ---: | --- |
| Damage model | 9 | Geometric components, fluids, driver/fuel outcomes and impact severity. |
| Engine audio | 4 | Turbo-diesel pulse synthesis, spool, clipping guards and silence. |
| Rewards | 6 | Drift, road-speed and active-pursuit rewards; invalid movement rejection. |
| Relay | 10 | Public matching, identity, owner authorization, gifts, settings, bans and restart. |
| Geography/browser | 27 | Whole-map data, all-place access, native terrain/road/water/roof alignment, locality building inclusion, driving soak and responsive UI. |
| Fleet/browser | 20 | 18 models, shop, manual gearbox, revised wanted thresholds, stable civilian identity, maps, jobs, real wall contact and two actual relay clients. |
| Damage/browser | 17 | Rendered damage, engine/fluid failure, police bullet obstruction, repair and cockpit monitors. |
| V8 regressions | 24 | Flight, stable houses, rescue jobs, airspace, wall crush, private relay authorization and player actions. |
| V9 UI regressions | 16 | Unblocked Play/background reconnect, admin buttons, maps, actual dash hover/click, readable gauges and error recovery. |
| V10 scenarios | 14 | Server-free Play and movement; code-only local admin; paused self-actions and danger cards; actual 120 km/h tree strike; generated scenery collisions; restricted ground/public road exception; nose firing geometry and actual ray; stronger airspace pursuit; native ATC approval/refusal; aircraft rooftop crash; automatic network/code authentication without a Play gate. |

**147 checks passed**, with zero unexpected browser errors and zero external client requests. Expected deliberate banned-session reconnect denials are counted separately.

Measured new scenarios:

- A sweep across a real rendered tree at 120 km/h hit the tree, changed 44 meshes, produced approximately 1.008 m crush and left a wreck with zero sampled rebound.
- A fighter beside the helicopter did not fire. With its nose aligned, the shot originated 8.5 m ahead of the fighter root, travelled exactly down the model's forward axis and hit the actual player collider.
- Fifteen seconds of sustained unauthorized airport flight reached five stars, two fighters and police helicopter support. After another 40 seconds in detection the wanted level remained five and the escape timer stayed zero.
- The real ATC button acknowledged/reviewed a safe airport request and granted local clearance. A storm request and an undesignated rooftop were refused for their actual reasons.
- A 108 km/h vertical helicopter roof strike caused a wreck; after four seconds of wreck physics it remained on the roof rather than falling through the building or snapping to terrain.
- Local Play moved with the actual driving physics before any relay was configured. Wrong code kept admin locked; `Iamsteve` enabled own-player buttons and set the balance without a server. A default relay accepted that same code, and disconnection/reconnection left Play running.

Some historical test assertions intentionally changed: the wanted boundary is now 18 rather than 30, and a swept collision stops at the first wall contact rather than reverting an entire arbitrary movement. These scenarios now test a real wall approach with matching velocity. They retain damage and collision assertions.

Map SHA-256 remains `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`. No genuine engine recording, cadastral property map, official airspace permission, native hardware frame rate, competitive server authority or live external relay is claimed. Expected banned-session WebSocket denials are tracked separately from unexpected browser errors.
