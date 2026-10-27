# V24 — Ride & Rank

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=24&publicRoom=COAST-PUBLIC

## Server competition

**LEADERBOARDS** in the header, or **SERVER HIGHSCORES** in the multiplayer dialog, opens the current room's community board. Overall XP is the sum of separate race, job, bike-trick, drift, speed-streak and pursuit XP. Road top speed and best banked bike combo are separate record categories. Career totals and current-server-session views are separate. Online status follows actual room presence; stale peers are not presented as online.

Career XP/identity/rank persist in this browser. Session counters reset when the room/connection identity changes and accumulate only while connected. Career XP can also be earned in Local Play. Previously seen room scores are remembered on this browser, bounded to 100 records per cached room; they are not an authoritative global database. A new browser does not automatically know every player who has ever used the public server.

Public MQTT/Nostr and direct/dedicated player-state messages carry the score summary alongside poses; presence packets can carry scores while a player is in the garage. Old clients without scores still participate in multiplayer. Snapshot handling validates finite bounded counters and recomputes totals, escapes names in the UI and never converts remote scores into cash or invokes admin handlers. Repeated records for the same saved career identity are deduplicated rather than summed. Public packets do not include wallet balances, gifts or admin secrets.

**These are self-reported community scores, not cheat-proof server-validated rankings.** Public relays do not validate the client's simulation or grant authenticated accounts. The UI says this explicitly. Dedicated relay compatibility is retained, but this update does not deploy an authoritative scoring backend or universal cloud save.

Newly earned gameplay supplies XP: completed activities, banked stunt combos and existing drift/speed/pursuit awards. Gifts and setting cash do not grant XP, and admin test/noclip states are excluded. Every 5,000 career XP grants a $1,000 milestone reward. Rank thresholds are Rookie, Silver (5,000), Gold (15,000), Platinum (50,000) and Legend (100,000). Existing cash, ownership, paint and upgrades are retained under the same career key; historical actions lacking score records are not assigned invented retrospective XP.

## Electric bikes and freeriding

Added five purchasable bikes, alongside the original commuter:

| Brand | Model | Game price |
|---|---|---:|
| Talaria | Sting R MX4 | $7,200 |
| Talaria | Sting Pro MX5 | $9,200 |
| Sur-Ron | Light Bee X | $6,800 |
| Sur-Ron | Ultra Bee | $11,500 |
| Stark | VARG EX | $22,000 |

Models use original procedural electric-moto geometry: two knobby wheels, rims/spokes/discs, frame, battery, motor/belt, forks, mudguards, seat, headlamp and bars, plus a helmeted riding character. Geometry dimensions, colour, power, mass and battery capacity vary by model. Wheels and rider meshes are batched to limit draw calls; wheel animation remains independent. All 24 catalogue models have rendered in-game preview images. Names identify the bikes being approximated; these are not licensed factory scans, certified specifications or copied Voltline assets. The design draws on electric-bike freeride/trick-game ideas.

Controls: **W/S** accelerator/brake, **V** wheelie, **B** stoppie, **hold/release Space** charged hop while moving, **Z** airborne whip, **hold Q** airborne spin. Electric bikes retain instant accelerator release, appropriate electric powertrain/audio behaviour and no fake oil/fuel gauges. They lean visually in turns. Hop height/vertical speed, wheelie/stoppie pose, air time, spin and landing checks form an arcade stunt system, not a two-wheel multibody simulator.

Tricks link into a pending combo; returning safely to normal riding banks XP and a bounded cash award. Hard/partial-spin landings or new damage drop the pending combo and can damage the bike. Idle wheelie key presses without movement earn no trick points. A **Freeride Session** activity asks for 600 banked trick XP within three minutes and 500 m of the starting area.

Motor/controller upgrades increase actual force/power; controllers increase the speed limit, batteries increase usable energy capacity, and brakes/tyres/suspension change handling. Energy is consumed during use and power falls near empty. Selecting/servicing a bike restores its initial charge; this is a simple gameplay battery system. Bike style kits add handguards/number plates/frame detail; wheel/graphics finishes are available too.

## Garage

The primary shop lists brands and filters visible models; search matches brand/model names and combines with **Owned only**. The model dropdown also groups by brand. All existing cars remain purchasable. The tuner has **PERFORMANCE** and **COSMETICS** tabs.

Added boost, transmission/differential, weight reduction and cooling packages. These change power/force, top speed, mass and thermal targets respectively; existing brakes, tyres, suspension and engine tuning remain. Added visible aero, front splitter/skirts, wheel finishes, graphics and emissive underbody strips. Aero gives a small grip bonus. Compatible upgrades are filtered by vehicle type; electric bikes do not purchase combustion engines, and aircraft/boats do not receive arbitrary car body kits.

Upgrades save per owned model and derive from an immutable stock profile, so repeated application does not compound the multipliers. Refreshing an active model preserves its component damage. Cosmetic appearance of another player's tuned car is not yet transmitted: remote models use their local stock profile, while bike poses and trick rotations are shared.

## Verification

`tests/v24.cjs` covers brand/model/ownership filters, all five bike purchases/models, tuning and saved effects, cosmetic geometry without mechanical repairs, moving wheelies, height return, charge/use, hop/whip/360 landings, bail damage, XP and milestone persistence, category totals, invalid counters, name escaping, admin-score exclusion, room-session resets and UI stability. The freeride activity is exercised through actual banked stunt progress.

`tests/public-relay.cjs` checks two isolated clients sharing category scores and new electric-bike meshes in addition to automatic room joining/reconnection, privilege isolation and signed fallback. Existing relay-owner, thermal and neighbourhood activity regression suites are also used. Protocol fixtures are not proof of public-internet availability; the separate external Chrome workflow probes actual public services.
