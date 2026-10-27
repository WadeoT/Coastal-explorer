# V21 — Streets Alive

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=21&publicRoom=COAST-PUBLIC

## Handling and helicopter impacts

Ground cars fit pitch, roll and ride height to four independent wheel contacts. The old cross-slope roll sign was reversed. The chassis spring now follows the contact plane rather than only the centre terrain sample; wheel visual travel is computed in its tilted parent frame, rather than subtracting world Y from a local coordinate. Lost-wheel handling and component damage remain active.

Helicopter impacts use a dedicated bounded contact/tumble solver. Gravity, sliding, damping and orientation-dependent support persist until settled; the former 2.5-second reset no longer discards motion. Rotor rays check solid scenery while airborne and spinning; a strike removes lift. A tilted rotor can fail on ground contact. The impact solver marks the aircraft grounded after settlement. This remains an approximate game solver, not a certified helicopter crash model.

## On foot and taking vehicles

The on-foot character now has articulated leg/arm walking, running, idle, fall and swimming poses, grounded feet and movement-facing orientation. Remote players use the animated character too; fighter ejection retains its separate parachute actor.

**E** enters your nearby vehicle or takes a nearby slow/stopped NPC, parked or previously abandoned local vehicle. Civilian cars, commercial trucks and police cars are supported. NPC drivers flee; police-car theft keeps the police kit. Theft raises wanted level and preserves the person's health and source component state. Borrowed vehicles are not silently saved as owned purchases. The old vehicle is left behind as a bounded world object; its component fire can continue. Stolen source NPCs are suppressed and parked spawn keys prevent immediate copies. Population replenishment is capped; distant sources can be recycled.

This does not forcibly seize another real player's vehicle. Shared player ownership/control transfer requires an authoritative multiplayer server. Public relays continue to share player poses/presence; traffic, police, stolen local vehicles, houses, props and jobs remain local simulations.

## Fuller neighbourhoods

Added deterministic palms/eucalypts, clustered foliage, ground grasses and flowers, more parked cars, front verandas/awnings, weatherboard cladding, benches, bins and errand boards. Details are batched and limited to the nearby ground view. Air-to-foot exits return to the shorter ground detail profile. Nearby **F** errand boards start a local walking delivery with a $650 base reward using the existing completion checks. Workshop buildings/entrances are excluded from new facade and vegetation decoration so repairs remain accessible.

Mapped houses retain their actual stored footprint. One missing corner elevation now uses remaining valid terrain samples instead of deleting the whole building. Inferred houses can populate residential/living-street frontages without a formal residential land-use polygon; known park, woodland, beach, farm and non-residential land uses are excluded, as are overlaps with actual mapped footprints. Infill is deterministic, with varied heights/colours and hipped/gabled roofs. Known building material/colour/roof tags are retained where available.

**Missing footprint and facade data cannot supply exact real-world houses.** Inferred homes, architectural detail, gardens and vegetation are game decoration; this is not Google Street View imagery or a surveyed facade reconstruction.

## Verification

`tests/v21.cjs` covers four-wheel hill angles and return to level; tilted wheel travel; partial-elevation building retention; mapped footprint coverage; vegetation/props/boards; walking cycles and idle/feet; civilian/truck/parked/police hijacking; driver health/ownership/wanted behavior; physical errand-board interaction; rotor lift loss; helicopter motion after three seconds and settlement; and Mudjimba coverage. The checked Mudjimba area rendered all 112 available mapped footprints plus 572 inferred residential frontages. Counts depend on position and quality.

Additional checks verify existing rollovers, damage/repair, moving exits, repair pads and two-client public-relay behavior, including remote on-foot animation under the signed fallback with all MQTT routes blocked.
