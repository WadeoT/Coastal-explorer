# V12 — Air Rescue + Combat

27 October 2026 (Australia/Brisbane).

[Play the hosted game](https://wadeot.github.io/Coastal-explorer/index.html?v=12). The same GitHub Pages address remains shareable; public multiplayer requires a configured server. For a single address serving both game and public lobby, deploy the included free Render blueprint and share its assigned HTTPS address. The Multiplayer panel includes a hosting link and instructions. No Render/Netlify service has been created in the user's account from this workspace.

## Temperatures

Engine load is filtered over time. Coolant/engine and oil temperatures respond gradually to load, RPM, airflow, weather and existing component/fluid damage. Healthy high-load operation stays controlled; damaged cooling and lubrication can still seize an engine. Releasing the accelerator cools the engine over time rather than snapping the gauge down.

The F18 uses the actual latched throttle setting instead of checking whether W is currently held. Afterburner increases oil/exhaust heat. Its physical and FPV corner gauge displays exhaust temperature; it no longer invents a liquid coolant tank. These are responsive game approximations, not manufacturer thermal specifications.

## F18 cannon and interceptor contact

Hold Space to fire a nose-mounted cannon. F also triggers one round. The projected sight follows the aircraft's forward axis; mouse look never redirects the gun. There are 578 rounds, a 12-per-second game firing rate, overheat lockout and cooling. Tracer/impact effects are capped and expire. Vehicle selection supplies a fresh loadout.

Rounds use actual scene rays up to 1,800 m. Solid scenery blocks shots. Interceptor body/wing/tail volumes take damage; five direct cannon hits disable an interceptor and send it into a falling wreck. Real traffic uses existing component damage. Hits on scenery show impact effects. This is local AI/traffic combat; it does not add authoritative multiplayer player-versus-player combat or building demolition.

Swept contact checks account for player/interceptor relative movement, body and wing volumes. Fast head-on contact causes actual vehicle crash damage and a wreck; parallel near misses do not. The existing collision setting is respected. Disabled aircraft stop firing.

## Ejection and extras

- **X** ejects a living F18 pilot. A dead pilot or parked jet cannot eject. A living pilot with an engine failure can.
- The pilot separates from the abandoned aircraft, which falls independently. The chute opens automatically after approximately 0.9 seconds and slows descent toward 5.2 m/s.
- **WASD** steers the parachute. The camera follows the pilot, not the abandoned jet. Mid-air recovery, garage entry and fighter firing are blocked. A hard landing can injure the pilot. On safe touchdown, **G** returns to the vehicle garage; wanted restrictions still apply. Water touchdown permits flotation/recovery.
- Other relay clients see the pilot and deployed chute instead of a flying F18. Pilot flight effects are distinct from aircraft state.
- **Z** spends two of twelve visual countermeasure flares. They briefly disrupt interceptor tracking and firing, with an eight-second recharge; they are not permanent immunity or a missile simulation.
- **GUNNERY RANGE** creates five orange target drones. Hit all five within 120 seconds for A$4,000 exactly once. Timeout/vehicle change removes the course without a reward. The local course grants nearby airport training permission; military restrictions remain. Misses directed toward the active course are training shots, while hitting scenery/traffic remains an offence.

## Repair pads and unarmed rescue aircraft

All civilian AS350 and LifeFlight/RACQ helicopters are unarmed. The inherited F attack returns without a shot/crime, Space cannot fire, and the mobile FIRE button and counterattack hint are removed for helicopters. Rescue controls, hoist, searchlight and dispatch clearance remain available.

An off-centre touchdown could also be blocked by a neighbouring roof slightly higher than the painted pad. Supported raised decks now clear nearby mapped roofs while keeping building collisions enabled. Roof calculations include inner courtyard rings, consistently with the building renderer.

The previous service gate demanded a position within 2.2 m of pad centre plus a matching old touchdown record. Pads now accept stable contact within the usable area (5.8 m from centre on the current pads). A good local touchdown enables service; missing, displaced or rough old records recover after 1.5 seconds of stable contact. Shallow hops update touchdown records without requiring a full takeoff. Merely hovering, keeping gear retracted or approaching below roof height does not qualify.

Approach prompts explain position, gear and contact requirements. ATC remains accessible near a workshop. An engine failure or overheated engine with full-looking component bars is still recognized as serviceable. Click REPAIR and remain stopped for six seconds. Departure cancels without charging; completion repairs and charges once. Entering the vehicle garage clears the timer and old workshop overlay. Fatal wrecks and active fires remain ineligible for ordinary service.

The source map, 250 localities, 28,596 retained building footprints and 32 mapped workshop locations remain unchanged. Nine game rooftop pads are still fictional additions to suitable real mapped workshop buildings.
