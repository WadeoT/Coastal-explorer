# V22 — Coast in Colour

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=22&publicRoom=COAST-PUBLIC

## Map

The minimap and large map now use natural land-use colours for residential land, parks, forest, farmland, sand and water. The large map includes street-name labels when zoomed in. Existing map pan/zoom, contacts, airspace warnings, waypoints and travel selection remain active.

**SATELLITE / NATURAL** switches the optional online aerial layer and the offline colour map. Public Esri World Imagery is requested directly in the browser, without a user key. The map credits Esri, Maxar, Earthstar Geographics and the GIS User Community; image age and provider coverage vary. Tile coordinates follow Web Mercator, with Esri's level/row/column ordering. Missing, blocked, timed-out or CORS-restricted imagery leaves the natural map available; it never blocks driving. `?network=off` starts in natural mode without imagery requests.

Tile loading is limited to four concurrent requests, a 96-entry session cache, at most 32 tiles for a map view and six new nearby roof-sampling tiles per scenery pass. There is no coast-wide imagery download or bundled redistribution of provider tiles. Provider availability is independently checked by `scripts/probe-aerial-imagery.cjs` in the external Chrome workflow; the cloud workspace itself blocks direct requests to this provider.

## Houses

Mapped footprints retain their real positions. Houses now batch separately by brick, rendered plaster, weatherboard or block finish, and corrugated metal or roof tile finish. Wall UVs follow the vertical face, so brick courses and weatherboards no longer stretch vertically from a ground-plane projection. Textures have distinct joints, grain, courses, corrugation, fixings and variation. Window glass, frames and shade hoods now share one layout and foundation height, fixing the offset frames visible on older houses. Wall and roof colours vary independently; material/colour tags take precedence, including common named colours and three/six-digit hex values. Inferred frontage houses use the same varied deterministic appearance system.

Where readable aerial imagery is available, the game samples several pixels inside **mapped** building footprints for approximate roof colour. It rejects vegetation, water-coloured pixels and deep shadow, requires enough usable samples, and uses a median. Explicit mapped roof colours take precedence. Inferred homes are not treated as observed roofs. Samples refresh nearby geometry asynchronously without delaying entry into the game.

Aerial imagery is not a source of wall-level facade photographs or verified brick/cladding classifications. Wall finishes and roof materials remain inferred when tags are missing; aerial roof sampling supplies approximate colour only. Decorations, fences and sign placement are game approximations, not a surveyed Street View reconstruction.

## Fences and signs

Nearby residential properties gain timber/picket, masonry and metal fences, separate posts, rails/slats and stepped terrain contact. Each frontage leaves a 3.4 m driveway gap; colliders follow the fence spans instead of blocking that gap. Known workshops and entrances are excluded. Detail is bounded by the nearby ground rendering profile and uses shared batched materials.

Australian-style signs include circular speed-limit plates, green street-name blades, mapped house-number plaques, and stop/give-way controls where mapped nodes exist. Street names and house numbers come from map tags. Speed plates match the simulator's mapped/default speed limits. Regulatory sign positions, fences and inferred materials are decorative approximations; default speed limits are not a claim about a surveyed real road. Sign faces share a single texture atlas per local scenery build and are disposed with that scenery.

## Verification

`tests/v22.cjs` checks material/colour diversity, tag precedence, finite vertical-wall UVs, three fence styles with open driveways, shared sign geometry, geographic tile alignment, offline map colours, imagery overlay/roof sampling with a labelled test fixture, rejection of vegetation/infill samples, and map-layer switching without moving the view. Fixtures test the implementation, not live-provider reachability. Existing V21 gameplay and repair-pad checks are also run for regression coverage.
