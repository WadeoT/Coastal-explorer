# V19 — Impact & Escape

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=19&publicRoom=COAST-PUBLIC

## Public lobby

Added a standard HTTPS-port route (`wss://public.cloud.shiftr.io`, port 443), using the service's documented public demo MQTT credentials. Both previous routes use nonstandard ports, which can be blocked by otherwise ordinary networks. The new route actually passed an external two-client subscribe/publish/receive test, alongside EMQX and HiveMQ; the diagnostic exposes results through public CI annotations, without repository write permission. No owner secrets are sent. All three routes share the same room protocol and deduplicate poses. Browser fixtures additionally block both nonstandard ports and verify two isolated players still join, see each other and their roster.

These are public best-effort test brokers. No private managed game backend has been deployed. A network blocking all WebSockets can still prevent multiplayer; the game does not fake a connection or count. New and returning players must load V19.

## Oil loss

An ordinary oil puncture loses litres over minutes, rather than treating every damaged oil component as a blown sump. Rate rises with damage and engine operation; shutdown slows the leak. Pressure depends on actual remaining oil instead of instantly collapsing because the component was hit. A completely destroyed sump is a distinct fast breach. The admin offers both OIL LEAK and RUPTURE SUMP. Warning cards report the leak rate in litres/minute; cars retain warning-only fluid UI.

## Crash outcomes

Chassis wrecking, component damage and occupant injury apply on the collision frame. The existing collision solver supplies contact-normal speed, so glancing contact differs from a head-on stop. The damage model uses impact location/direction, rigid versus soft obstacle/terrain, remaining fuel and engine/oil temperature. Severe impacts immediately stop propulsion and crumple the existing model; subsequent rollover/slide physics continues. Rear/tank damage can ignite fuel. A sufficiently severe, hot, fuel-loaded rear collision can detonate at impact; other ignitions have variable escape windows. An empty tank cannot create a fuel explosion. Repeated collisions cannot reset an existing fire timer.

These remain deterministic arcade approximations, not a full finite-element crash or fire simulator. Trees/buildings/terrain use game material classes, not surveyed material properties.

## Moving exits and extraction

Press **X** to leave cars, bikes, boats or civilian helicopters, including while moving. The person inherits velocity, falls under gravity, and takes injury from ground contact, obstacles, traffic and blasts. A high fall can be fatal. Civilian helicopters do not provide automatic parachutes; the F18 retains its separate ejection system. The abandoned vehicle continues moving/falling and can crash or burn. **E** re-enters a stopped, safe nearby vehicle without repairing its damage. Stop before exiting when possible.

An officer approaching a slow, wanted driver can pull them out and then cuff them. Opposing nearby police units count as a box-in and shorten the extraction delay. Walking away can interrupt cuffing; the pursuit remains active. Innocent players are not extracted or arrested. Police can still arrest a living person even if their abandoned vehicle has been destroyed.

Public multiplayer shares the on-foot person through the existing pilot model. The abandoned vehicle and detailed component/crash outcomes remain local, not authoritative replicated world entities.

## Verification

- `tests/crash-outcomes.cjs`: leak versus rupture, instant 120 km/h wreck, soft versus rigid contact, empty fuel, temperature/fuel fire outcomes, glancing contact.
- `tests/v19.cjs`: actual browser moving-car exit, helicopter fall injuries/fatality, boxed-in extraction and arrest, immediate wreck state.
- `tests/public-relay.cjs` / `tests/mqtt-codec.cjs`: port-443-only automatic connection, public login bytes, two-player snapshots/roster/models, fallback and privileged-message rejection. These are protocol fixtures; live endpoint reachability is checked separately by GitHub CI.
- Damage-model, thermal, component-damage browser, V17 rollover/wall/controls/textures and V18 scenery/water/fire-escape regressions.
