# V18 — Street life, escape and working relay alternatives

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=18&publicRoom=COAST-PUBLIC

## Public connection

The previous Mosquitto fallback failed an independent two-client network probe.
The new public pair is HiveMQ (`wss://broker.hivemq.com:8884/mqtt`) and EMQX
(`wss://broker.emqx.io:8084/mqtt`). Both passed real MQTT subscribe/publish/receive
round trips in read-only GitHub CI. The diagnostic result is publicly visible
in the [run annotation](https://github.com/WadeoT/Coastal-explorer/actions/runs/40436433608).
Joining/retries still run automatically in the same common room. The browser
adapter also passes isolated two-game-client protocol-fixture checks. These are
public test services, so availability on a particular player's network is not
guaranteed; the UI reports retry/offline state and suggests another network.
No privileged CI write access or automatic repository commits are enabled.

## Escape a ground-vehicle fuel fire

Slow below 4 m/s (about 14 km/h), press X, then walk/run at least 12 m away.
Ground cars and boats have a nine-second burn-to-explosion warning window.
The empty vehicle stays in place, keeps burning and can explode while the
person survives outside. Standing within 3 m causes burns; a close explosion
can kill. X cannot revive a driver already killed by the impact.

WASD moves, Shift runs, C changes the walking camera. Water supports swimming.
E re-enters a safe nearby vehicle and retains component damage and model dents.
G returns to the garage once clear of police. On-foot people replicate using
the existing pilot representation. Fighter ejection and aircraft throttle
controls remain. Helicopters still require an emergency landing; the new
walking exit is for ground vehicles. Damage simulation continues for the parked
vehicle; it does not freeze when the driver exits. Workshop repair requires
bringing the vehicle, not merely walking into the bay.

## Neighbourhood detail and activities

Balanced ground play renders buildings within about 900 m and roads within
about 1.15 km, with denser detail within 260 m. Low/high adjust those budgets.
Aircraft retain 3.6 km building coverage and a long aerial view. Weather fog
respects the same profiles instead of overwriting them every frame. Scenery
refreshes after about 150 m of ground travel. Balanced/high offer local sun
shadows; Low disables them.

Nearby scenery adds batched window frames, awnings/gutters, hedges, front paths,
fences/mailboxes, roadside lamps, parked civilian cars and small refuge islands.
Mapped footpaths remain; inferred neighbourhood sidewalks and centre markings
fill out the playable streets. Night lamps use a bounded three-light pool.
An example initial area produced 65 detailed facades, 57 garden frontages,
60 lamps, four parked cars and six road refuges. Actual counts vary by area.
Decorations/refuges are original inferred game detail, not surveyed property
layouts or Google imagery. OSM roads/footprints and native terrain remain.

Four-stop local delivery rounds keep the player on a nearby street, require
stopping at each marker, and pay A$1,200. Walking circuits offer A$450. Every
third local completion adds A$500. Teleporting/changing vehicles cancels jobs;
walking circuits require remaining on foot. The new choices supplement the
existing vehicle-specific professions, races and wider coast exploration.

## Beach and water

Real mapped natural-beach polygons receive textured sand/grain/shell detail.
Nearby water has a bounded 80×80 grid with moving wave heights/normals and
shoreline foam. Wave geometry is conservatively inset 7.5 m from actual water
boundaries, so waves do not wash through the land. A spatial shoreline index
keeps this bounded; the patch recentres as the player moves and is disabled
high above ground in aircraft. Distant mapped water remains lightweight.

## Validation

`node tests/v18.cjs` checks shorter ground render budgets and actual nearby
geometry, the escape window, keyboard exit, survival away from the explosion,
near-blast death, damage-preserving re-entry, local job completion/payment,
walking jobs, longer aircraft views, animated water confined to water, and
real beach detail. Existing crash, component, thermal and two-client multiplayer
checks were rerun with the longer ground-fire timer and new public endpoints.

Results: 12 neighbourhood/escape/water browser checks, 15 crash/handling browser
checks, 17 component-damage browser checks, 15 two-client public-room browser
checks, 9 component-model checks and 6 temperature checks passed. Browser
runs reported no unexpected page errors. The coast check found actual sand
geometry and 12,772 animated water triangles with upward normals, foam depth
separation and all used water vertices outside the conservative shore margin.
