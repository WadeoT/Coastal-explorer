# V8 verification

26 October 2026. Tests load the shipped standalone HTML and real bundled Sunshine Coast snapshot. Browser runs use headless Chromium with software WebGL, block external requests and record JavaScript errors. This is functional verification, not a native Mac performance benchmark.

| Suite | Checks | Evidence |
| --- | ---: | --- |
| `tests/damage-model.cjs` | 9 | Component hit geometry, independent oil/coolant failure, driver/fuel outcomes, impact energy and invalid inputs. |
| `tests/engine-audio.cjs` | 4 | Eight-cylinder pulse rate, gradual turbo spool, finite unclipped output, mute/stop. Synthesized, not recorded. |
| `tests/rewards.cjs` | 6 | Linked drift/one-time banking, crash loss, 120+ road streaks, invalid movement rejection, active pursuit payments. |
| `tests/relay.cjs` | 10 | Public matching, no host admin, private owner login, gift acknowledgements, settings bounds, canonical identity, public host departure, bans, secret-free persistent state and restart. |
| `tests/browser.cjs` | 27 | All-place access; original data/terrain preservation; water/roads/bridge/roof alignment; five-minute driving soak; main-town and smaller-locality building inclusion; controls, UI and offline artifact. |
| `tests/v6.cjs` | 20 | All 18 models, actual purchases/mods, manual first/fifth gear and stalling, permanent police identity/range, camera/map, jobs, crashes, two real WebSocket browsers, collision, environment, audio import, mobile shop. |
| `tests/damage-browser.cjs` | 17 | Rendered component damage, actual police bullet rays and wall obstruction, engine cutoff, fluid failure, fatal crashes and repair, FPV instruments/dark UI. |
| `tests/v8.cjs` | 24 | Kuluin alias/labels; stable buildings; automatic public matching; rescue variants; interpolated flight/levelling; rendered retractable gear; actual mouse-picked 3D cockpit switch; FPV-only monitor; red map; illegal flight/interceptors; engine cutoff/brake/hoist/nav effects; five-star difficulty; specialist job completion; solid wall deformation; two-browser owner gifts/actions/settings/bans; A$5m shop purchase. |

**117 checks passed**, with zero unexpected browser errors and zero external client requests. The expected banned-session reconnect denial is recorded separately. Browser geography also completed its five-minute simulated driving soak and asynchronous scenery responsiveness check.

Measured V8 scenarios:

- Kuluin: zero missing mapped footprints in the configured building window; 2,975 estimated homes in view; 768 inner homes compared across moved viewpoints with zero position/outline changes.
- 120 Hz flight: 128 positive rendered movements across 129 samples, interpolating the 60 Hz physical poses. Released cyclic settled to approximately −0.000037 radians roll; camera/position values remained finite.
- Actual 120 km/h mapped-building contact: 1,222 kJ reported impact, approximately 1.008 m front crush, 44 changed meshes, fatal wreck anchored with zero rebound displacement in the sampled wreck steps.
- Unauthorized airport flight reached five stars and created two moving interceptor actors. The rendered full-map canvas contains red exclusion boundaries and violation tint.
- Passenger shuttle rejected high-hover boarding, boarded after landing, validated bounded travel, and paid its displayed reward exactly once.
- Two separate browser contexts automatically joined the same relay public room. Only the test fixture's server-configured owner could set money/wanted, gift, freeze, change settings and ban/unban another player. A deliberately banned reconnect produced an expected WebSocket 403; this is recorded separately from unexpected page errors.
- The documented Node startup serves protocol-2 health and injects the same-origin relay flag into the client. It defaults to locked owner controls when no key is configured.

The real map archive remains SHA-256 `60fb77d418239ade4d14bec46b23d3d0030a78e2dfd58c5ca2f5e7a526f9ffda`. No raw mapped features or measured elevations were replaced.

Not established by these checks: an externally deployed Netlify site or relay, internet latency/load at 16 players, native Mac FPS, genuine engine recordings, certified aviation boundaries, complete surveyed real-world houses, server-authoritative career economy, or shared authoritative police/combat. Production bans/gifts/settings require durable relay storage; anonymous identities are replaceable.
