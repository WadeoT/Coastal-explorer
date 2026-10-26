# V10 — Air Control

26 October 2026. Restores immediate play and adds stronger flight policing, nose-only interceptor weapons, game ATC, scenery collisions and damage warnings.

## Play and admin are usable without a server

DRIVE / LAUNCH starts the selected vehicle immediately. A missing or unreachable relay never blocks Play. If a relay is configured through the site, invite or saved setting, it joins automatically and retries in the background. Disconnections no longer pause driving. The badge distinguishes local play from a connected room. Internet multiplayer still requires a hosted relay; no public relay or Netlify account deployment is claimed here.

Open **ADMIN**, enter **`Iamsteve`**, and click **UNLOCK ADMIN**. Your own money, wanted, vehicle, repair, damage, job and environment controls work locally with no server. Incorrect codes leave the panel locked. The code input clears after use. Damage buttons now work on your own vehicle while the admin dialog pauses the simulation.

New relay deployments use `Iamsteve` by default. An optional `OWNER_ADMIN_TOKEN` overrides the relay's code for shared-player/server administration. Local controls still accept the requested game code. Shared-player moderation requires an authenticated connection; an offline client cannot ban a real remote player. Anyone who knows this public code can unlock it. It is a code gate, not proof of the owner's account identity. Server-side authorization, bounds checks, gift acknowledgements and identity persistence remain.

## Airspace and pursuit

Wanted thresholds are now 18 / 55 / 110 / 190 / 300 heat. Sustained speeding begins raising heat after three seconds, at a higher rate. Airspace violations have an eight-second spawn grace and a 1.5-second warning, then add 22–42 heat per second depending on the zone. Persistent airport violation reaches five stars much sooner.

At two stars, an airborne suspect can attract an actual police helicopter. It follows at a bounded speed; it does not teleport beside the player. Airport gameplay radar tracks aircraft above 30 m near the marked zones. Interceptors extend visual tracking at five stars. Aircraft escape requires 45 seconds out of detection, or 65 at five stars, rather than the short ground timer. Landing, cover and leaving coverage remain ways to break detection. The minimap also shows police air support.

Fighter cannon fire starts at the actual model nose and travels along the fighter's forward axis. A four-degree firing cone, range, line-of-sight checks and an actual collision ray gate hits. It cannot swivel its weapon sideways or shoot backward. AI leads the target with its steering, flies past at close range and uses short bursts. It can fire from directly behind a target when its nose is actually aligned; being alongside the player is not a valid shot.

## ATC landing request

Use **ATC · REQUEST LANDING** in an aircraft. A selected map pin is the target; otherwise the request applies below the aircraft. The process is:

1. Transmit and wait for acknowledgement.
2. Review the target's terrain, buildings, access, airspace, weather, pursuit state and nearby aircraft.
3. Receive approval, an eight-second traffic hold (up to two holds), or a refusal with its reason.

Approval lasts 120 seconds and applies within 220 m of the chosen site. It exempts the matching local airport zone and the local urban landing minimum, not the whole coast or general altitude ceiling. It expires and must be requested again. A successful touchdown is recognized using actual height above the landing surface as well as speed/ground contact.

Water, undesignated building roofs, unsafe slopes, private/protected grounds, severe storms and high-priority pursuits can be refused. Fighter requests need an airfield zone. Military training exclusion does not provide a civilian landing slot. Missions can carry dispatch clearance. Landing sites, zone boundaries and clearance decisions are gameplay approximations, not official aviation permissions.

## Collisions, crashes and warnings

The collision system sweeps through movement instead of checking only the final position. Buildings keep polygon contact including courtyards and their full sloping foundations. Generated tree trunks, visible canopies, roadside poles, buildings, vehicles and players have contact enabled; terrain, road, bridge and shoreline contact remain. Nearby object lookup uses a spatial grid. Player collisions start enabled and their normal setting cannot be switched off; the code-unlocked advanced noclip command remains available for testing.

Fast car impacts deform the actual mesh and leave a fatal solid wreck without the previous bounce. Aircraft can strike walls and roofs; a damaged aircraft enters falling/tumbling crash motion, and a roof wreck stays on its struck roof instead of snapping down to the terrain. Boat and aircraft models also participate in severe solid-impact deformation. This is arcade deformation and crash motion, not a soft-body physics solver. Invisible objects absent from the source data cannot have surveyed collision geometry.

Danger cards show a warning symbol or vehicle schematic with the affected component marked. Engine failure, low oil pressure, overheating, leaks, critical driver injury, fuel fire and crashes produce explicit titles and details. Critical alerts have priority. Repair clears resolved damage warnings. ATC refusals and private-ground entry use warning cards too.

## Restricted ground

Cars/bikes entering off-road residential grounds, industrial yards, construction/military land or protected recreational areas receive a warning and then trespass heat. Public road corridors remain legal, so driving through a suburb or past a factory does not itself cause a wanted level.

The embedded snapshot does **not** contain a full property-cadastre or access-tag database. These gameplay restrictions use the retained mapped landuse and any available access tags. They are not a legal ownership survey; no individual homeowner's boundary or access permission is invented as verified data. The original map archive and measured terrain are unchanged.
