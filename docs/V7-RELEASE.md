# V7 — Damage + Drive

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=7

The showroom identifies this release as **V7 · DAMAGE + DRIVE**. The client still includes the complete real Sunshine Coast snapshot and works without downloading map assets.

## Damage that affects the part struck

Bullets are traced through chassis-relative component volumes. A side shot into the engine, a low sump hit, a radiator hit, a rear tank hit and a shot through the driver's position have different results. The component volumes rotate with the vehicle. Walls block police bullets. Police firing retains the existing five-star/recent-aggression/short-range restrictions.

| Component | Consequence |
| --- | --- |
| Body | Local scars, dents and reduced vehicle integrity. Body destruction leaves a wreck. |
| Engine | Progressive power reduction; critical damage stops propulsion and engine audio. A failed engine can still coast. |
| Driver/rider | A direct lethal hit produces **WASTED**, disables control and ends the run, independently of body integrity. |
| Radiator/cooling system | Coolant leaks away, temperature rises under load, the engine loses power and can seize from overheating. |
| Oil system/sump | Oil leaks, pressure falls, and prolonged oil starvation can seize the engine independently of coolant temperature. |
| Fuel tank | Leaks; critical damage can ignite the vehicle. A burning vehicle with fuel can explode after a short delay. |

Fuel explosions and failure timings are cinematic gameplay approximations, rather than a real-world fuel/fire simulation. Electric bicycles do not have fictitious petrol, oil or coolant reservoirs. Air-cooled kart instruments mark coolant as unavailable.

The same component model is used for shooting ambient vehicles: engines/drivers can disable them, oil/cooling damage can cause delayed failures, and critical fuel damage can explode them. This release does not add network-authoritative player-versus-player shooting or replicated component/fire effects to the existing multiplayer relay.

## Crashes and wrecks

Impact speed and contact location determine body/component damage. Frontal impacts preferentially damage the engine and radiator; rear impacts threaten the fuel tank. Heavy impacts can ignite a wreck, injure the driver or lead to explosion. Small bumps do not automatically explode.

Damage displaces actual body vertices around the impact rather than simply shrinking the whole car. Impulses, a bounded ballistic bounce/tumble phase, debris, smoke, fire, explosion flash and darkened wreck materials make major crashes visible. Effects use fixed pools, and impact scars are capped at 24. This is an arcade collision/deformation model, not a detailed soft-body simulator.

A fatal run switches to a third-person wreck view and returns to the garage after approximately eight seconds. The destruction message updates if a burning wreck subsequently explodes. Opening/closing a menu cannot revive a killed driver. Selecting a vehicle respawns it with fresh components and fluids; recovery alone does not repair component damage. The existing solo/host `repair` admin command restores components, fluids, deformation and marks.

## Working cockpit instruments

An aftermarket-style engine monitor is mounted where the driver can see it. It shows live:

- Oil pressure in bar and oil temperature in °C.
- Coolant/engine temperature in °C.
- Oil, coolant and fuel levels as percentage bars.
- Leak, low-pressure, overheating, engine-failure and fire warnings.

The LandCruiser's main cluster also displays actual coolant temperature and oil pressure instead of decorative fixed bars. A compact status display remains visible in third person. Engine failure cuts the appropriate car/boat/jet propulsion and helicopter lift; cockpit values follow the same simulated state.

## Black/charcoal interface

Menus, showroom, workshop, HUD, settings, map, admin console and notifications use dark charcoal surfaces, light text and amber/red accents. Map canvases have a dark base. Upgrade controls, warnings and selectors retain readable contrast; paint choices still show their actual colours. The landscape is not recoloured by the UI theme.

## Source and builds

- `src/damage-model.js`: deterministic component health, fluids, temperature/pressure, ray/volume tests and impact severity.
- `src/vehicle-damage.js`: integration, hit marks, deformation, pooled effects, crash motion, instruments and repair/respawn state.
- `src/damage-ui.css`: interface theme and component status panel.
- Existing police, vehicle, collision, audio and UI systems route through these modules.

Build with `python3 scripts/build.py`, then `python3 scripts/package.py`. The new archive is `downloads/Coastal-Explorer-Offline-v7.zip`; previous version downloads are retained. See [verification](V7-VERIFICATION.md) for results and practical limits.

The genuine recorded LandCruiser turbo V8 asset and automatic public-server matchmaking remain outstanding from earlier requests. The existing sound is labelled synthesis, and reliable internet multiplayer still needs the supplied relay to be deployed. This damage/UI update does not claim to have completed those separate requirements.
