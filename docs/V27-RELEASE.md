# V27 — Smoother Coast

Play: https://wadeot.github.io/Coastal-explorer/index.html?v=27

## Performance and scenery

Balanced replaces Ultra as the starting quality. Sustained low frame rates lower rendering resolution gradually and disable expensive shadows. High/Ultra remain selectable. This is adaptive rendering, not a guarantee of a particular frame rate on every Mac.

Cars/buildings reuse procedural surface textures instead of generating and uploading a new texture for each material. Pooled textures survive individual vehicle and scenery disposal and release with the scene. Testing found seven shared texture variants during normal startup. Higher contrast earth patches, grass strokes and aggregate improve ground texture detail while retaining land-cover colours.

Bundled vehicle previews are encoded as compact WebP thumbnails when Pillow is available, while original PNG artwork is retained in the repository. The client falls from approximately 46.7 MB to 33.6 MB with the full 228-vehicle catalogue. Python builds without optional Pillow fall back to valid PNG previews at a larger size.

Ordinary streaming keeps the complete old neighbourhood visible until the complete replacement is ready. Early building/road publication is retained for first load and distant teleports. Ground refreshes begin roughly 190–430 m apart rather than every 65–130 m; building prediction and a scenery watchdog remain. Decoration stays centred on the current player, with fog aligned to the scenery boundary to soften distant transitions. Render distance still bounds visible objects.

## Multiplayer

Nearby police and interceptor snapshots from a pursued player now create visible, interpolated chase vehicles for friends and map contacts. At most six units are sent per player, with a global visual budget of 18. These copies are not a new authoritative shared AI server: the pursued client still simulates its own police chase, and ordinary NPC traffic remains local.

Remote-player movement predicts a short bounded distance from velocity and smooths corrections. Public relays prefer a primary route and use high-rate alternatives when a peer needs them; other routes send slower discovery/backup traffic. UI player lists no longer rebuild for every unchanged movement packet. Temporary packet gaps get a longer grace period before removing another player; genuine close messages still remove their rendered vehicle promptly.

Public relay availability is still controlled by third-party operators and network restrictions. Both friends should load V27 or newer for shared police and signed owner grants.

## Solo / offline

Choose **PLAY SOLO · OFFLINE** in the garage or **PLAY SOLO · DISCONNECT** in Multiplayer. This choice persists, closes transports, stops reconnects and keeps your saved career, local jobs and police. **PUBLIC MULTIPLAYER** or **JOIN PUBLIC SERVER** opts back into online play. The bundled map/runtime support local play without a map key or multiplayer service. Optional live Google imagery still requires its own internet service.

## Admin money / vehicles

The existing admin code unlocks your own player controls. It cannot safely establish ownership on an anonymous public broker. Public grants now use a pinned cryptographic public key; the matching private credential is supplied separately to the game owner and is never included in this repository, public HTML or downloadable game ZIP.

To use it:

1. Open ADMIN and import the private owner-key JSON under **Public lobby owner key** (or paste it in the private import box).
2. Select a currently connected player.
3. Use **GIFT MONEY**, **SET BALANCE**, **GIVE & SELECT VEHICLE** or a supported test action.
4. Read the delivery acknowledgement. A missing acknowledgement is reported rather than presented as success.

The key is kept in memory for the current tab; import it again after a reload. Keep the file private. Raw unsigned controls, wrong keys, modified signatures and replayed gifts are rejected. Recipient acknowledgements are signed by a key bound to that player's public identity. Automated tests use generated disposable keys, not the owner's credential.

Moderation and authoritative server settings still require a dedicated server with its own owner authentication; importing a community grant key does not turn public brokers into an authoritative server.

## Fuel leaks

Tank punctures now have an explicit gradual leak rate. When a leaking vehicle is near the ground and stopped/slow, leaked fuel accumulates into a visible glossy pool under the tank. Pools are bounded and last up to ten minutes or the hourly world cleanup; moving away/repairing does not erase an existing puddle immediately. An early fuel-leak alert warns the driver before a fire. Fuel pooling is a game effect, not a real-world fire-safety model.

## Verification

Chromium checks cover atomic scenery replacement, shared texture lifetime, adaptive rendering, solo persistence/no WebSockets, gradual fuel loss and visible pooling, police models and forged-admin rejection. Two isolated game clients verify money and vehicle delivery, signed acknowledgements, duplicate-gift protection, shared police/models/map contacts, ordinary movement and both public transport families. Dedicated-server owner and component-damage regressions are retained. The published download is checked against the tested HTML.
