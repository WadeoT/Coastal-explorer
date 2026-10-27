## V19 public connection update

The default public lobby now connects to `wss://public.cloud.shiftr.io` on standard HTTPS port **443** (documented anonymous demo MQTT login `public` / `public`), with HiveMQ 8884 and EMQX 8084 as simultaneous backups. These credentials are public demo access, not an owner key. Two-client subscribe/publish/receive passed on the actual Internet in [the read-only diagnostic](https://github.com/WadeoT/Coastal-explorer/actions/runs/40447536416). The browser regression also verifies both players join when both nonstandard ports are blocked. Public test services remain best effort and are not an authoritative game server. A browser or network blocking all WebSockets still cannot connect; driving remains available locally and player counts stay honestly unknown. Everyone should load V19.

> V14: public free roam now automatically uses public MQTT test relays when
> no dedicated server URL is configured. You do not need this hosting setup
> to try playing with a mate. Use MULTIPLAYER → CREATE FRIENDS ROOM and share
> the invite. Public brokers are best effort; shared moderation still requires
> the optional dedicated server described below. See [V14](V14-RELEASE.md).

# Host the game on Netlify with public multiplayer

The repository includes Netlify configuration. You do not need to upload the 32 MB HTML manually. Netlify serves the browser game; a separate Node service maintains persistent WebSocket rooms. No site or relay has been deployed to your accounts from this workspace.

## Simplest: one Render address for both game and server

1. Create/sign into a Render account and connect GitHub.
2. [Deploy this blueprint](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer), selecting branch **codex/sunshine-coast-game** and the included free service.
3. Wait for its deploy to become healthy, then open and share the actual HTTPS address Render assigns. That address serves the full game and automatically connects to its own public lobby. No Netlify build setting is needed for this option. The free service can take time to wake.

The game's Multiplayer panel also includes this hosting link. If using Netlify for the frontend, continue below.

## 1. Create the Netlify site

1. In Netlify, choose **Add new project → Import an existing project → GitHub**.
2. Select **WadeoT/Coastal-explorer**, branch **codex/sunshine-coast-game**.
3. Keep the repository settings: build command `python3 scripts/build.py && python3 scripts/site.py`, publish directory `site`.
4. Deploy. The site opens at the actual `https://your-assigned-name.netlify.app` URL Netlify gives you. You can rename it in Netlify.

[Open Netlify import](https://app.netlify.com/start/deploy?repository=https://github.com/WadeoT/Coastal-explorer). Check the branch if the import screen asks. V13 plays locally immediately; a configured relay joins automatically in the background.

## 2. Deploy the multiplayer relay

[Deploy the included Render blueprint](https://render.com/deploy?repo=https%3A%2F%2Fgithub.com%2FWadeoT%2FCoastal-explorer). Select branch `codex/sunshine-coast-game` if asked. A Render account is separate from Netlify. Another Node host supporting long-lived WebSockets can run the same service.

The blueprint runs `node server/relay.cjs` with Node 22. Its `/health` response should show protocol 2 and `ownerConfigured: true` with the default code or a configured override. The service also serves the game at its own HTTPS root, automatically using itself as relay.

The requested admin code is **`Iamsteve`**. Open ADMIN and enter it. Local controls work without a relay; the default relay accepts the same code for server administration. Anyone who knows it can unlock it.

For an optional different shared-server code, generate a private value on your own computer with `node scripts/create-owner-key.cjs`, then set the relay's private `OWNER_ADMIN_TOKEN` environment variable. Overrides need at least eight characters. Do not put a private override in Netlify's public build settings or shared links. The local game code remains `Iamsteve`; the override controls shared-player/server privileges. The Render blueprint no longer requires you to invent a key merely to create the service.

Optional relay variables:

| Variable | Purpose |
| --- | --- |
| `PORT` | Supplied by most Node hosts; defaults to 8080 locally. |
| `ALLOWED_ORIGINS` | Comma-separated exact frontend origins, e.g. your Netlify origin and `https://wadeot.github.io`; include the relay's own origin if playing there. |
| `COASTAL_DATA_FILE` | Full path to a JSON state file on durable storage. Defaults to `server/.coastal-data/state.json`. |

The free Render blueprint has no persistent disk. A process restart can preserve files, but redeploying/recreating the service can lose identities, bans, queued gifts and settings. Use a host with durable storage or an explicitly configured persistent volume if those must survive redeploys. The blueprint does not silently select a paid plan. Keep the state file private and backed up. A sleeping free service can take time to wake before joining.

## 3. Connect Netlify to the relay

1. Copy the relay's actual HTTPS root URL from its hosting dashboard.
2. In the Netlify site's environment variables, add **`COASTAL_RELAY_URL`** with that URL. This URL is public; it is not the owner key.
3. Trigger a new production deploy. This embeds the public URL into the standalone HTML.
4. Open the Netlify site, choose a vehicle and **DRIVE / LAUNCH**. Multiplayer should report a public room. A second browser on the same site joins an available room automatically. Disconnects retry in the background and do not pause driving.

Share your actual Netlify site URL with friends. If you are using GitHub Pages instead, enter the HTTPS relay URL in Multiplayer and share the generated relay-configured invite. Sending the GitHub link alone, without any configured relay, does not create a server; V13 continues in clearly labelled local play.

## Owner testing

Use ADMIN, enter the admin code, and select **My player**, **All connected players** or a player in the target dropdown. The panel has wanted stars, set money, component damage, fire, explosion, repair and freeze controls. Examples in the typed console:

```text
cash 5000000
gift me 100000
wanted me 5
action all wanted 0
action me vehicle lifeflight
action me interceptors
action me damage radiator 80
action me repair
settings rewardMultiplier 2
settings policeEnabled off
settings autoWeather off
weather clear
time 14
players
ban PLAYER_ID reason
unban PLAYER_ID
```

`players` lists IDs across connected rooms. Keys are verified on the server, not embedded in JavaScript. Shared-server admin login requires HTTPS/WSS except localhost. Anonymous identities are not account authentication; a new browser identity can bypass a ban. Normal career money and physics remain client-side, so do not treat the relay as competitive anticheat.
