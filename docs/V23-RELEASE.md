# V23 — Neighbourhood Sessions

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=23&publicRoom=COAST-PUBLIC

## Cleaner road joins

Road marking and sidewalk strips now clip against the actual nearby same-level road corridors. This includes shared vertices inside OSM ways, not just source-way endpoints. T-junctions cut the entry-side footpath while preserving the opposite kerb. Straight source-way continuations remain continuous; bridges and tunnels are separated by layer. Actual walking paths also stop their concrete surface at carriageways, leaving mapped crossings/road paint to describe the crossing. Small asphalt join patches fill angular gaps.

Connected roundabout arcs are traced into closed rings. Widths are capped relative to the ring radius so widening cannot consume the centre; valid rings receive draped kerb/landscape islands. Unclosed or ambiguous rings are not assigned invented centres. Inferred sidewalks, frontage houses and parked cars are excluded from roundabouts. Random centre-road refuge islands were removed. Zebra markings now require mapped marking information and are deduplicated nearby; unknown crossing nodes no longer automatically become zebras. Inferred house corners are checked against carriageways to prevent frontage infill intruding into road joins. Nearby junctions are kept clear of inferred parked cars and lamps.

NPCs now transition only at actual near-matching shared nodes on the same level, including connections inside another way. They no longer pick arbitrary road endpoints within 18 m. Closed one-way roundabouts loop rather than reverse, with centred single-lane circulation and a 25 km/h target cap. Disconnected one-way ends hide/recycle an NPC safely instead of reversing illegally. This remains a simplified local traffic simulation, not complete signal-controlled traffic AI.

## More to do nearby

Open **ACTIVITIES**, or stop near a chequered **LOCAL EVENTS** board and press **F** while driving. The route generator follows connected public streets, respects one-way directions and keeps its course within approximately a kilometre of the local origin. Densely sampled source vertices do not turn into hundreds of overlapping checkpoints; race checkpoints are spaced around 65 m apart. The full connected route appears on the maps. An idle local-events pin is also shown.

- **Block Sprint:** drive to the marked start and stop for a three-second countdown. Complete the short course for bronze/silver/gold pay and a saved personal best. Starting the race does not teleport you.
- **Club Run:** a two-lap neighbourhood time trial, with separate personal-best storage and payment after both laps.
- **Clean Cruise:** four local stops, under 45 km/h, protecting the vehicle. Three continuous seconds speeding or more than six integrity points of new damage fail it.
- **Parcel Shift / Takeaway Dash:** four nearby stops with three-second service holds; the bike receives the takeaway variant.
- **Hardware Run:** utes and delivery trucks load supplies, make local stops and return. Utes retain visible tray cargo.
- **Local Rideshare:** compatible cars collect two passengers and make a nearby drop-off using the existing boarding/vehicle-protection system.

One of the sprint, precision and parcel activities receives featured +25% base pay on a three-minute gameplay rotation. The bonus is fixed when accepting a job. District progress persists locally: New Arrival → Regular after three completions → Local Legend after eight. The third and eighth completions each give a $500 rank bonus. Race medals add a payout multiplier. Vehicle changes, teleports, route jumps and existing failure rules still apply; job IDs prevent duplicate completion payouts.

Courses depend on the connected map data available locally. Areas without a suitable public-street return route keep the existing jobs instead of inventing off-road race links. Activities, AI traffic, payouts and district progress are local; public relays share player presence/poses, not authoritative shared races. Public-road laws remain active during events.

## Verification

`tests/v23.cjs` verifies crossing/T-junction clipping, bridge separation, straight way joins, split roundabout reconstruction and island width, genuine traffic connections and one-way looping, real bundled road geometry/course bounds, no-teleport staging/countdown, actual course completion/medals/PB/one-time payout, both club-run laps, precision failure, hardware loading/cargo cleanup, UI discovery, live NPC stepping, and offline browser stability.

The tested Mooloolaba course was approximately 976 m long and stayed within about 375 m of its local origin. The full included network yielded 609 valid roundabout groups; the initial scenery included six roundabout islands. These counts describe the bundled data and approximations, not a claim that every intersection has been surveyed or every possible junction defect is resolved.
