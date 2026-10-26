# V9 verification

26 October 2026. Tests exercise the actual assembled HTML, bundled geographic snapshot and dependency-free Node relay. Browser tests use software WebGL, not a native Mac performance benchmark.

| Suite | Checks | Coverage |
| --- | ---: | --- |
| Damage model | 9 | Component hits, independent fluid failures, impact/fuel/driver outcomes. |
| Engine audio | 4 | V8 pulse synthesis, spool, clipping guards and mute. |
| Driving rewards | 6 | Drifts, road speed, chase rewards and invalid movement. |
| Relay | 10 | Owner authorization, gifts, identity persistence, bounds, public matching, stale public invite fallback, ban list and restart. |
| Fleet/browser | 20 | All 18 vehicles, purchases, clutch/stall, police, lights/weather, jobs, maps, collision, network, audio and mobile shop. |
| Damage/browser | 17 | Rendered damage/gauges, police ray obstruction, repair and dark interface. |
| V8 browser regression | 24 | Stable Kuluin houses, flight/gear/switches, airspace/interceptors, jobs, wall crush, owner actions and multiplayer. |
| V9 browser | 16 | Mandatory connection gate; saved server/autojoin; separate tabs; automatic reconnect preserving state; button-only owner workflow; gifts/wanted/damage/vehicle/settings; ban-list unban; real minimap colours; full-map players; distant bearings; actual dashboard hover/click; larger FPV gauges; actual render-failure recovery/copy; 390 px admin layout. |

**106 checks passed**, with zero unexpected browser errors and zero external client requests. Expected banned-session reconnect denials and the deliberate render-test exception are tracked separately. The full V8 geography suite previously passed 27 checks; V9 does not change the map archive or building-generation algorithm and does not count that historical run again.

The V9 browser suite uses two tabs sharing local storage to reproduce the former duplicate-identity conflict. It then disconnects the actual relay sessions, verifies driving pauses, and waits for automatic rejoining with unchanged IDs and health. Owner operations use visible buttons rather than injected console commands. An intentional ban can produce expected WebSocket 403 denials, recorded separately from unexpected errors.

Dashboard tests project a real switch into screen coordinates, hover/click with the native mouse, verify the tooltip/state, and confirm no floating aircraft panel exists. Gauge tests inspect actual rendered dimensions and text, and verify third-person hiding. Map checks read cyan/red pixels from the real minimap canvas. The render-error test throws from `scene.render` through the game's frame handler, copies the report and returns to the garage at five stars.

Map SHA-256 remains `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`. External client requests are blocked during browser tests. No externally deployed relay/Netlify site, native Mac frame rate, account-level bans or authoritative multiplayer economy is claimed.
