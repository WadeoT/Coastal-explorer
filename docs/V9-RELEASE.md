# V9 — Online Lobby

26 October 2026. Retains V8's 18 vehicles, rescue flight, game airspace, jobs, skill rewards, component damage and real Sunshine Coast map.

## Automatic multiplayer

On a relay-configured site, the client joins a public lobby automatically on load. DRIVE / LAUNCH waits for an actual server welcome before selecting the vehicle. If disconnected while driving, the game pauses, clears controls, reconnects with backoff and resumes the existing vehicle/damage/job state. It does not silently launch solo. The lobby displays connection attempts, the roster, retry, change server and return-to-garage controls.

The relay URL comes from the site's public build setting, its own server origin, an invite, or the remembered server. Public invites to a full or expired public room find an available public lobby. Separate tabs receive distinct identities instead of repeatedly failing with a duplicate-session handshake error; a reconnect keeps its issued identity. Server roster packets include connected players before vehicle selection.

**A live internet relay has not been provisioned in the user's account.** GitHub Pages serves files and cannot create a WebSocket service. A GitHub/Netlify client with no relay configured now waits at the setup gate, as requested, rather than providing an apparently online solo session. Follow [NETLIFY-MULTIPLAYER.md](NETLIFY-MULTIPLAYER.md) to host the supplied relay and connect the site. The map/runtime are bundled, but V9's normal Play flow requires that connection. Older V8 downloads retain their historical solo flow.

## Admin buttons

The panel shows whether it needs a server connection or private owner key. No user, including the first lobby visitor, receives owner privileges automatically. Once the relay verifies the key, use target selectors and buttons for:

- Set balance or gift money, with amount presets; wanted levels zero through five.
- Grant/select a vehicle; repair, individual component damage, fire, explosion, freeze/unfreeze and interceptors.
- Bring a player to your position, travel to a player, start a compatible job or cancel a job.
- Kick, ban, view banned identities and unban using a list.
- Time, weather, room capacity, reward multiplier, police and automatic weather.

The typed console is collapsed under Advanced. Buttons retain server-side authorization and bounds checks. Anonymous identity bans and client-side career/physics retain the limitations documented in V8; this update does not add account authentication or competitive anticheat. A deployed relay without `OWNER_ADMIN_TOKEN` keeps administration locked.

## Dashboard and gauges

Helicopter/aircraft switches are actual three-dimensional controls mounted beside the dashboard display. There is no floating aircraft button panel. Hover a switch to see its function, key and current state; click it to toggle. Existing keyboard shortcuts remain. Touching a switch also exposes its label. Fixed skids remain fixed; rescue variants have retractable wheels.

The physical fluid monitor is larger and placed so the main display does not cover its values. Main cockpit instrument textures use 1024 × 512 resolution. FPV corner readings have separate high-contrast rows for oil pressure, oil temperature, coolant/engine temperature, fuel and fluid levels. The monitor remains hidden in third person. Rescue cards no longer show a nonnumeric power figure.

## Maps and failure handling

Cyan player icons, red police diamonds and interceptor markers show current network/simulation positions on both maps. Minimap edge arrows show distant contacts' bearing and distance; labels distinguish nearby contacts. Full-map positions refresh while the map is open. The legend explains the colours.

Both simulation and rendering exceptions now pause safely in an HTML error panel with Copy Error Report, Return to Garage and Reload buttons. Garage recovery bypasses the ordinary wanted-level entry restriction, preventing a crash handler from leaving the game repeatedly failing during a pursuit. Reports contain version/context/stack information, with URL queries removed, and no owner/session credentials. Startup failures no longer automatically blame WebGL for every error.

The user withdrew the unidentified error report during this work; this release does not claim to diagnose an error message that was never supplied. The tests deliberately throw a render exception to verify the new recovery path.
