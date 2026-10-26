# V13 — Street Pursuit

27 October 2026 (Australia/Brisbane). [Play the same hosted game](https://wadeot.github.io/Coastal-explorer/index.html?v=13).

## Wider streets and textured ground

Vehicle-road surfaces are wider by default. All real OSM centre lines and named routes remain in place. Source widths remain on each path; settings offers source, wider (1.3 scale) and extra-wide (1.5 scale) modes. Tracks receive a smaller increase; walking/cycling paths keep their own width. Inferred lane counts use the source width, so widening alone does not invent another lane. Traffic spacing, kerbs, lane paint, surface/contact queries and estimated frontage use the resulting game width. Civilian traffic and police use the same speed-limit defaults as the player display.

Every rendered DEM tile has repeating grass/earth/gravel detail. Colours vary across the included sand/woodland classes and mapped farmland, suburban, park and industrial land uses, with softer broad colour variation. Concrete paths and service decks also have grit detail. The textures are generated locally with no image-network dependency. Land-use colours are estimates, not satellite imagery; coast/water masks and measured terrain geometry stay unchanged.

## Speeding and arrest

The minimap shows the current limit and a red speeding warning. Limits use mapped speed tags with road-class defaults where absent (for example, 50 km/h residential and 20 km/h service roads). The display marks excess speed; enforcement allows a 5 km/h margin and 1.25 seconds of observation by a living police patrol within detection range and line of sight. Reports are spaced three seconds apart and add heat proportional to the excess. Unseen speeding remains marked illegal without inventing a witness. High-speed rewards remain risky illegal-driving rewards where applicable.

Police can now arrest a wanted driver who is stopped or moving very slowly on the ground. A visible officer approaches the driver's side. Remaining stopped within reach builds a four-second custody countdown; U signals surrender and shortens it to two seconds. Driving away or losing detection interrupts an incomplete arrest without a fine. Cover is respected. Innocent players, airborne players and games with police disabled cannot be arrested by this process.

Completed custody shows BUSTED, stops driving, cancels the current job/reward run, clears the pursuit and charges one game fine: A$250 plus A$250 per star, limited to the cash available. After eight seconds the player returns to the garage with purchases intact. Fine totals and arrest count persist in the existing career. These are fictional game enforcement rules.

## Unarmed civilians and the weapons bay

Civilian cars, bikes, boats and all rescue/civilian helicopters are unarmed. The old generic F attack and mobile FIRE action no longer fire from them. The fighter retains its actual nose-mounted cannon.

Select an owned F18 in the garage to use the Weapons bay:

| Upgrade | First level | Effect per level |
| --- | ---: | --- |
| Cannon ammunition | A$6,000 | +25% magazine capacity. |
| Cannon cooling | A$9,000 | +30% heat dissipation. |
| Countermeasure rack | A$4,000 | +4 defensive flares. |

There are three levels. Each successive level costs the base price multiplied by its level. Incompatible, unaffordable or maximum-level purchases are refused without charging. Levels persist in the existing save; launch applies the bought loadout. A level-one loadout carries 722 rounds and 16 flares and cools at 0.182 heat units/second versus the base 0.14. Civilian selection shows an unarmed explanation instead of weapon purchases.

All V12 features remain: load-based coolant/oil and jet exhaust temperatures, actual F18 cannon rays and interceptor collisions, ejection/parachute steering, flares, the gunnery challenge, unarmed rescue aircraft and working raised repair pads. Hosting is still the same static game URL; public shared rooms require an actual connected relay. No external hosting account/server has been created here.
